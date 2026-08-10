'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  size?: string
  color?: string
}

interface PaymentError {
  message: string
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
  const [paymentSuccess, setPaymentSuccess] = useState(false)

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

  useEffect(() => {
    // Load cart from localStorage
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        const cartItems = JSON.parse(saved)
        setItems(cartItems)
        if (cartItems.length === 0) {
          router.push('/cart')
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
      }
    } else {
      router.push('/cart')
    }

    // Check if returning from payment
    if (reference) {
      verifyPaymentReference(reference)
    }
  }, [reference, router])

  const verifyPaymentReference = async (ref: string) => {
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
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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

  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
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