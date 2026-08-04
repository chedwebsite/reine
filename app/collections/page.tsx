'use client'

import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase, type Product } from '@/lib/supabase'

export default function CollectionsPage() {
  const [cart, setCart] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category')
      if (error) console.error('Supabase error:', error)
      if (data) setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const categories = ['Haute Couture', 'Accessories', 'Jewelry']
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id)
    let updatedCart

    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }]
    }

    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
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
            
            <div className="hidden md:flex items-center gap-8">
              <Link href="/collections" className="text-sm font-body text-accent font-semibold">
                COLLECTIONS
              </Link>
              <Link href="/about" className="text-sm font-body text-foreground hover:text-accent transition">
                ABOUT
              </Link>
              <Link href="/contact" className="text-sm font-body text-foreground hover:text-accent transition">
                CONTACT
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-foreground hover:text-accent transition">
                <Heart size={20} />
              </button>
              <Link href="/cart" className="p-2 text-foreground hover:text-accent transition relative">
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-primary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">SHOP</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-4">
            Our Collections
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Curated selections of timeless luxury pieces, each crafted with meticulous attention to detail.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-sm font-body text-sm font-semibold transition ${
              selectedCategory === null
                ? 'bg-accent text-primary'
                : 'border border-border text-foreground hover:border-accent'
            }`}
          >
            All Products
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-sm font-body text-sm font-semibold transition ${
                selectedCategory === category
                  ? 'bg-accent text-primary'
                  : 'border border-border text-foreground hover:border-accent'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border border-border rounded-sm overflow-hidden animate-pulse">
                <div className="h-72 bg-secondary" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-secondary rounded w-1/3" />
                  <div className="h-5 bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filteredProducts.length === 0 && (
          <p className="text-center text-muted-foreground py-24">No products found.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {!loading && filteredProducts.map(product => (
            <div
              key={product.id}
              className="group border border-border rounded-sm overflow-hidden hover:border-accent transition"
            >
              {/* Image */}
              <div className="relative h-72 overflow-hidden bg-secondary">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm p-2 rounded-sm opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => addToCart(product)}
                    className="text-accent hover:text-accent/80"
                  >
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                <p className="text-xs text-muted-foreground font-semibold tracking-widest">
                  {product.category}
                </p>
                <h3 className="text-lg font-display font-semibold text-foreground">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(product.rating)
                            ? 'text-accent fill-accent'
                            : 'text-muted-foreground'
                        }`}
                        viewBox="0 0 24 24"
                      >
                        <polygon points="12 2 15.09 10.26 24 10.26 17.55 16.16 19.64 24.42 12 18.51 4.36 24.42 6.45 16.16 0 10.26 8.91 10.26" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {product.reviews} reviews
                  </span>
                </div>

                {/* Price and Button */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <p className="text-lg font-display font-bold text-accent">
                    ₦{product.price.toLocaleString()}
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className="p-2 bg-accent text-primary rounded-sm hover:bg-accent/90 transition"
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-16 px-4 sm:px-6 lg:px-8 mt-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Shop</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/collections" className="hover:text-accent transition">Collections</Link></li>
                <li><Link href="/products" className="hover:text-accent transition">All Products</Link></li>
                <li><Link href="/sale" className="hover:text-accent transition">Sale</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-accent transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
                <li><Link href="/careers" className="hover:text-accent transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-accent transition">FAQ</Link></li>
                <li><Link href="/shipping" className="hover:text-accent transition">Shipping</Link></li>
                <li><Link href="/returns" className="hover:text-accent transition">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-accent transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-accent transition">Terms</Link></li>
                <li><Link href="/cookies" className="hover:text-accent transition">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Reine Luxe Co. All rights reserved.
            </p>
            <div className="flex gap-4 text-muted-foreground">
              <a href="#" className="hover:text-accent transition">Instagram</a>
              <a href="#" className="hover:text-accent transition">Twitter</a>
              <a href="#" className="hover:text-accent transition">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
