'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Heart, ArrowLeft, Star } from 'lucide-react'
import { supabase, type Product } from '@/lib/supabase'
import { useAuth } from '@/components/auth-provider'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFav, setIsFav] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [activeImage, setActiveImage] = useState<string>('')

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single()
      .then(({ data }) => { setProduct(data); setActiveImage(data?.image ?? ''); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!user) return
    fetch('/api/favorites').then(r => r.json()).then((ids: string[]) => setIsFav(ids.includes(id)))
  }, [user, id])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const addToCart = useCallback(() => {
    if (!user) { router.push('/login'); return }
    if (!product) return
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0
    if (hasSizes && !selectedSize) { showToast('Please select a size'); return }
    if (hasColors && !selectedColor) { showToast('Please select a color'); return }
    try {
      const saved = localStorage.getItem('cart')
      const cart = saved ? JSON.parse(saved) : []
      const key = `${product.id}:${selectedSize || 'default'}:${selectedColor || 'default'}`
      const existing = cart.find((i: any) => `${i.id}:${i.size || 'default'}:${i.color || 'default'}` === key)
      const updated = existing
        ? cart.map((i: any) => `${i.id}:${i.size || 'default'}:${i.color || 'default'}` === key ? { ...i, quantity: i.quantity + quantity } : i)
        : [...cart, { ...product, quantity, size: selectedSize || undefined, color: selectedColor || undefined, image: activeImage || product.image }]
      localStorage.setItem('cart', JSON.stringify(updated))
      if (user) fetch('/api/cart', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: updated }) })
      showToast('Added to cart')
    } catch {}
  }, [product, quantity, selectedSize, selectedColor, activeImage, user, router])

  const toggleFavorite = useCallback(async () => {
    if (!user) { router.push('/login'); return }
    if (!product) return
    if (isFav) {
      await fetch('/api/favorites', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      setIsFav(false)
      showToast('Removed from favorites')
    } else {
      await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: product.id }) })
      setIsFav(true)
      showToast('Added to favorites')
    }
  }, [isFav, product, user, router])

  // When a color is selected, switch the main image to the first tagged one
  // (main image tags are respected just like extra image tags)
  useEffect(() => {
    if (!product) return
    if (!selectedColor) {
      setActiveImage(product.image)
      return
    }
    const mainColors =
      product.main_image_colors && product.main_image_colors.length > 0
        ? product.main_image_colors
        : (product.colors ?? [])
    const allImages = [
      { url: product.image, colors: mainColors },
      ...(product.images ?? []),
    ]
    const match = allImages.find(im => Array.isArray(im.colors) && im.colors.includes(selectedColor))
    setActiveImage(match?.url ?? product.image)
  }, [selectedColor, product])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="h-[500px] bg-secondary rounded-sm" />
            <div className="space-y-4">
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-6 bg-secondary rounded w-1/3" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-4">Product Not Found</h1>
          <Link href="/collections" className="text-accent hover:text-accent/80 font-body">← Back to Collections</Link>
        </div>
      </main>
    )
  }

  const galleryImages = [
    {
      url: product.image,
      // If the main photo has explicit color tags, use them (like extra images);
      // otherwise fall back to tagging it with every product color.
      colors:
        product.main_image_colors && product.main_image_colors.length > 0
          ? product.main_image_colors
          : (product.colors ?? []),
    },
    ...(product.images ?? []),
  ]

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.name,
    image: product.image,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.in_stock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews,
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-body font-semibold text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4">
          {toast}
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <Link href="/collections" className="inline-flex items-center gap-2 text-muted-foreground hover:text-accent transition text-sm font-body mb-10">
          <ArrowLeft size={16} /> Back to Collections
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div>
            <div className="relative h-[500px] overflow-hidden rounded-sm bg-secondary mb-4">
              <img
                src={activeImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.in_stock === false && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-2xl tracking-widest">OUT OF STOCK</span>
                </div>
              )}
            </div>

            {/* Gallery thumbnails (main + extra images, tagged by color) */}
            {galleryImages.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img, idx) => {
                  const isActive = activeImage === img.url
                  const isColorMatch = Boolean(selectedColor && img.colors?.includes(selectedColor))
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImage(img.url)}
                      title={img.colors?.length ? `Tagged: ${img.colors.join(', ')}` : ''}
                      className={`w-20 h-24 overflow-hidden rounded-sm border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-accent'
                          : isColorMatch
                            ? 'border-accent/80 ring-2 ring-accent/50'
                            : 'border-border hover:border-accent/50'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-accent text-xs font-semibold tracking-widest mb-2">{product.category}</p>
              <h1 className="text-4xl font-display font-bold text-foreground mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={i < Math.floor(product.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">{product.reviews} reviews</span>
              </div>
              <p className="text-3xl font-display font-bold text-accent">₦{product.price.toLocaleString()}</p>
            </div>

            {product.description && (
              <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>
            )}

            {/* Size Selection */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-body text-foreground">Size</span>
                  <span className="text-xs text-muted-foreground/70">Select your usual size for a tailored fit</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 border rounded-sm text-sm font-body transition-all duration-200 ${
                        selectedSize === s
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {Array.isArray(product.colors) && product.colors.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-body text-foreground">Color</span>
                  <span className="text-xs text-muted-foreground/70">
                    Selected colour highlights matching images
                    {selectedColor ? `: ${selectedColor}` : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(selectedColor === c ? '' : c)}
                      className={`px-4 py-2 border rounded-sm text-sm font-body transition-all duration-200 ${
                        selectedColor === c
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            {product.in_stock !== false && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-body text-foreground">Quantity</span>
                <div className="flex items-center border border-border rounded-sm">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-foreground hover:bg-secondary transition">−</button>
                  <span className="px-4 py-2 text-foreground font-body">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-foreground hover:bg-secondary transition">+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={product.in_stock === false}
                className="flex-1 flex items-center justify-center gap-2 bg-accent text-[#0a0a0a] py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {product.in_stock === false ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={toggleFavorite}
                className={`p-3 border rounded-sm transition ${isFav ? 'border-accent text-accent' : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}`}
              >
                <Heart size={20} className={isFav ? 'fill-accent' : ''} />
              </button>
            </div>

            <div className="border-t border-border pt-6 space-y-2 text-sm text-muted-foreground font-body">
              <p>✓ Free shipping on orders over ₦50,000</p>
              <p>✓ 30-day hassle-free returns</p>
              <p>✓ Authenticity guaranteed</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
