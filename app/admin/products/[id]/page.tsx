'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, ImagePlus } from 'lucide-react'
import { uploadProductImage } from '@/lib/upload-image'

const CATEGORIES = ['Haute Couture', 'Accessories', 'Jewelry']

const empty = {
  name: '', category: 'Haute Couture', price: '', image: '',
  description: '', rating: '5', reviews: '0', in_stock: true, sizes: '',
  colors: '', main_image_colors: '', imagesLines: '',
}

export default function ProductFormPage() {
  const router = useRouter()
  const params = useParams()
  const isNew = params.id === 'new'
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState<'main' | 'extra' | null>(null)

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${params.id}`)
        .then(r => r.json())
        .then(p => setForm({
          ...p,
          price: String(p.price), rating: String(p.rating), reviews: String(p.reviews),
          sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
          colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
          main_image_colors: Array.isArray(p.main_image_colors) ? p.main_image_colors.join(', ') : '',
          imagesLines: Array.isArray(p.images)
            ? p.images.map((im: any) => im.url + (Array.isArray(im.colors) && im.colors.length ? ` | ${im.colors.join(', ')}` : '')).join('\n')
            : '',
        }))
    }
  }, [params.id, isNew])

  function set(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleUpload(file: File | undefined, target: 'main' | 'extra') {
    if (!file) return
    setUploading(target)
    setError('')
    try {
      const url = await uploadProductImage(file)
      if (target === 'main') {
        set('image', url)
      } else {
        setForm(f => ({ ...f, imagesLines: f.imagesLines ? `${f.imagesLines.trimEnd()}\n${url}` : url }))
      }
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed — is the storage bucket set up? (see supabase/storage_setup.sql)')
    } finally {
      setUploading(null)
    }
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
      sizes: form.sizes ? form.sizes.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      main_image_colors: form.main_image_colors ? form.main_image_colors.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
      images: form.imagesLines
        ? form.imagesLines.split('\n').map((line: string) => {
            const trimmed = line.trim()
            if (!trimmed) return null
            const [url, tagPart] = trimmed.split('|').map(s => s.trim())
            if (!url) return null
            return {
              url,
              colors: tagPart ? tagPart.split(',').map((c: string) => c.trim()).filter(Boolean) : [],
            }
          }).filter(Boolean)
        : [],
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
            <label className="text-xs text-muted-foreground font-body">Main Image</label>
            <div className="flex gap-3 items-end">
              <input
                required
                className={field}
                value={form.image}
                onChange={e => set('image', e.target.value)}
                placeholder="https://..."
              />
              <label className="shrink-0 cursor-pointer inline-flex items-center gap-2 border border-border rounded-sm px-3 py-2 text-xs font-body text-muted-foreground hover:border-accent/50 hover:text-foreground transition">
                <Upload size={14} />
                {uploading === 'main' ? 'Uploading...' : 'Upload local file'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading !== null}
                  onChange={e => handleUpload(e.target.files?.[0], 'main')}
                />
              </label>
            </div>
            <p className="text-[11px] text-muted-foreground/60">Uploads are stored in your Supabase <code>product-images</code> bucket (see supabase/storage_setup.sql).</p>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">
              Main Image Colours <span className="text-muted-foreground/60">(comma-separated — which colours this photo shows. Leave blank to match every colour, e.g. Red, Black)</span>
            </label>
            <input className={field} value={form.main_image_colors} onChange={e => set('main_image_colors', e.target.value)} placeholder="Red, Black, Gold" />
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

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">
              Available Sizes <span className="text-muted-foreground/60">(comma-separated, e.g. XS, S, M, L, XL — leave blank for items without sizes)</span>
            </label>
            <input className={field} value={form.sizes} onChange={e => set('sizes', e.target.value)} placeholder="XS, S, M, L, XL" />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">
              Available Colors <span className="text-muted-foreground/60">(comma-separated, e.g. Red, Black, Gold — leave blank if not applicable)</span>
            </label>
            <input className={field} value={form.colors} onChange={e => set('colors', e.target.value)} placeholder="Red, Black, Gold" />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs text-muted-foreground font-body">
              Extra Images (one per line) <span className="text-muted-foreground/60">format: <code>URL | Color1, Color2</code> — the tag links an image to a color so it highlights when that color is selected</span>
            </label>
            <textarea
              rows={4}
              className={`${field} font-mono`}
              value={form.imagesLines}
              onChange={e => set('imagesLines', e.target.value)}
              placeholder={'https://example.com/red.jpg | Red\nhttps://example.com/black.jpg | Black'}
            />
            <label className="inline-flex cursor-pointer items-center gap-2 border border-border rounded-sm px-3 py-2 text-xs font-body text-muted-foreground hover:border-accent/50 hover:text-foreground transition">
              <ImagePlus size={14} />
              {uploading === 'extra' ? 'Uploading...' : 'Upload & append line'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading !== null}
                onChange={e => handleUpload(e.target.files?.[0], 'extra')}
              />
            </label>
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
            className="bg-accent text-[#0a0a0a] px-6 py-2 rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50"
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
