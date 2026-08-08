import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { createClient } from '@/lib/supabase-server'
import { sendOrderConfirmation } from '@/lib/email'
import { applyRateLimit } from '@/lib/security'
import { paymentVerifySchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 verifications per minute per IP
    const rateError = applyRateLimit(request, 20, 60_000)
    if (rateError) return rateError

    const body = await request.json().catch(() => null)
    const parsed = paymentVerifySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { reference } = parsed.data

    const result = await verifyPayment({ reference })
    const txn = result.data

    if (txn?.status === 'success') {
      const supabase = await createClient()
      const { data: order } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('paystack_reference', reference)
        .select()
        .single()

      if (order) {
        await sendOrderConfirmation({
          to: order.customer_email,
          customerName: order.customer_name,
          reference,
          amount: order.amount,
        }).catch(console.error)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}