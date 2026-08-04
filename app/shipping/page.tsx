import Navbar from '@/components/navbar'

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-accent text-sm font-semibold tracking-widest mb-4">DELIVERY</p>
          <h1 className="text-5xl font-display font-bold text-foreground mb-6">Shipping Information</h1>
          <p className="text-muted-foreground">Everything you need to know about how we deliver your orders.</p>
        </div>

        <div className="space-y-10 font-body text-foreground">
          <section>
            <h2 className="text-xl font-display font-semibold mb-4 text-foreground">Delivery Options</h2>
            <div className="border border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3">Method</th>
                    <th className="text-left px-4 py-3">Timeframe</th>
                    <th className="text-left px-4 py-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Standard (Lagos)</td>
                    <td className="px-4 py-3 text-muted-foreground">1–3 business days</td>
                    <td className="px-4 py-3 text-accent">₦1,500</td>
                  </tr>
                  <tr className="border-t border-border bg-secondary/20">
                    <td className="px-4 py-3">Nationwide</td>
                    <td className="px-4 py-3 text-muted-foreground">3–7 business days</td>
                    <td className="px-4 py-3 text-accent">₦3,000</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-3">Express (Lagos)</td>
                    <td className="px-4 py-3 text-muted-foreground">Same day / next day</td>
                    <td className="px-4 py-3 text-accent">₦5,000</td>
                  </tr>
                  <tr className="border-t border-border bg-secondary/20">
                    <td className="px-4 py-3">Free Shipping</td>
                    <td className="px-4 py-3 text-muted-foreground">3–5 business days</td>
                    <td className="px-4 py-3 text-green-400">Free on orders over ₦50,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <h2 className="text-xl font-display font-semibold text-foreground">Order Processing</h2>
            <p>Orders are processed within 24 hours on business days (Monday–Friday, excluding public holidays). Orders placed after 3pm will be processed the next business day.</p>
          </section>

          <section className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <h2 className="text-xl font-display font-semibold text-foreground">Tracking Your Order</h2>
            <p>Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order from the <a href="/orders" className="text-accent hover:text-accent/80">My Orders</a> page in your account.</p>
          </section>

          <section className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <h2 className="text-xl font-display font-semibold text-foreground">Packaging</h2>
            <p>All Reine Luxe Co. orders are carefully packaged in our signature luxury boxes with tissue paper and a personalised note. Perfect for gifting.</p>
          </section>

          <section className="space-y-3 text-muted-foreground text-sm leading-relaxed">
            <h2 className="text-xl font-display font-semibold text-foreground">Questions?</h2>
            <p>Contact our support team at <a href="mailto:support@reineluxe.com" className="text-accent hover:text-accent/80">support@reineluxe.com</a> or visit our <a href="/faq" className="text-accent hover:text-accent/80">FAQ page</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
