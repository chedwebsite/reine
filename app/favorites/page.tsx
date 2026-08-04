'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import { supabase, type Product } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'

export default function FavoritesPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user === null) { router.push('/login'); return }
    if (!user) return
    async function load() {
      const favRes = await fetch('/api/favorites')
      const ids: string[] = favRes.ok ? await favRes.json() : []
      if (ids.length === 0) { setLoading(false); return }
      const { data } = await supabase.from('products').select('*').in('id', ids)
      setProducts(data ?? [])
      setLoading(false)
    }
    load()
  }, [user, router])

  async function removeFavorite(id: string) {
    await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: id }) })
    setProducts(p => p.filter(x => x.id !== id))
  }

  function addToCart(product: Product) {
    const saved = localStorage.getItem('cart')
    const cart = saved ? JSON.parse(saved) : []
    const existing = cart.find((i: any) => i.id === product.id)
    const updated = existing
      ? cart.map((i: any) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, quantity: 1 }]
    localStorage.setItem('cart', JSON.stringify(updated))
    if (user) fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: updated }) })
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center gap-3 mb-12">
          <Heart size={28} className="text-accent fill-accent" />
          <h1 className="text-4xl font-display font-bold text-foreground">My Favorites</h1>
        </div>

        {loading ? (
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
        ) : products.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Heart size={48} className="text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No favorites yet.</p>
            <Link href="/collections" className="inline-block bg-accent text-[#0a0a0a] px-8 py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition">
              Browse Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <div key={product.id} className="group border border-border rounded-sm overflow-hidden hover:border-accent transition">
                <div className="relative h-72 overflow-hidden bg-secondary">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  <button
                    onClick={() => removeFavorite(product.id)}
                    className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-sm transition text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-xs text-muted-foreground font-semibold tracking-widest">{product.category}</p>
                  <h3 className="text-lg font-display font-semibold text-foreground">{product.name}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <p className="text-lg font-display font-bold text-accent">₦{product.price.toLocaleString()}</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 bg-accent text-[#0a0a0a] rounded-sm hover:bg-accent/90 transition"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
