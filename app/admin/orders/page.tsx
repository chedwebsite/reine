'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

const statusStyles: Record<string, string> = {
  pending:    'bg-yellow-900/40 text-yellow-400',
  paid:       'bg-green-900/40 text-green-400',
  processing: 'bg-blue-900/40 text-blue-400',
  shipped:    'bg-purple-900/40 text-purple-400',
  delivered:  'bg-emerald-900/40 text-emerald-400',
  cancelled:  'bg-red-900/40 text-red-400',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 20

  const loadOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)

    const res = await fetch(`/api/admin/orders?${params}`)
    if (res.ok) {
      const data = await res.json()
      setOrders(data.data ?? [])
      setTotalPages(data.pagination?.totalPages ?? 1)
      setTotal(data.pagination?.total ?? 0)
    }
    setLoading(false)
  }, [page, search, statusFilter])

  useEffect(() => { loadOrders() }, [loadOrders])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const res = await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: updated.status } : o))
    }
    setUpdating(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">{total} total</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by customer, email, or reference..."
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-sm text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s} className="bg-background text-foreground">{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <>
          <div className="border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm font-body">
              <thead className="bg-secondary/50 text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Customer</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.id} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-secondary/20'}`}>
                    <td className="px-4 py-3 text-foreground">{o.customer_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.customer_email}</td>
                    <td className="px-4 py-3 text-foreground">₦{o.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status ?? 'pending'}
                        disabled={updating === o.id}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        className={`px-2 py-0.5 rounded-sm text-xs font-semibold border-0 cursor-pointer disabled:opacity-50 ${statusStyles[o.status] ?? statusStyles.pending}`}
                      >
                        {STATUSES.map(s => (
                          <option key={s} value={s} className="bg-background text-foreground">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {o.created_at ? (
                        <span className="flex flex-col">
                          <span>{new Date(o.created_at).toLocaleDateString()}</span>
                          <span className="text-xs opacity-70">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">No orders found.</p>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-border rounded-sm text-sm text-foreground hover:bg-secondary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 border border-border rounded-sm text-sm text-foreground hover:bg-secondary/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}