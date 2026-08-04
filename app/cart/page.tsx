'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function loadCart() {
      if (user) {
        const res = await fetch('/api/cart')
        const data = res.ok ? await res.json() : []
        if (data.length > 0) {
          setItems(data)
          localStorage.setItem('cart', JSON.stringify(data))
          setLoading(false)
          return
        }
      }
      const saved = localStorage.getItem('cart')
      if (saved) {
        try { setItems(JSON.parse(saved)) } catch {}
      }
      setLoading(false)
    }
    loadCart()
  }, [user])

  const saveCart = (updated: CartItem[]) => {
    setItems(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    if (user) {
      fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: updated }) })
    }
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { saveCart(items.filter(i => i.id !== id)); return }
    saveCart(items.map(i => i.id === id ? { ...i, quantity } : i))
  }

  const removeItem = (id: string) => saveCart(items.filter(i => i.id !== id))

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = items.length > 0 ? 50 : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-widest">
                REINE LUXE
              </Link>
              <Link href="/collections" className="text-sm font-body text-foreground hover:text-accent transition">
                COLLECTIONS
              </Link>
            </div>
          </nav>
        </header>

        <div className="flex flex-col items-center justify-center py-24 px-4">
          <ShoppingBag size={48} className="text-muted-foreground mb-4" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-md">
            Discover our exquisite collections and add items to your cart to get started.
          </p>
          <Link
            href="/collections"
            className="px-8 py-3 bg-accent text-primary rounded-sm font-display font-semibold hover:bg-accent/90 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-widest">
              REINE LUXE
            </Link>
            <Link href="/collections" className="text-sm font-body text-foreground hover:text-accent transition">
              COLLECTIONS
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-12">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 border-b border-border pb-6">
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-sm bg-secondary">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-accent font-semibold mt-2">
                        ₦{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <Minus size={16} className="text-foreground" />
                        </button>
                        <span className="w-8 text-center text-foreground">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-secondary rounded"
                        >
                          <Plus size={16} className="text-foreground" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="h-fit">
            <div className="border border-border rounded-sm p-6 bg-secondary/30 space-y-4">
              <h2 className="text-xl font-display font-semibold text-foreground">Order Summary</h2>
              
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground">₦{shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (10%)</span>
                  <span className="text-foreground">₦{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <span className="font-display font-semibold text-foreground">Total</span>
                <span className="font-display font-bold text-lg text-accent">
                  ₦{total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-accent text-primary py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition mt-6"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/collections"
                className="block w-full text-center border border-border py-3 rounded-sm text-foreground font-body hover:bg-secondary/50 transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
