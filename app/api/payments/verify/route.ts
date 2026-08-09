import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { createClient } from '@/lib/supabase-server'
import { sendOrderConfirmation, sendOrderStatusUpdate } from '@/lib/email'
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
        // Send order confirmation email
        console.log('[Email] Sending order confirmation to:', order.customer_email)
        try {
          await sendOrderConfirmation({
            to: order.customer_email,
            customerName: order.customer_name,
            reference,
            amount: order.amount,
          })
          console.log('[Email] Order confirmation sent successfully')
        } catch (emailError) {
          console.error('[Email] Failed to send order confirmation:', emailError)
        }

        // Send payment success status update email
        console.log('[Email] Sending payment success status update to:', order.customer_email)
        try {
          await sendOrderStatusUpdate({
            to: order.customer_email,
            customerName: order.customer_name,
            reference,
            status: 'paid',
          })
          console.log('[Email] Payment success status update sent successfully')
        } catch (emailError) {
          console.error('[Email] Failed to send payment success status update:', emailError)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}