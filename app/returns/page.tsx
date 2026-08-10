import Link from 'next/link'

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background">

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">HASSLE-FREE</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-6">Returns & Exchanges</h1>
          <p className="text-muted-foreground">We want you to love every purchase. If something isn't right, we'll make it right.</p>
        </div>

        <div className="space-y-10 font-body text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">30-Day Return Policy</h2>
            <p>You may return most items within 30 days of delivery for a full refund or exchange. Items must be unworn, unwashed, and in their original condition with all tags attached.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">Non-Returnable Items</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Personalised or custom-made items</li>
              <li>Intimate apparel and swimwear</li>
              <li>Items marked as "Final Sale"</li>
              <li>Gift cards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">How to Return</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Contact us at <a href="mailto:support@reineluxe.com" className="text-accent hover:text-accent/80">support@reineluxe.com</a> with your order reference and reason for return.</li>
              <li>We'll send you a return authorisation and instructions within 24 hours.</li>
              <li>Pack the item securely in its original packaging and drop it off at the designated courier.</li>
              <li>Once received and inspected, your refund will be processed within 5–7 business days.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">Exchanges</h2>
            <p>To exchange an item for a different size or colour, follow the return process above and indicate your preferred replacement. Subject to availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-display font-semibold text-foreground mb-3">Refunds</h2>
            <p>Refunds are issued to the original payment method. Please allow 5–10 business days for the amount to reflect in your account after we process the return.</p>
          </section>

          <div className="border-t border-border pt-8">
            <p>Still have questions? <Link href="/contact" className="text-accent hover:text-accent/80 font-semibold">Contact our support team</Link> or visit our <Link href="/faq" className="text-accent hover:text-accent/80 font-semibold">FAQ page</Link>.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
