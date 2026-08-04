import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')
  const secret = process.env.PAYSTACK_SECRET_KEY!

  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(rawBody)

  if (event.event === 'charge.success') {
    const { reference, customer, amount, metadata } = event.data

    const { data: order } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('paystack_reference', reference)
      .select()
      .single()

    if (order) {
      await sendOrderConfirmation({
        to: customer.email,
        customerName: order.customer_name ?? metadata?.customerName ?? customer.email,
        reference,
        amount: amount / 100,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}
