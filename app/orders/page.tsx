import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Package } from 'lucide-react'
import Navbar from '@/components/navbar'
import OrdersPagination from '@/components/order/orders-pagination'

const PAGE_SIZE = 10

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, parseInt(page) || 1)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/track-order')


  // Query orders by user_id first (more reliable), falling back to email
  const from = (currentPage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let { data: orders, error, count } = await supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .or(`user_id.eq.${user.id},customer_email.eq.${user.email?.replace(/'/g, "''")}`)    
    .order('created_at', { ascending: false })
    .range(from, to)

  // If the user_id column doesn't exist yet, fall back to email-only query
  if (error && error.code === 'PGRST204') {
    const { data: emailOrders, count: emailCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .eq('customer_email', user.email)
      .order('created_at', { ascending: false })
      .range(from, to)
    orders = emailOrders
    count = emailCount
  }

  // Sort by created_at (desc) regardless of query path
  orders?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1

  const statusStyles: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    paid: 'bg-green-500/20 text-green-500',
    processing: 'bg-blue-500/20 text-blue-500',
    shipped: 'bg-purple-500/20 text-purple-500',
    delivered: 'bg-emerald-500/20 text-emerald-500',
    cancelled: 'bg-red-500/20 text-red-500',
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-4">My Orders</h1>

        {!orders?.length ? (
          <div className="text-center py-24 space-y-4">
            <Package size={48} className="text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No orders yet.</p>
            <Link href="/collections" className="inline-block bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block border border-border rounded-sm p-6 bg-secondary/30 space-y-3 hover:border-accent/50 hover:bg-secondary/50 transition group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground font-mono group-hover:text-accent transition">
                      #{order.paystack_reference ?? order.id}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusStyles[order.status ?? 'pending'] ?? 'bg-yellow-500/20 text-yellow-500'}`}>
                      {(order.status ?? 'pending').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-foreground">
                        {Array.isArray(order.items) && order.items.length > 0
                          ? `${order.items.length} item${order.items.length > 1 ? 's' : ''}`
                          : order.customer_name}
                      </p>
                      {Array.isArray(order.items) && order.items.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {order.items.slice(0, 2).map((it: any) => `${it.name}${it.size ? ` (Size ${it.size})` : ''}`).join(', ')}
                          {order.items.length > 2 ? ` +${order.items.length - 2} more` : ''}
                        </p>
                      )}
                    </div>
                    <p className="font-display font-bold text-accent">₦{Number(order.amount).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-NG', { dateStyle: 'long' })}
                    </p>
                    <span className="text-accent font-medium opacity-0 group-hover:opacity-100 transition">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <OrdersPagination currentPage={currentPage} totalPages={totalPages} />
            )}
          </>
        )}
      </div>
    </main>
  )
}