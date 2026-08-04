'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle2, Package } from 'lucide-react'
import Navbar from '@/components/navbar'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference')

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/10 rounded-full blur-3xl" />
              <CheckCircle2 size={120} className="relative text-accent" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl font-display font-bold text-foreground">
              Order Confirmed
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for your purchase! Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-secondary/30 border border-border rounded-sm p-8 space-y-6 text-left">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">ORDER REFERENCE</p>
              <p className="text-xl font-display font-semibold text-foreground break-all">
                {reference || 'Processing...'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-b border-border py-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">ESTIMATED DELIVERY</p>
                <p className="text-lg font-body font-semibold text-foreground">
                  3-5 Business Days
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">SHIPPING METHOD</p>
                <p className="text-lg font-body font-semibold text-foreground">
                  Express Delivery
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">WHAT&apos;S NEXT?</p>
              <ul className="space-y-3 text-left">
                <li className="flex items-start gap-3">
                  <Package size={20} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-body font-semibold text-foreground">Order Confirmation Email</p>
                    <p className="text-sm text-muted-foreground">
                      A confirmation email with your order details has been sent to your inbox.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Package size={20} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-body font-semibold text-foreground">Tracking Information</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll receive a tracking number once your order ships.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Package size={20} className="text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-body font-semibold text-foreground">Hassle-Free Returns</p>
                    <p className="text-sm text-muted-foreground">
                      Not satisfied? We offer 30-day returns on all items.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/collections"
              className="px-8 py-3 bg-accent text-[#0a0a0a] rounded-sm font-display font-semibold hover:bg-accent/90 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/"
              className="px-8 py-3 border border-border text-foreground rounded-sm font-display font-semibold hover:bg-secondary/50 transition"
            >
              Return to Home
            </Link>
          </div>

          {/* Support */}
          <div className="pt-12 border-t border-border">
            <p className="text-muted-foreground text-sm mb-4">
              Need help? We&apos;re here to assist.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="text-accent hover:text-accent/80 font-body font-semibold">
                Contact Support
              </Link>
              <span className="text-border hidden sm:inline">•</span>
              <a href="mailto:support@reineluxe.com" className="text-accent hover:text-accent/80 font-body font-semibold">
                support@reineluxe.com
              </a>
              <span className="text-border hidden sm:inline">•</span>
              <a href="tel:+2348000000000" className="text-accent hover:text-accent/80 font-body font-semibold">
                +234 800 000 0000
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense>
      <OrderConfirmationContent />
    </Suspense>
  )
}
