import { NextRequest, NextResponse } from 'next/server'
import { initializePayment } from '@/lib/paystack'
import { createAdminClient } from '@/lib/supabase-admin'
import { sendOrderStatusUpdate } from '@/lib/email'
import { applyRateLimit, applySameOrigin } from '@/lib/security'
import { paymentInitializeSchema } from '@/lib/validation'
import { isOnSale } from '@/lib/pricing'

export async function POST(request: NextRequest) {
  try {
    // Fail fast if server-only secrets are missing. Local dev reads them from
    // .env.local; Vercel requires them under Project Settings → Environment
    // Variables and a redeploy. A missing value here surfaces as an opaque
    // "Payment initialization failed" 500, so report the missing names in the
    // server logs only — never leak internal configuration details to clients.
    const missingEnv = ['SUPABASE_SERVICE_ROLE_KEY', 'PAYSTACK_SECRET_KEY'].filter(
      (name) => !process.env[name]
    )
    if (missingEnv.length > 0) {
      console.error('[API] Payment initialization blocked — missing env var(s):', missingEnv.join(', '))
      return NextResponse.json(
        {
          error: 'Payment is temporarily unavailable. Please try again later.',
        },
        { status: 500 }
      )
    }

    // Rate limit: 10 payment initializations per minute per IP
    const rateError = applyRateLimit(request, 10, 60_000)
    if (rateError) return rateError

    // Same-origin (CSRF) check
    const originError = applySameOrigin(request)
    if (originError) return originError

    const body = await request.json().catch(() => null)
    const parsed = paymentInitializeSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, orderId, customerName, items, userId, shippingAddress } = parsed.data

    // ── Server-side price & stock validation ────────────────────────
    // Never trust client-supplied prices or stock status. The prices on the
    // cart come from localStorage (fully editable), so we recompute the
    // chargeable amount from the products table. This also blocks ordering an
    // item that has gone out of stock since it was added to the cart.
    const supabase = createAdminClient()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 })
    }

    const ids = [...new Set(items.map((i) => i.id))]
    const { data: productRows, error: productError } = await supabase
      .from('products')
      .select('id, name, price, sale_price, in_stock')
      .in('id', ids)

    if (productError) {
      return NextResponse.json({ error: 'Unable to validate cart items' }, { status: 500 })
    }

    const productMap = new Map((productRows ?? []).map((p: any) => [p.id, p]))

    const orderItems: Array<Record<string, unknown>> = []
    const unavailableItems: string[] = []
    for (const item of items) {
      const product = productMap.get(item.id)
      // Reject items that no longer exist in the catalog. This is separate from
      // the out-of-stock case so the customer gets an accurate message instead
      // of a confusing "out of stock" for a product the store doesn't sell.
      if (!product) {
        unavailableItems.push(
          `"${item.name}" is no longer available — please remove it from your cart`
        )
        continue
      }
      // Reject items that have gone out of stock since they were added.
      if (product.in_stock === false) {
        unavailableItems.push(`"${item.name}" is currently out of stock and cannot be ordered`)
        continue
      }
      const unitPrice = isOnSale(product) ? (product.sale_price as number) : product.price
      orderItems.push({
        id: item.id,
        name: product.name,
        price: unitPrice,
        quantity: Math.max(1, Math.floor(item.quantity)),
        image: item.image,
        size: item.size,
        color: item.color,
      })
    }

    // Report every problematic item at once so the customer can fix the cart in
    // a single pass instead of guessing one item at a time.
    if (unavailableItems.length > 0) {
      return NextResponse.json(
        { error: unavailableItems.join('; ') + '.' },
        { status: 400 }
      )
    }

    const subtotal = orderItems.reduce(
      (sum, i) => sum + (i.price as number) * (i.quantity as number),
      0
    )
    const shipping = orderItems.length > 0 ? 50 : 0
    const tax = subtotal * 0.1
    const amount = subtotal + shipping + tax

    const result = await initializePayment({
      email,
      amount,
      orderId,
      customerName,
    })

    const reference = result.data?.reference
    if (reference) {
      // Use Paystack reference as the tracking number
      const trackingNumber = reference

      const { data: order } = await supabase.from('orders').insert({
        customer_email: email,
        customer_name: customerName,
        amount,
        paystack_reference: reference,
        status: 'pending',
        items: orderItems,
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