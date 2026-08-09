import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { applyRateLimit } from '@/lib/security'
import { orderTrackSchema } from '@/lib/validation'
import { sendOrderStatusUpdate } from '@/lib/email'

/**
 * Public order lookup — no auth required.
 * Requires both Paystack reference AND customer email to prevent enumeration.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 lookups per minute per IP
    const rateError = applyRateLimit(request, 10, 60_000)
    if (rateError) return rateError

    const body = await request.json().catch(() => null)
    const parsed = orderTrackSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const reference = parsed.data.reference.trim()
    const email = parsed.data.email.trim().toLowerCase()

    const { data: order, error } = await supabase
      .from('orders')
      .select(
        'id, customer_name, customer_email, amount, paystack_reference, status, items, shipping_address, tracking_number, status_history, created_at'
      )
      .eq('paystack_reference', reference)
      .maybeSingle()

    if (error) {
      console.error('[API] Order track query error:', error)
      return NextResponse.json({ error: 'Unable to look up order' }, { status: 500 })
    }

    // Generic error — don't reveal whether reference or email was wrong
    if (!order || order.customer_email?.toLowerCase() !== email) {
      return NextResponse.json(
        { error: 'No order found with that reference and email combination.' },
        { status: 404 }
      )
    }

    // Send status update email on every track lookup
    sendOrderStatusUpdate({
      to: order.customer_email,
      customerName: order.customer_name,
      reference: order.paystack_reference,
      status: order.status ?? 'pending',
      trackingNumber: order.tracking_number ?? undefined,
    }).catch(console.error)

    // Return a safe public payload (no internal user_id)
    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.customer_name,
        // Mask email slightly for display (keep full for confirmation they own it)
        customerEmail: order.customer_email,
        amount: order.amount,
        reference: order.paystack_reference,
        status: order.status ?? 'pending',
        items: Array.isArray(order.items) ? order.items : [],
        shippingAddress: order.shipping_address ?? null,
        trackingNumber: order.tracking_number ?? null,
        statusHistory: Array.isArray(order.status_history) ? order.status_history : [],
        createdAt: order.created_at,
      },
    })
  } catch (error) {
    console.error('[API] Order track error:', error)
    return NextResponse.json({ error: 'Unable to look up order' }, { status: 500 })
  }
}
