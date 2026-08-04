import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import Navbar from '@/components/navbar'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-6">
          <p className="text-accent text-sm font-semibold tracking-widest">OUR STORY</p>
          <h1 className="text-5xl sm:text-6xl font-display font-bold text-foreground">
            Reine Luxe
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Where tradition meets innovation, and luxury transcends mere possession to become an experience.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-16 mb-24">
          {/* About */}
          <section className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-foreground">About Reine Luxe</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Reine Luxe Co. was founded with a singular vision: to curate and deliver the finest luxury fashion and accessories to discerning individuals who understand that true luxury is not about excess, but about excellence. Every piece in our collection has been handpicked by our team of experts, with meticulous attention to craftsmanship, quality, and timeless design.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe luxury is a privilege earned through dedication to perfection. Our carefully curated collections represent the pinnacle of contemporary and classic design, sourced from the world's most prestigious makers and artisans.
            </p>
          </section>

          {/* Values */}
          <section className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-foreground">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <h3 className="text-xl font-display font-semibold text-accent">Excellence</h3>
                <p className="text-muted-foreground">
                  We never compromise on quality. Every item meets our rigorous standards for craftsmanship and design.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-display font-semibold text-accent">Integrity</h3>
                <p className="text-muted-foreground">
                  We operate with complete transparency about our products, pricing, and business practices with our valued customers.
                </p>
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-display font-semibold text-accent">Exclusivity</h3>
                <p className="text-muted-foreground">
                  Our collections are intentionally limited to preserve their exclusivity and ensure only the best reach our clients.
                </p>
              </div>
            </div>
          </section>

          {/* Commitment */}
          <section className="space-y-6 bg-secondary/30 border border-border rounded-sm p-8">
            <h2 className="text-3xl font-display font-bold text-foreground">Our Commitment</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              At Reine Luxe, we&apos;re committed to providing an exceptional shopping experience that goes beyond simply selling products. We believe in building lasting relationships with our clients, understanding their preferences, and delivering personalized service that reflects our commitment to excellence.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">•</span>
                <span>Authentic, verified products from trusted makers and artisans</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">•</span>
                <span>Expert curation and personal shopping assistance</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">•</span>
                <span>Secure, confidential transactions and premium packaging</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">•</span>
                <span>Hassle-free returns and customer satisfaction guarantee</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-accent font-bold">•</span>
                <span>Exclusive access to limited editions and upcoming collections</span>
              </li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center space-y-6 border-t border-border pt-16">
          <h2 className="text-3xl font-display font-bold text-foreground">Experience the Difference</h2>
          <p className="text-lg text-muted-foreground">
            Discover our curated collections and find pieces that resonate with your unique style.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 bg-accent text-primary px-8 py-4 rounded-sm font-display font-semibold hover:bg-accent/90 transition"
          >
            <ShoppingCart size={20} />
            Explore Collections
          </Link>
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
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-accent transition">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/faq" className="hover:text-accent transition">FAQ</Link></li>
                <li><Link href="/returns" className="hover:text-accent transition">Returns</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-accent transition">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-accent transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Reine Luxe Co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
