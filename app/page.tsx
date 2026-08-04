'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'

export default function HomePage() {
  const featuredCollections = [
    {
      id: 1,
      name: 'Haute Couture',
      description: 'Timeless elegance redefined',
      image: 'https://images.unsplash.com/photo-1595777707802-52ca3d0cedc1?w=600&h=600&fit=crop',
      href: '/collections?category=Haute+Couture',
    },
    {
      id: 2,
      name: 'Accessories',
      description: 'Elevate every moment',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&h=600&fit=crop',
      href: '/collections?category=Accessories',
    },
    {
      id: 3,
      name: 'Jewelry',
      description: 'Precious moments, forever',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop',
      href: '/collections?category=Jewelry',
    },
  ]

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center space-y-8 px-4">
          <h1 className="text-5xl sm:text-7xl font-display font-bold text-foreground text-balance">
            Where Elegance Meets Exclusivity
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our curated collection of luxury fashion and accessories, crafted for those who appreciate true artistry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/collections"
              className="inline-flex items-center justify-center gap-2 bg-accent text-[#0a0a0a] px-8 py-4 rounded-sm font-display font-semibold hover:bg-accent/90 transition"
            >
              Explore Collections <ChevronRight size={20} />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 border border-accent text-accent px-8 py-4 rounded-sm font-display font-semibold hover:bg-accent/10 transition"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <p className="text-accent text-sm font-semibold tracking-widest mb-4">FEATURED</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4">
              Iconic Collections
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked selections that define luxury and timeless style.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollections.map((collection) => (
              <Link
                key={collection.id}
                href={collection.href}
                className="group relative overflow-hidden rounded-sm"
              >
                <div className="relative h-80 overflow-hidden bg-secondary">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    {collection.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {collection.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-secondary/50 border-t border-border">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-foreground">
            Experience Luxury
          </h2>
          <p className="text-lg text-muted-foreground">
            Sign up for exclusive access to new collections, special events, and members-only offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-accent text-[#0a0a0a] rounded-sm font-display font-semibold hover:bg-accent/90 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  )
}
