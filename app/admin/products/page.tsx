'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import type { Product } from '@/lib/supabase'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/products')
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteProduct(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    setProducts(p => p.filter(x => x.id !== id))
  }

  async function toggleStock(product: Product) {
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...product, in_stock: !product.in_stock }),
    })
    if (res.ok) setProducts(p => p.map(x => x.id === product.id ? { ...x, in_stock: !x.in_stock } : x))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-accent text-primary px-4 py-2 rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition"
        >
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : (
        <div className="border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead className="bg-secondary/50 text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className={`border-t border-border ${i % 2 === 0 ? '' : 'bg-secondary/20'}`}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-sm" />
                    <span className="text-foreground font-medium">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-4 py-3 text-foreground">₦{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStock(p)}
                      className={`px-2 py-0.5 rounded-sm text-xs font-semibold transition ${
                        p.in_stock ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                      }`}
                    >
                      {p.in_stock ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="p-1.5 text-muted-foreground hover:text-accent transition"
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1.5 text-muted-foreground hover:text-red-400 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-12 text-sm">No products yet.</p>
          )}
        </div>
      )}
    </div>
  )
}
