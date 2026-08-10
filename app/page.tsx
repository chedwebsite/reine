'use client'

import Link from 'next/link'
import { ChevronRight, ArrowRight } from 'lucide-react'
import HeroSlideshow from '@/components/hero-slideshow'
import Reveal from '@/components/reveal'
import Marquee from '@/components/marquee'

const collections = [
  {
    id: 1,
    name: 'Haute Couture',
    description: 'Timeless elegance redefined',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop',
    href: '/collections?category=Haute+Couture',
  },
  {
    id: 2,
    name: 'Accessories',
    description: 'Elevate every moment',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=1000&fit=crop',
    href: '/collections?category=Accessories',
  },
  {
    id: 3,
    name: 'Jewelry',
    description: 'Precious moments, forever',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=1000&fit=crop',
    href: '/collections?category=Jewelry',
  },
]

const pillars = [
  { label: 'Craftsmanship', desc: 'Every piece is selected for its exceptional quality and artisanal heritage.' },
  { label: 'Exclusivity', desc: 'Intentionally limited collections that preserve their rarity and prestige.' },
  { label: 'Authenticity', desc: 'Sourced directly from verified luxury makers and master artisans.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background slideshow */}
        <HeroSlideshow />
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808cc] via-[#08080888] to-[#080808]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808aa] via-transparent to-[#080808aa]" />
        {/* Grain */}
        <div className="grain-overlay absolute inset-0" />

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <p className="label-luxury animate-fade-up opacity-0 delay-100 mb-6">
            The Art of Luxury
          </p>

          <h1 className="font-display font-light text-foreground mb-6 animate-fade-up opacity-0 delay-200"
            style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 1.05, letterSpacing: '0.02em' }}
          >
            Where Elegance<br />
            <em className="text-gold-shimmer not-italic">Meets Exclusivity</em>
          </h1>

          <p className="text-[#8a8478] font-body font-light text-lg max-w-xl mx-auto mb-12 animate-fade-up opacity-0 delay-300 leading-relaxed">
            Curated luxury fashion and accessories for those who appreciate true artistry.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up opacity-0 delay-400">
            <Link
              href="/collections"
              className="group inline-flex items-center justify-center gap-3 bg-accent text-[#080808] px-10 py-4 font-body font-medium text-sm tracking-[0.15em] uppercase hover:bg-[#e8c96a] transition-all duration-300 btn-press"
            >
              Explore Collections
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-3 border border-[#c9a84c44] text-[#c9a84c] px-10 py-4 font-body font-medium text-sm tracking-[0.15em] uppercase hover:border-accent hover:bg-[#c9a84c0a] transition-all duration-300 btn-press"
            >
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in opacity-0 delay-700 z-50">
          <span className="label-luxury opacity-40 text-[0.55rem]">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#c9a84c66] to-transparent" />
        </div>
      </section>

      {/* ── Pillars ───────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-[#1c1c1c]">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c1c]">
          {pillars.map(({ label, desc }, i) => (
            <Reveal
              key={label}
              delay={(i + 1) * 120}
              className="bg-background px-10 py-12 text-center"
            >
              <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mx-auto mb-6" />
              <h3 className="font-display font-light text-xl text-foreground mb-3 tracking-wide">{label}</h3>
              <p className="text-sm font-body font-light text-[#8a8478] leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured Collections ──────────────────────────── */}
      <section className="py-28 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mb-20 text-center">
            <p className="label-luxury mb-5">Featured</p>
            <h2 className="font-display font-light text-foreground mb-5"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)', letterSpacing: '0.02em' }}
            >
              Iconic Collections
            </h2>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mx-auto" />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {collections.map((col, i) => (
              <Reveal key={col.id} delay={(i + 1) * 120}>
              <Link
                href={col.href}
                className="group relative overflow-hidden block"
                style={{ aspectRatio: '3/4' }}
              >
                <img
                  src={col.image}
                  alt={col.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808ee] via-[#08080844] to-transparent transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[#c9a84c08] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="w-6 h-px bg-[#c9a84c] mb-4 transition-all duration-500 group-hover:w-12" />
                  <h3 className="font-display font-light text-2xl text-foreground mb-1 tracking-wide">{col.name}</h3>
                  <p className="text-sm font-body font-light text-[#8a8478] mb-4">{col.description}</p>
                  <span className="inline-flex items-center gap-2 text-xs font-body font-medium tracking-[0.15em] uppercase text-[#c9a84c] opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0">
                    Explore <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Brand marquee ────────────────────────────────── */}
      <Marquee />

      {/* ── CTA / Newsletter ─────────────────────────────── */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[#0d0d0d]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c33] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c33] to-transparent" />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#c9a84c06] blur-3xl pointer-events-none rounded-full" />

        <Reveal className="relative z-10 mx-auto max-w-2xl text-center">
          <p className="label-luxury mb-6">Exclusive Access</p>
          <h2 className="font-display font-light text-foreground mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.02em' }}
          >
            Join the Inner Circle
          </h2>
          <p className="text-[#8a8478] font-body font-light mb-10 leading-relaxed">
            Be first to discover new collections, private events, and members-only offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3.5 bg-[#111] border border-[#222] text-foreground placeholder-[#8a8478] text-sm font-body font-light focus:outline-none focus:border-[#c9a84c44] transition-colors"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-accent text-[#080808] font-body font-medium text-sm tracking-[0.15em] uppercase hover:bg-[#e8c96a] transition-all duration-300 btn-press whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </Reveal>
      </section>

    </main>
  )
}
