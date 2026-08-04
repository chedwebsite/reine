'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const CATEGORIES = ['Haute Couture', 'Accessories', 'Jewelry']

const empty = {
  name: '', category: 'Haute Couture', price: '', image: '',
  description: '', rating: '5', reviews: '0', in_stock: true,
}

export default function ProductFormPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${params.id}`)
        .then(r => r.json())
        .then(p => setForm({ ...p, price: String(p.price), rating: String(p.rating), reviews: String(p.reviews) }))
    }
  }, [params.id, isNew])

  function set(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const body = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
      reviews: Number(form.reviews),
    }
    const res = isNew
      ? await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch(`/api/admin/products/${params.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    if (res.ok) {
      router.push('/admin/products')
    } else {
      const d = await res.json()
      setError(d.error ?? 'Something went wrong')
      setSaving(false)
    }
  }

  const field = 'w-full px-3 py-2 bg-background border border-border rounded-sm text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-accent'

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground transition">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-3xl font-display font-bold text-foreground">
          {isNew ? 'Add Product' : 'Edit Product'}
        </h1>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">Name</label>
            <input required className={field} value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-body">Category</label>
            <select className={field} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-body">Price (₦)</label>
            <input required type="number" min="0" className={field} value={form.price} onChange={e => set('price', e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">Image URL</label>
            <input required className={field} value={form.image} onChange={e => set('image', e.target.value)} />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">Description</label>
            <textarea rows={3} className={field} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-body">Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" className={field} value={form.rating} onChange={e => set('rating', e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground font-body">Reviews count</label>
            <input type="number" min="0" className={field} value={form.reviews} onChange={e => set('reviews', e.target.value)} />
          </div>

          <div className="col-span-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="in_stock"
              checked={form.in_stock}
              onChange={e => set('in_stock', e.target.checked)}
              className="accent-accent w-4 h-4"
            />
            <label htmlFor="in_stock" className="text-sm font-body text-foreground">In Stock</label>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {form.image && (
          <img src={form.image} alt="preview" className="w-32 h-32 object-cover rounded-sm border border-border" />
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent text-primary px-6 py-2 rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </button>
          <Link
            href="/admin/products"
            className="px-6 py-2 rounded-sm text-sm font-display font-semibold border border-border text-muted-foreground hover:text-foreground transition"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
