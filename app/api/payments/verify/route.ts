import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    const result = await verifyPayment({ reference })
    const txn = result.data

    if (txn?.status === 'success') {
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
