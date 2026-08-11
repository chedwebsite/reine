import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendOrderConfirmation, sendOrderStatusUpdate } from '@/lib/email'

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

    // Use the service-role client so the server-to-server webhook can update
    // order status without relying on permissive anonymous RLS policies.
    const admin = createAdminClient()

    const { data: order } = await admin
      .from('orders')
      .update({ status: 'paid' })
      .eq('paystack_reference', reference)
      .select()
      .single()

    if (order) {
      // Send order confirmation email
      console.log('[Email] Webhook: Sending order confirmation to:', customer.email)
      try {
        await sendOrderConfirmation({
          to: customer.email,
          customerName: order.customer_name ?? metadata?.customerName ?? customer.email,
          reference,
          amount: amount / 100,
        })
        console.log('[Email] Webhook: Order confirmation sent successfully')
      } catch (emailError) {
        console.error('[Email] Webhook: Failed to send order confirmation:', emailError)
      }

      // Send payment success status update email
      console.log('[Email] Webhook: Sending payment success status update to:', customer.email)
      try {
        await sendOrderStatusUpdate({
          to: customer.email,
          customerName: order.customer_name ?? metadata?.customerName ?? customer.email,
          reference,
          status: 'paid',
        })
        console.log('[Email] Webhook: Payment success status update sent successfully')
      } catch (emailError) {
        console.error('[Email] Webhook: Failed to send payment success status update:', emailError)
      }
    }
  }

  return NextResponse.json({ received: true })
}
