import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Package } from 'lucide-react'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-widest">
            REINE LUXE
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="text-sm text-muted-foreground hover:text-accent transition">
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">Order History</h1>

        {!orders?.length ? (
          <div className="text-center py-24 space-y-4">
            <Package size={48} className="text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Link href="/collections" className="inline-block bg-accent text-primary px-6 py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border rounded-sm p-6 bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground font-mono">{order.paystack_reference}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.status === 'paid' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {order.status ?? 'pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-display font-semibold text-foreground">{order.customer_name}</p>
                  <p className="font-display font-bold text-accent">₦{Number(order.amount).toLocaleString()}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
