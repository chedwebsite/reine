'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { supabase, type Product } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Reveal from '@/components/reveal'
import ProductImage from '@/components/product-image'

export default function SalePage() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('products').select('*').order('price')
      .then(({ data }) => {
        // Show bottom 40% by price as "on sale"
        if (data && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.price - b.price)
          setProducts(sorted.slice(0, Math.ceil(sorted.length * 0.4)))
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!user) return
    fetch('/api/favorites').then(r => r.json()).then((ids: string[]) => setFavorites(new Set(ids)))
  }, [user])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const addToCart = useCallback((product: Product) => {
    if (!user) { window.location.href = '/login'; return }
    try {
      const saved = localStorage.getItem('cart')
      const cart = saved ? JSON.parse(saved) : []
      const existing = cart.find((i: any) => i.id === product.id)
      const updated = existing
        ? cart.map((i: any) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...cart, { ...product, quantity: 1 }]
      localStorage.setItem('cart', JSON.stringify(updated))
      if (user) fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: updated }) })
      showToast('Added to cart')
    } catch {}
  }, [user])

  const toggleFavorite = useCallback(async (product: Product) => {
    if (!user) { window.location.href = '/login'; return }
    const fav = favorites.has(product.id)
    const next = new Set(favorites)
    if (fav) {
      next.delete(product.id)
      await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      showToast('Removed from favorites')
    } else {
      next.add(product.id)
      await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      showToast('Added to favorites')
    }
    setFavorites(next)
  }, [favorites, user])

  const salePrice = (price: number) => Math.round(price * 0.75)

  return (
    <main className="min-h-screen bg-background">

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-body font-semibold text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Reveal variant="fade-in" className="mb-12 text-center">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">LIMITED TIME</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">Sale</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Exclusive discounts on selected luxury pieces. Up to 25% off.
          </p>
        </Reveal>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-border rounded-sm overflow-hidden animate-pulse">
                <div className="h-72 bg-secondary" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-secondary rounded w-1/3" />
                  <div className="h-5 bg-secondary rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <p className="text-center text-muted-foreground py-24">No sale items at the moment. Check back soon!</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {!loading && products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) * 90} className="group border border-border rounded-sm overflow-hidden hover:border-accent transition">
              <Link href={`/products/${product.id}`} className="block relative h-72 overflow-hidden bg-secondary">
                <ProductImage product={product} className="absolute inset-0" />
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-sm">25% OFF</span>
                <button
                  onClick={e => { e.preventDefault(); toggleFavorite(product) }}
                  className={`absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-sm transition ${favorites.has(product.id) ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                >
                  <Heart size={20} className={favorites.has(product.id) ? 'fill-accent text-accent' : 'text-accent'} />
                </button>
              </Link>
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-semibold tracking-widest">{product.category}</p>
                <h3 className="text-lg font-display font-semibold text-foreground">{product.name}</h3>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <p className="text-lg font-display font-bold text-accent">₦{salePrice(product.price).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground line-through">₦{product.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.in_stock === false}
                    className="p-2 bg-accent text-[#0a0a0a] rounded-sm hover:bg-accent/90 transition disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </main>
  )
}
