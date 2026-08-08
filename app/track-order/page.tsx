'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Search,
  Loader2,
} from 'lucide-react'
import Navbar from '@/components/navbar'

interface OrderItem {
  id?: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface TrackedOrder {
  id: string
  customerName: string
  customerEmail: string
  amount: number
  reference: string
  status: string
  items: OrderItem[]
  shippingAddress: {
    address?: string
    city?: string
    state?: string
    zip?: string
    phone?: string
  } | null
  trackingNumber: string | null
  createdAt: string
}

const STATUS_FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const STATUS_META: Record<string, { label: string; icon: React.ReactNode }> = {
  pending: { label: 'Order Placed', icon: <Clock size={18} /> },
  paid: { label: 'Payment Confirmed', icon: <CheckCircle2 size={18} /> },
  processing: { label: 'Processing', icon: <Package size={18} /> },
  shipped: { label: 'Shipped', icon: <Truck size={18} /> },
  delivered: { label: 'Delivered', icon: <CheckCircle2 size={18} /> },
}

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const [reference, setReference] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  // Prefill from query string (e.g. from confirmation page)
  useEffect(() => {
    const ref = searchParams.get('reference')
    const em = searchParams.get('email')
    if (ref) setReference(ref)
    if (em) setEmail(em)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim(),
          email: email.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Unable to find order')
        return
      }

      setOrder(data.order)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const status = order?.status ?? 'pending'
  const currentStep = STATUS_FLOW.indexOf(status)
  const isCancelled = status === 'cancelled'

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
            Track Your Order
          </h1>
          <p className="text-muted-foreground font-body max-w-md mx-auto">
            Enter the payment reference from your confirmation email and the email used at checkout.
            No account required.
          </p>
        </div>

        {/* Lookup form */}
        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-sm p-6 sm:p-8 bg-secondary/30 space-y-5 mb-10"
        >
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-sm">
              <p className="text-red-500 text-sm font-body">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="reference" className="block text-sm font-body text-foreground mb-2">
              Order / Payment Reference *
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. T123456789012345"
              className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
              required
              autoComplete="off"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-body text-foreground mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-[#0a0a0a] py-3.5 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Looking up…
              </>
            ) : (
              <>
                <Search size={18} /> Track Order
              </>
            )}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Have an account?{' '}
            <Link href="/orders" className="text-accent hover:text-accent/80">
              View all orders
            </Link>
          </p>
        </form>

        {/* Results */}
        {order && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Order Details</h2>
                <p className="text-sm text-muted-foreground font-mono mt-1">#{order.reference}</p>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                  isCancelled
                    ? 'bg-red-500/20 text-red-500'
                    : status === 'delivered'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-green-500/20 text-green-500'
                }`}
              >
                {status.toUpperCase()}
              </span>
            </div>

            {/* Timeline */}
            {!isCancelled ? (
              <div className="border border-border rounded-sm p-6 sm:p-8 bg-secondary/30">
                <h3 className="text-lg font-display font-semibold text-foreground mb-6">
                  Order Tracking
                </h3>
                <div className="flex items-center overflow-x-auto pb-2">
                  {STATUS_FLOW.map((step, index) => {
                    const meta = STATUS_META[step]
                    const isReached = index <= currentStep
                    const isCurrent = index === currentStep
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none min-w-[72px]">
                        <div className="flex flex-col items-center gap-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${
                              isReached
                                ? 'border-accent bg-accent/10 text-accent'
                                : 'border-border text-muted-foreground/40'
                            } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}
                          >
                            {meta.icon}
                          </div>
                          <span
                            className={`text-[10px] font-medium uppercase tracking-wider text-center ${
                              isReached ? 'text-accent' : 'text-muted-foreground/50'
                            }`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        {index < STATUS_FLOW.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 mb-6 transition ${
                              index < currentStep ? 'bg-accent' : 'bg-border'
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>

                {order.trackingNumber && (
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">Courier Tracking Number</p>
                    <p className="font-mono text-foreground font-semibold mt-1">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border border-red-500/30 bg-red-500/10 rounded-sm p-6 flex items-center gap-4">
                <XCircle size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-display font-semibold text-foreground">Order Cancelled</p>
                  <p className="text-sm text-muted-foreground">
                    This order has been cancelled. Contact support if you have questions.
                  </p>
                </div>
              </div>
            )}

            {/* Shipping */}
            {order.shippingAddress && (
              <div className="border border-border rounded-sm p-6 bg-secondary/30">
                <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-accent" /> Shipping Address
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="text-foreground font-medium">{order.customerName}</p>
                  {order.shippingAddress.address && <p>{order.shippingAddress.address}</p>}
                  {order.shippingAddress.city && <p>{order.shippingAddress.city}</p>}
                  {order.shippingAddress.state && <p>{order.shippingAddress.state}</p>}
                  {order.shippingAddress.zip && <p>{order.shippingAddress.zip}</p>}
                  {order.shippingAddress.phone && (
                    <p className="pt-2">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="border border-border rounded-sm p-6 bg-secondary/30">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">Items</h3>
              {order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={item.id ?? idx} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {item.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 object-cover rounded-sm"
                          />
                        )}
                        <div>
                          <p className="font-body font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-display font-semibold text-foreground">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Item details unavailable.</p>
              )}
            </div>

            {/* Summary */}
            <div className="border border-border rounded-sm p-6 bg-secondary/30 space-y-3">
              <h3 className="text-lg font-display font-semibold text-foreground mb-4">
                Order Summary
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Customer</span>
                <span className="text-foreground font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground font-medium">{order.customerEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground font-medium">
                  {new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-display font-semibold text-foreground">Total</span>
                <span className="font-display font-bold text-lg text-accent">
                  ₦{Number(order.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/contact" className="text-accent hover:text-accent/80 text-sm font-medium">
                Need help with this order? Contact Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <TrackOrderContent />
    </Suspense>
  )
}
