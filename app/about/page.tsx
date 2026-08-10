import Link from 'next/link'
import type { Metadata } from 'next'
import Reveal from '@/components/reveal'

export const metadata: Metadata = {
  title: 'About Us | Reine Luxe Co.',
  description: 'Discover the story behind Reine Luxe Co. — where tradition meets innovation, and luxury transcends mere possession to become an experience.',
  openGraph: {
    title: 'About Us | Reine Luxe Co.',
    description: 'Discover the story behind Reine Luxe Co. — where tradition meets innovation, and luxury transcends mere possession to become an experience.',
  },
}

const values = [
  { label: 'Excellence', desc: 'We never compromise on quality. Every item meets our rigorous standards for craftsmanship and design.' },
  { label: 'Integrity', desc: 'We operate with complete transparency about our products, pricing, and business practices.' },
  { label: 'Exclusivity', desc: 'Our collections are intentionally limited to preserve their rarity and ensure only the best reach our clients.' },
]

const commitments = [
  'Authentic, verified products from trusted makers and artisans',
  'Expert curation and personal shopping assistance',
  'Secure, confidential transactions and premium packaging',
  'Hassle-free returns and customer satisfaction guarantee',
  'Exclusive access to limited editions and upcoming collections',
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative py-32 px-4 text-center overflow-hidden border-b border-[#1c1c1c]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-32 bg-[#c9a84c06] blur-3xl pointer-events-none" />
        <p className="label-luxury mb-6 animate-fade-up opacity-0">Our Story</p>
        <h1
          className="font-display font-light text-foreground animate-fade-up opacity-0 delay-100 mb-6"
          style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', letterSpacing: '0.02em' }}
        >
          Reine Luxe
        </h1>
        <p className="text-[#8a8478] font-body font-light text-lg max-w-2xl mx-auto animate-fade-up opacity-0 delay-200 leading-relaxed">
          Where tradition meets innovation, and luxury transcends mere possession to become an experience.
        </p>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mx-auto mt-8 animate-fade-up opacity-0 delay-300" />
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 space-y-24">

        {/* About text */}
        <Reveal>
          <p className="label-luxury mb-6">About</p>
          <div className="space-y-5 text-[#8a8478] font-body font-light text-base leading-[1.9]">
            <p>
              Reine Luxe Co. was founded with a singular vision: to curate and deliver the finest luxury fashion and accessories to discerning individuals who understand that true luxury is not about excess, but about excellence.
            </p>
            <p>
              Every piece in our collection has been handpicked by our team of experts, with meticulous attention to craftsmanship, quality, and timeless design. We believe luxury is a privilege earned through dedication to perfection.
            </p>
          </div>
        </Reveal>

        {/* Values */}
        <Reveal>
          <p className="label-luxury mb-10">Our Values</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1c1c1c]">
            {values.map(({ label, desc }, i) => (
              <Reveal key={label} delay={(i + 1) * 120} className="bg-background p-10">
                <div className="w-6 h-px bg-[#c9a84c] mb-6" />
                <h3 className="font-display font-light text-xl text-foreground mb-3 tracking-wide">{label}</h3>
                <p className="text-sm font-body font-light text-[#8a8478] leading-relaxed">{desc}</p>
              </Reveal>
            ))}
          </div>
        </Reveal>

        {/* Commitment */}
        <Reveal>
          <div className="border border-[#1c1c1c] bg-[#0d0d0d] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#c9a84c04] blur-3xl pointer-events-none" />
            <p className="label-luxury mb-6">Our Commitment</p>
            <p className="text-[#8a8478] font-body font-light leading-[1.9] mb-8">
              At Reine Luxe, we're committed to providing an exceptional shopping experience that goes beyond simply selling products — building lasting relationships with clients who share our passion for excellence.
            </p>
            <ul className="space-y-4">
              {commitments.map(item => (
                <li key={item} className="flex items-start gap-4 text-sm font-body font-light text-[#8a8478]">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-accent shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal className="text-center pt-8 border-t border-[#1c1c1c]">
          <h2 className="font-display font-light text-3xl text-foreground mb-4 tracking-wide">Experience the Difference</h2>
          <p className="text-[#8a8478] font-body font-light mb-10">
            Discover our curated collections and find pieces that resonate with your unique style.
          </p>
          <Link
            href="/collections"
            className="inline-flex items-center gap-3 bg-accent text-[#080808] px-10 py-4 font-body font-medium text-sm tracking-[0.15em] uppercase hover:bg-[#e8c96a] transition-all duration-300 btn-press"
          >
            Explore Collections
          </Link>
        </Reveal>
      </div>

    </main>
  )
}
