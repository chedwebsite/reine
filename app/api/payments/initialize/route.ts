import { NextRequest, NextResponse } from 'next/server'
import { initializePayment } from '@/lib/paystack'
import { createClient } from '@/lib/supabase-server'
import { sendOrderStatusUpdate } from '@/lib/email'
import { applyRateLimit } from '@/lib/security'
import { paymentInitializeSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 payment initializations per minute per IP
    const rateError = applyRateLimit(request, 10, 60_000)
    if (rateError) return rateError

    const body = await request.json().catch(() => null)
    const parsed = paymentInitializeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, amount, orderId, customerName, items, userId, shippingAddress } = parsed.data

    const result = await initializePayment({
      email,
      amount,
      orderId,
      customerName,
    })

    const reference = result.data?.reference
    if (reference) {
      const supabase = await createClient()

      // Use Paystack reference as the tracking number
      const trackingNumber = reference

      const { data: order } = await supabase.from('orders').insert({
        customer_email: email,
        customer_name: customerName,
        amount,
        paystack_reference: reference,
        status: 'pending',
        items: items ?? [],
        // Store the authenticated user's ID so orders can be tracked reliably
        user_id: userId ?? null,
        // Store shipping address on the order
        shipping_address: shippingAddress ?? null,
        // Use Paystack reference as tracking number
        tracking_number: trackingNumber,
      }).select().single()

      // Send order received email
      if (order) {
        console.log('[Email] Sending order received email to:', email)
        try {
          await sendOrderStatusUpdate({
            to: email,
            customerName,
            reference,
            status: 'pending',
          })
          console.log('[Email] Order received email sent successfully')
        } catch (emailError) {
          console.error('[Email] Failed to send order received email:', emailError)
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}