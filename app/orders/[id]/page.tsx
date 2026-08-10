import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronLeft, MapPin } from 'lucide-react'
import Navbar from '@/components/navbar'
import CancelOrderButton from '@/components/order/cancel-order-button'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
}

const STATUS_FLOW = ['pending', 'paid', 'processing', 'shipped', 'delivered']

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Order Placed', icon: <Clock size={18} />, color: 'text-yellow-500' },
  paid: { label: 'Payment Confirmed', icon: <CheckCircle2 size={18} />, color: 'text-green-500' },
  processing: { label: 'Processing', icon: <Package size={18} />, color: 'text-blue-500' },
  shipped: { label: 'Shipped', icon: <Truck size={18} />, color: 'text-purple-500' },
  delivered: { label: 'Delivered', icon: <CheckCircle2 size={18} />, color: 'text-emerald-500' },
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !order) notFound()

  // Security: only allow the owner (by user_id or email) to view this order
  const isOwner =
    (order.user_id && order.user_id === user.id) ||
    (!order.user_id && order.customer_email === user.email)

  if (!isOwner) notFound()

  const status = order.status ?? 'pending'
  const currentStep = STATUS_FLOW.indexOf(status)
  const isCancelled = status === 'cancelled'
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : []

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition mb-8">
          <ChevronLeft size={16} /> Back to My Orders
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Order Details</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              #{order.paystack_reference ?? order.id}
            </p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${isCancelled
              ? 'bg-red-500/20 text-red-500'
              : status === 'delivered'
                ? 'bg-emerald-500/20 text-emerald-500'
                : 'bg-green-500/20 text-green-500'
            }`}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Tracking Timeline */}
        {!isCancelled ? (
          <div className="border border-border rounded-sm md:p-8 p-3 bg-secondary/30 mb-8">
            <h2 className="text-lg font-display font-semibold text-foreground mb-6">Order Tracking</h2>
            <div className="flex items-center">
              {STATUS_FLOW.map((step, index) => {
                const meta = STATUS_META[step]
                const isReached = index <= currentStep
                const isCurrent = index === currentStep
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition ${isReached
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground/40'
                        } ${isCurrent ? 'ring-4 ring-accent/20' : ''}`}>
                        {meta.icon}
                      </div>
                      <span className={`text-[10px] font-medium uppercase tracking-wider text-center ${isReached ? 'text-accent' : 'text-muted-foreground/50'
                        }`}>
                        {meta.label}
                      </span>
                    </div>
                    {index < STATUS_FLOW.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-6 transition ${index < currentStep ? 'bg-accent' : 'bg-border'
                        }`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="border border-red-500/30 bg-red-500/10 rounded-sm p-6 mb-8 flex items-center gap-4">
            <XCircle size={24} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="font-display font-semibold text-foreground">Order Cancelled</p>
              <p className="text-sm text-muted-foreground">This order has been cancelled. Contact support if you have questions.</p>
            </div>
          </div>
        )}

        {/* Shipping Address */}
        {order.shipping_address && (
          <div className="border border-border rounded-sm p-6 bg-secondary/30 mb-8">
            <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-accent" /> Shipping Address
            </h2>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">{order.customer_name}</p>
              <p>{order.shipping_address.address}</p>
              {order.shipping_address.city && <p>{order.shipping_address.city}</p>}
              {order.shipping_address.state && <p>{order.shipping_address.state}</p>}
              {order.shipping_address.zip && <p>{order.shipping_address.zip}</p>}
              {order.shipping_address.phone && <p className="pt-2">Phone: {order.shipping_address.phone}</p>}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="border border-border rounded-sm p-6 bg-secondary/30 mb-8">
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Items</h2>
          {items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={item.id ?? idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-sm" />
                    )}
                    <div>
                      <p className="font-body font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size ? `Size: ${item.size} · ` : ''}Qty: {item.quantity}
                      </p>
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
          <h2 className="text-lg font-display font-semibold text-foreground mb-4">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span className="text-foreground font-medium">{order.customer_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span className="text-foreground font-medium">{order.customer_email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Order Date</span>
            <span className="text-foreground font-medium">
              {new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Reference</span>
            <span className="text-foreground font-mono text-xs">{order.paystack_reference}</span>
          </div>
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-display font-semibold text-foreground">Total</span>
            <span className="font-display font-bold text-lg text-accent">
              ₦{Number(order.amount).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Cancel Order - only for pending orders */}
        {status === 'pending' && !isCancelled && (
          <div className="mt-8 text-center">
            <CancelOrderButton orderId={order.id} />
            <p className="text-xs text-muted-foreground mt-2">
              You can only cancel pending orders.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/contact" className="text-accent hover:text-accent/80 text-sm font-medium">
            Need help with this order? Contact Support
          </Link>
        </div>
      </div>
    </main>
  )
}