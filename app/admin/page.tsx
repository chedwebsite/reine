'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag, TrendingUp, Plus } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 })

  useEffect(() => {
    async function load() {
      const [pRes, oRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/admin/orders'),
      ])
      const products = pRes.ok ? await pRes.json() : []
      const orders = oRes.ok ? await oRes.json() : []
      const revenue = orders.reduce((sum: number, o: any) => sum + (o.amount ?? 0), 0)
      setStats({ products: products.length, orders: orders.length, revenue })
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Products', value: stats.products, icon: Package, href: '/admin/products' },
    { label: 'Total Orders', value: stats.orders, icon: ShoppingBag, href: '/admin/orders' },
    { label: 'Revenue (₦)', value: `₦${stats.revenue.toLocaleString()}`, icon: TrendingUp, href: '/admin/orders' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-accent text-[#0a0a0a] px-4 py-2 rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="border border-border rounded-sm p-6 bg-secondary/30 hover:bg-secondary/60 transition space-y-3"
          >
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-body">{label}</span>
              <Icon size={18} />
            </div>
            <p className="text-3xl font-display font-bold text-foreground">{value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
