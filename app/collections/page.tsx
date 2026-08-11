'use client'

import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { useState, useEffect, useCallback, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, type Product } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Reveal from '@/components/reveal'
import ProductImage from '@/components/product-image'
import { isOnSale, effectivePrice } from '@/lib/pricing'

export default function CollectionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <CollectionsContent />
    </Suspense>
  )
}

function CollectionsContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [cart, setCart] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('category'))
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    supabase.from('products').select('*').order('category')
      .then(({ data }) => { if (data) setProducts(data); setLoading(false) })
  }, [])

  useEffect(() => {
    async function loadCart() {
      if (user) {
        const res = await fetch('/api/cart')
        const data = res.ok ? await res.json() : []
        if (data.length > 0) {
          setCart(data); localStorage.setItem('cart', JSON.stringify(data))
        } else {
          const local = localStorage.getItem('cart')
          if (local) {
            const parsed = JSON.parse(local); setCart(parsed)
            await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: parsed }) })
          }
        }
      } else {
        const saved = localStorage.getItem('cart')
        if (saved) setCart(JSON.parse(saved))
      }
    }
    loadCart()
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch('/api/favorites').then(r => r.json()).then((ids: string[]) => setFavorites(new Set(ids)))
  }, [user])

  const saveCart = useCallback(async (updated: any[]) => {
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    if (user) await fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: updated }) })
  }, [user])

  const addToCart = (product: Product) => {
    if (!user) { window.location.href = '/login'; return }
    if (product.in_stock === false) { showToast('This item is currently out of stock'); return }
    if ((Array.isArray(product.sizes) && product.sizes.length > 0) ||
        (Array.isArray(product.colors) && product.colors.length > 0)) {
      window.location.href = `/products/${product.id}`
      return
    }
    const existing = cart.find(i => i.id === product.id)
    const updated = existing
      ? cart.map(i => i.id === product.id
          ? { ...i, quantity: i.quantity + 1, price: Math.min(i.price, effectivePrice(product)) }
          : i)
      : [...cart, { ...product, price: effectivePrice(product), quantity: 1 }]
    saveCart(updated)
    showToast('Added to cart')
  }

  const toggleFavorite = async (product: Product) => {
    if (!user) { window.location.href = '/login'; return }
    const isFav = favorites.has(product.id)
    const next = new Set(favorites)
    if (isFav) {
      next.delete(product.id)
      await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      showToast('Removed from favorites')
    } else {
      next.add(product.id)
      await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      showToast('Added to favorites')
    }
    setFavorites(next)
  }

  const categories = ['Haute Couture', 'Accessories', 'Jewelry']
  const filtered = selectedCategory ? products.filter(p => p.category === selectedCategory) : products

  return (
    <main className="min-h-screen bg-background">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="flex items-center gap-3 bg-[#111] border border-[#c9a84c44] px-6 py-3 shadow-[0_8px_32px_#00000080]">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-sm font-body font-light text-foreground tracking-wide">{toast}</span>
          </div>
        </div>
      )}

      {/* Page header */}
      <Reveal variant="fade-in" className="relative border-b border-[#1c1c1c] py-20 px-4 text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-24 bg-[#c9a84c06] blur-3xl pointer-events-none" />
        <p className="label-luxury mb-4">Shop</p>
        <h1 className="font-display font-light text-foreground"
          style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '0.02em' }}
        >
          Our Collections
        </h1>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mx-auto mt-6" />
      </Reveal>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Category filter */}
        <Reveal delay={150} className="flex flex-wrap gap-3 justify-center mb-16">
          {[{ key: null, label: 'All' }, ...categories.map(c => ({ key: c, label: c }))].map(({ key, label }) => (
            <button
              key={label}
              onClick={() => setSelectedCategory(key)}
              className={`px-7 py-2.5 text-xs font-body font-medium tracking-[0.15em] uppercase transition-all duration-300 btn-press ${
                selectedCategory === key
                  ? 'bg-accent text-[#080808]'
                  : 'border border-[#2a2a2a] text-[#8a8478] hover:border-[#c9a84c44] hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </Reveal>

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden border border-[#1c1c1c]">
                <div className="h-80 bg-[#111] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a84c08] to-transparent animate-[gold-shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                </div>
                <div className="p-5 space-y-3 bg-[#0d0d0d]">
                  <div className="h-2.5 bg-[#1c1c1c] rounded-full w-1/3" />
                  <div className="h-4 bg-[#1c1c1c] rounded-full w-2/3" />
                  <div className="h-3 bg-[#1c1c1c] rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-[#8a8478] font-body font-light py-24 tracking-wider">No products found.</p>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!loading && filtered.map((product, i) => (
            <Reveal
              key={product.id}
              delay={(i % 4) * 90}
              className="group border border-[#1c1c1c] bg-[#0d0d0d] overflow-hidden card-morph"
            >
              {/* Image */}
              <Link href={`/products/${product.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                <ProductImage product={product} className="absolute inset-0" />
                {isOnSale(product) && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 tracking-wider">SALE</span>
                )}
                {/* Out of stock */}
                {product.in_stock === false && (
                  <div className="absolute inset-0 bg-[#080808bb] flex items-center justify-center">
                    <span className="label-luxury border border-[#c9a84c44] px-4 py-2 text-[#8a8478]">Out of Stock</span>
                  </div>
                )}
                {/* Favorite */}
                <button
                  onClick={e => { e.preventDefault(); toggleFavorite(product) }}
                  className={`absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-[#080808cc] backdrop-blur-sm border transition-all duration-300 ${
                    favorites.has(product.id)
                      ? 'border-[#c9a84c55] text-accent'
                      : 'border-transparent text-[#8a8478] hover:border-[#c9a84c44] hover:text-accent'
                  }`}
                >
                  <Heart size={15} className={favorites.has(product.id) ? 'fill-accent' : ''} />
                </button>
              </Link>

              {/* Info */}
              <div className="p-5">
                <p className="label-luxury mb-2 opacity-60">{product.category}</p>
                <h3 className="font-display font-light text-foreground text-lg mb-3 leading-snug tracking-wide">{product.name}</h3>

                {/* Stars */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} className={`w-2.5 h-2.5 ${j < Math.floor(product.rating) ? 'text-accent fill-accent' : 'text-[#2a2a2a] fill-[#2a2a2a]'}`} viewBox="0 0 24 24">
                        <polygon points="12 2 15.09 10.26 24 10.26 17.55 16.16 19.64 24.42 12 18.51 4.36 24.42 6.45 16.16 0 10.26 8.91 10.26" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[10px] font-body text-[#4a4a44] tracking-wider">{product.reviews}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#1c1c1c]">
                  <div className="flex flex-col">
                    <p className="font-display font-light text-xl text-gold-gradient">₦{effectivePrice(product).toLocaleString()}</p>
                    {isOnSale(product) && (
                      <p className="text-xs text-muted-foreground line-through">₦{product.price.toLocaleString()}</p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.in_stock === false}
                    className="w-9 h-9 flex items-center justify-center bg-accent text-[#080808] hover:bg-[#e8c96a] transition-all duration-300 btn-press disabled:opacity-30 disabled:cursor-not-allowed"
                    title={product.in_stock === false ? 'Out of stock' : 'Add to cart'}
                  >
                    <ShoppingCart size={15} />
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
