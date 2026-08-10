'use client'

import { useEffect, useState, useCallback, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Heart, Search } from 'lucide-react'
import { supabase, type Product } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import Reveal from '@/components/reveal'
import ProductImage from '@/components/product-image'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(query)
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep input in sync when URL changes
  useEffect(() => { setInputValue(query) }, [query])

  // Load favorites
  useEffect(() => {
    if (!user) return
    fetch('/api/favorites').then(r => r.json()).then((ids: string[]) => setFavorites(new Set(ids)))
  }, [user])

  // Search products
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
      .then(({ data }) => { setResults(data ?? []); setLoading(false) })
  }, [query])

  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2500)
  }

  const addToCart = useCallback((product: Product) => {
    if (!user) { router.push('/login'); return }
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
  }, [user, router])

  const toggleFavorite = useCallback(async (product: Product) => {
    if (!user) { router.push('/login'); return }
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
  }, [favorites, user, router])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <main className="min-h-screen bg-background flex flex-col">

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-body font-semibold text-sm shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex-1 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 w-full">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto mb-12">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Search products, categories…"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-[#0a0a0a] rounded-sm font-display font-semibold hover:bg-accent/90 transition"
          >
            Search
          </button>
        </form>

        {/* Heading */}
        {query && (
          <Reveal variant="fade-in" className="mb-8">
            <p className="text-muted-foreground text-sm">
              {loading ? 'Searching…' : `${results.length} result${results.length !== 1 ? 's' : ''} for `}
              {!loading && <span className="text-foreground font-semibold">"{query}"</span>}
            </p>
          </Reveal>
        )}

        {!query && (
          <p className="text-center text-muted-foreground py-24">Enter a search term above to find products.</p>
        )}

        {/* Loading skeletons */}
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

        {/* No results */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <p className="text-muted-foreground">No products found for "{query}".</p>
            <Link href="/collections" className="inline-block text-accent hover:text-accent/80 font-body font-semibold">
              Browse all collections →
            </Link>
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {results.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 90} className="group border border-border rounded-sm overflow-hidden hover:border-accent transition">
                <Link href={`/products/${product.id}`} className="block relative h-72 overflow-hidden bg-secondary">
                  <ProductImage product={product} className="absolute inset-0" />
                  {product.in_stock === false && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold tracking-widest border border-white/50 px-3 py-1">OUT OF STOCK</span>
                    </div>
                  )}
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
                    <p className="text-lg font-display font-bold text-accent">₦{product.price.toLocaleString()}</p>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.in_stock === false}
                      className="p-2 bg-accent text-[#0a0a0a] rounded-sm hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>

    </main>
  )
}
