'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Navbar from '@/components/navbar'

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Browse our collections, add items to your cart, and proceed to checkout. We accept payments via Paystack — debit/credit cards and bank transfers are supported.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major debit and credit cards (Visa, Mastercard, Verve) as well as bank transfers through our secure Paystack payment gateway.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery within Lagos takes 1–3 business days. Nationwide delivery takes 3–7 business days. Express options are available at checkout.',
  },
  {
    q: 'Can I return or exchange an item?',
    a: 'Yes. We offer a 30-day return policy on all unworn, undamaged items with original tags attached. Visit our Returns page for full details.',
  },
  {
    q: 'Are the products authentic?',
    a: 'Absolutely. Every item sold on Reine Luxe Co. is 100% authentic and sourced directly from verified luxury brands and artisans.',
  },
  {
    q: 'How do I track my order?',
    a: "Once your order ships, you'll receive a tracking number via email. You can also view your order status in the My Orders section of your account.",
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within Nigeria only. International shipping is coming soon — sign up for our newsletter to be notified.',
  },
  {
    q: 'How do I contact customer support?',
    a: 'You can reach us via our Contact page, email us at support@reineluxe.com, or call +234 800 000 0000 during business hours (Mon–Fri, 9am–6pm).',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">HELP CENTER</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-6">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Everything you need to know about shopping with Reine Luxe Co.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-sm overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary/30 transition"
              >
                <span className="font-body font-semibold text-foreground">{faq.q}</span>
                <ChevronDown size={18} className={`text-muted-foreground transition-transform shrink-0 ml-4 ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-muted-foreground font-body text-sm leading-relaxed border-t border-border pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center border-t border-border pt-12">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <a href="/contact" className="text-accent hover:text-accent/80 font-body font-semibold">Contact our support team →</a>
        </div>
      </div>
    </main>
  )
}
