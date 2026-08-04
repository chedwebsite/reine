'use client'

import { useEffect, useState } from 'react'

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

  useEffect(() => {
    fetch('/api/admin/orders')
      .then(r => r.ok ? r.json() : [])
      .then(data => { setOrders(data); setLoading(false) })
  }, [])

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
      <h1 className="text-3xl font-display font-bold text-foreground">Orders</h1>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
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
            <p className="text-center text-muted-foreground py-12 text-sm">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
