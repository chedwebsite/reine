'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase-browser'
import { cartItemSchema } from '@/lib/validation'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface PaymentError {
  message: string
}

// Validates & normalizes the raw parsed cart array into well-formed CartItem[].
// Line-items that don't match the expected schema (older schemas, hand-edited
// storage, missing/negative quantities, non-numeric prices) are dropped instead
// of being persisted, and are reported through `dropped` so the customer knows
// the cart was cleaned.
function normalizeCartItems(raw: unknown): { items: CartItem[]; dropped: string[] } {
  const items: CartItem[] = []
  const dropped: string[] = []
  if (!Array.isArray(raw)) return { items, dropped }

  for (const entry of raw) {
    const parsed = cartItemSchema.safeParse(entry)
    if (!parsed.success) {
      const name =
        entry !== null &&
        typeof entry === 'object' &&
        typeof (entry as Record<string, unknown>).name === 'string'
          ? (entry as { name: string }).name
          : 'An item'
      dropped.push(`${name} (could not be loaded and was removed)`)
      continue
    }
    items.push({
      id: parsed.data.id,
      name: parsed.data.name,
      price: parsed.data.price,
      quantity: parsed.data.quantity,
      image: parsed.data.image,
      size: parsed.data.size,
      color: parsed.data.color,
    })
  }

  return { items, dropped }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')
  const { user } = useAuth()

  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [error, setError] = useState<PaymentError | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  // Set when the Supabase reconciliation query fails (network/RLS/schema error).
  // The payment form is blocked until reconciliation succeeds so checkout never
  // runs against a cart that couldn't be verified against live inventory.
  const [reconcileError, setReconcileError] = useState<string | null>(null)
  const [retryingReconcile, setRetryingReconcile] = useState(false)

  // Guard against state updates after unmount; shared by the initial cart load
  // and the manual "Try again" retry.
  const cancelledRef = useRef(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  })

  useEffect(() => {
    // Prefill email/name from the authenticated user (if logged in)
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: prev.email || user.email || '',
        fullName: prev.fullName || user.user_metadata?.full_name || user.user_metadata?.name || '',
      }))
    }
  }, [user])

  const verifyPaymentReference = useCallback(async (ref: string) => {
    try {
      setPaymentProcessing(true)
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: ref }),
      })

      const data = await response.json()

      if (data.data?.status === 'success') {
        setPaymentSuccess(true)
        // Clear cart
        localStorage.removeItem('cart')
        // Show success for 3 seconds then redirect
        setTimeout(() => {
          router.push('/order-confirmation?reference=' + ref)
        }, 3000)
      } else {
        setError({ message: 'Payment verification failed' })
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError({ message: 'An error occurred while verifying payment' })
    } finally {
      setPaymentProcessing(false)
    }
  }, [router])

  // Reconcile the localStorage cart against the live products table before
  // showing it. The cart can go stale (a product edited/deleted, or the
  // products table re-seeded after the item was added), and a stale id used
  // to surface as a confusing "out of stock" 400 at payment time. Items that
  // no longer exist or are out of stock are removed here and reported to the
  // customer so checkout never fails on them again.
  //
  // Supabase returns `{ data, error }`, but only `data` was read before, so a
  // network/RLS/schema failure was indistinguishable from "no products" and the
  // stale (possibly invalid) cart silently sailed through to payment. Now the
  // error is logged, and checkout is blocked with a "Try again" fallback until
  // reconciliation succeeds — failing closed instead of reintroducing the
  // stale-cart 400 at payment time.
  const loadCartForCheckout = useCallback(async (signal?: { cancelled: boolean }) => {
    const aborted = () => (signal ? signal.cancelled : cancelledRef.current)
    setReconcileError(null)
    const supabase = createClient()

    const reconcileCart = async (raw: CartItem[]) => {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, in_stock')

      if (error) {
        console.error('[Checkout] Failed to reconcile cart against products table:', error)
        throw new Error('We couldn\u2019t verify your cart against our current inventory.')
      }
      if (!products) {
        console.error('[Checkout] Cart reconciliation returned no data (and no error).', error)
        throw new Error('We couldn\u2019t verify your cart against our current inventory.')
      }

      const productById = new Map(products.map((p: any) => [p.id, p]))
      const removed: string[] = []
      const kept = raw.filter((item) => {
        const product = productById.get(item.id)
        if (!product) {
          removed.push(`${item.name} (no longer available)`)
          return false
        }
        if (product.in_stock === false) {
          removed.push(`${item.name} (out of stock)`)
          return false
        }
        return true
      })
      return { kept, removed }
    }

    // Load cart from localStorage
    const saved = localStorage.getItem('cart')
    if (!saved) {
      router.push('/cart')
      return
    }

    let parsedCart: unknown
    try {
      parsedCart = JSON.parse(saved)
    } catch (error) {
      console.error('[Checkout] Failed to parse stored cart, treating it as empty:', error)
      parsedCart = []
    }
    // A non-array stored value is cart corruption — never reconcile or persist
    // it. Reset the cart so a bad value can't be locked in or sent to the server.
    if (!Array.isArray(parsedCart)) {
      console.warn('[Checkout] Stored cart is not an array; resetting it.', parsedCart)
      localStorage.setItem('cart', '[]')
      router.push('/cart')
      return
    }
    if (parsedCart.length === 0) {
      router.push('/cart')
      return
    }

    // Validate & normalize every parsed line-item before it can touch
    // reconciliation or persistence. Items that don't match the cart schema are
    // dropped and reported rather than propagated to localStorage or the server.
    const { items: normalized, dropped: droppedInvalid } = normalizeCartItems(parsedCart)
    if (normalized.length === 0) {
      console.warn('[Checkout] Stored cart contained no valid items; resetting it.')
      localStorage.setItem('cart', '[]')
      router.push('/cart')
      return
    }

    let kept: CartItem[]
    let removed: string[]
    try {
      const reconciled = await reconcileCart(normalized)
      kept = reconciled.kept
      // Report dropped-invalid line-items the same way as reconciled removals so
      // the cleaned cart (with the invalid entries gone) is persisted and the
      // customer is told what happened.
      removed = [...droppedInvalid, ...reconciled.removed]
    } catch (error) {
      console.error('[Checkout] Cart reconciliation failed — blocking checkout until it recovers:', error)
      if (aborted()) return
      setReconcileError(
        error instanceof Error ? error.message : 'We couldn\u2019t verify your cart against our current inventory.'
      )
      // If the customer is returning from Paystack, still verify the payment —
      // it already happened server-side and must not be hidden by a temporary
      // products-query failure.
      if (reference) {
        await verifyPaymentReference(reference)
      }
      return
    }
    if (aborted()) return

    if (removed.length > 0) {
      // Persist the cleaned cart so the user doesn't re-trigger the error.
      localStorage.setItem('cart', JSON.stringify(kept))
      if (user) {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: kept }),
        }).catch(() => {})
      }
      setNotice(
        `Some items could not be ordered and were removed from your cart: ${[...new Set(removed)].join(', ')}.`
      )
    }

    if (kept.length === 0) {
      setItems([])
      router.push('/cart')
      return
    }
    setItems(kept)

    // Check if returning from payment
    if (reference) {
      await verifyPaymentReference(reference)
    }
  }, [reference, router, user, verifyPaymentReference])

  useEffect(() => {
    // Per-invocation cancellation so React StrictMode's double effect run does
    // not let the first (stale) run commit state updates.
    const signal = { cancelled: false }
    void loadCartForCheckout(signal)
    return () => {
      signal.cancelled = true
    }
  }, [loadCartForCheckout])

  const retryReconcile = async () => {
    if (retryingReconcile) return
    setRetryingReconcile(true)
    try {
      await loadCartForCheckout()
    } finally {
      setRetryingReconcile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Belt-and-suspenders: never let payment initialize against a cart that
    // failed reconciliation. The form is hidden in that case, but this keeps
    // the guarantee even if that screen is bypassed for any reason.
    if (reconcileError) {
      setError({ message: 'We couldn\u2019t verify your cart. Please use "Try again" before checking out.' })
      return
    }
    
    // Validate form
    if (!formData.email || !formData.fullName || !formData.phone || !formData.address) {
      setError({ message: 'Please fill in all required fields' })
      return
    }

    try {
      setPaymentProcessing(true)
      setError(null)

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const shipping = 50
      const tax = subtotal * 0.1
      const total = subtotal + shipping + tax

      // Initialize payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          amount: total,
          orderId: `order_${Date.now()}`,
          customerName: formData.fullName,
          items,
          userId: user?.id ?? null,
          shippingAddress: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            phone: formData.phone,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      if (data.data?.authorization_url) {
        // Redirect to Paystack checkout
        window.location.href = data.data.authorization_url
      } else {
        throw new Error('No authorization URL received')
      }
    } catch (err) {
      console.error('Payment error:', err)
      setError({
        message: err instanceof Error ? err.message : 'Failed to process payment',
      })
      setPaymentProcessing(false)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = items.length > 0 ? 50 : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  if (paymentSuccess) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground">Your order has been confirmed. Redirecting...</p>
          <Loader2 className="w-5 h-5 animate-spin text-accent mx-auto" />
        </div>
      </main>
    )
  }

  // Cart reconciliation failed (e.g. a Supabase network/RLS/schema error). The
  // stored cart may be stale and could fail at payment time, so block checkout
  // and let the customer retry after the momentary failure recovers. Safe
  // fallback: never run payment against a cart we couldn't verify.
  if (reconcileError) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center border border-red-500/30 bg-red-500/10 rounded-sm p-8 space-y-5">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.3 3.86l-8.93 15.5c-.7 1.22.18 2.64 1.53 2.64h17.8c1.35 0 2.23-1.42 1.53-2.64L13.7 3.86a1.75 1.75 0 0 0-3.4 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            We couldn&apos;t verify your cart
          </h1>
          <p className="text-sm font-body text-red-500">{reconcileError}</p>
          <p className="text-xs font-body text-muted-foreground">
            Your cart has not been changed. Please try again, or go back to your cart and continue shopping.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={retryReconcile}
              disabled={retryingReconcile}
              className="inline-flex items-center gap-2 bg-accent text-[#0a0a0a] py-3 px-6 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {retryingReconcile && <Loader2 size={18} className="animate-spin" />}
              {retryingReconcile ? 'Retrying...' : 'Try again'}
            </button>
            <Link
              href="/cart"
              className="text-sm font-body font-semibold text-muted-foreground hover:text-foreground underline underline-offset-4"
            >
              Back to cart
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {notice && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-sm">
                  <p className="text-amber-500 text-sm font-body">{notice}</p>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
                  <p className="text-red-500 text-sm font-body">{error.message}</p>
                </div>
              )}

              {/* Guest checkout notice */}
              {!user && (
                <div className="p-4 border border-accent/30 bg-accent/5 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm font-body text-foreground font-medium">
                      Checking out as a guest
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      No account needed. You can track your order with your email and payment reference.
                    </p>
                  </div>
                  <Link
                    href="/login"
                    className="shrink-0 text-xs font-body font-semibold tracking-wider uppercase text-accent hover:text-accent/80 border border-accent/40 px-4 py-2 rounded-sm hover:bg-accent/10 transition"
                  >
                    Sign in instead
                  </Link>
                </div>
              )}

              {/* Contact Info */}
              <div className="border border-border rounded-sm p-6 bg-secondary/30">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">

                  <div>
                    <label className="block text-sm font-body text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-body text-foreground mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-body text-foreground mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border border-border rounded-sm p-6 bg-secondary/30">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4">
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-body text-foreground mb-2">
                      Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body text-foreground mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-body text-foreground mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-body text-foreground mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentProcessing}
                className="w-full bg-accent text-[#0a0a0a] py-4 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {paymentProcessing && <Loader2 size={20} className="animate-spin" />}
                {paymentProcessing ? 'Processing...' : 'Pay with Paystack'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="h-fit">
            <div className="border border-border rounded-sm p-6 bg-secondary/30 space-y-4">
              <h2 className="text-lg font-display font-semibold text-foreground">Order Summary</h2>

              <div className="space-y-3 border-b border-border pb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={`${item.id}:${item.size || 'default'}:${item.color || 'default'}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name}
                      {item.size ? ` (Size ${item.size})` : ''}
                      {item.color ? ` (Color ${item.color})` : ''} × {item.quantity}
                    </span>
                    <span className="text-foreground">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">₦{shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="text-foreground">₦{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <span className="font-display font-semibold text-foreground">Total</span>
                <span className="font-display font-bold text-lg text-accent">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Payments securely processed by Paystack
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Already ordered?{' '}
                <Link href="/track-order" className="text-accent hover:text-accent/80">
                  Track your order
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}


export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CheckoutContent />
    </Suspense>
  )
}