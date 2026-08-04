'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { useState } from 'react'
import Navbar from '@/components/navbar'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', message: '' })
    setLoading(false)
    
    // Reset success message after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        {/* Page Header */}
        <div className="text-center mb-16 space-y-6">
          <p className="text-accent text-sm font-semibold tracking-widest">GET IN TOUCH</p>
          <h1 className="text-5xl font-display font-bold text-foreground">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Reach out to our team for personalized assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          {/* Contact Info */}
          <div className="space-y-8">
            {/* Email */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                  <Mail size={20} className="text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Email</h3>
              </div>
              <p className="text-muted-foreground ml-13">
                <a href="mailto:support@reineluxe.com" className="hover:text-accent transition">
                  support@reineluxe.com
                </a>
              </p>
              <p className="text-sm text-muted-foreground ml-13">We&apos;ll respond within 24 hours</p>
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                  <Phone size={20} className="text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Phone</h3>
              </div>
              <p className="text-muted-foreground ml-13">
                <a href="tel:+2348000000000" className="hover:text-accent transition">
                  +234 800 000 0000
                </a>
              </p>
              <p className="text-sm text-muted-foreground ml-13">Monday - Friday, 9AM - 6PM WAT</p>
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-accent/10 flex items-center justify-center">
                  <MapPin size={20} className="text-accent" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Address</h3>
              </div>
              <p className="text-muted-foreground ml-13">
                123 Luxury Plaza<br />
                Victoria Island, Lagos<br />
                Nigeria
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {submitted && (
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-sm">
                  <p className="text-green-500 font-body font-semibold">
                    Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-body font-semibold text-foreground">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-body font-semibold text-foreground">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-body font-semibold text-foreground">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition"
                  placeholder="+234 800 000 0000"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-body font-semibold text-foreground">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-secondary/30 border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition resize-none"
                  placeholder="Tell us how we can assist you..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-primary py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="border-t border-border pt-24 space-y-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Find answers to common questions about our products and services.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                q: 'What is your return policy?',
                a: 'We offer 30-day returns on all items in original condition. Contact our support team to initiate a return.',
              },
              {
                q: 'How long does shipping take?',
                a: 'Most orders are shipped within 2-3 business days and arrive within 3-5 business days across Nigeria.',
              },
              {
                q: 'Do you offer international shipping?',
                a: 'We currently ship within Nigeria. International shipping options are coming soon.',
              },
              {
                q: 'How do I track my order?',
                a: 'Tracking information is sent to your email once your order is dispatched.',
              },
            ].map((faq, index) => (
              <div key={index} className="space-y-3 pb-6 border-b border-border last:border-b-0">
                <h3 className="font-display font-semibold text-lg text-foreground">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
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
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-accent transition">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-accent transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 Reine Luxe Co. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
