import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/collections" className="hover:text-accent transition">Collections</Link></li>
              <li><Link href="/products" className="hover:text-accent transition">All Products</Link></li>
              <li><Link href="/sale" className="hover:text-accent transition">Sale</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-accent transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-accent transition">Careers</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/faq" className="hover:text-accent transition">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-accent transition">Shipping</Link></li>
              <li><Link href="/returns" className="hover:text-accent transition">Returns</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-accent transition">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-accent transition">Terms</Link></li>
              <li><Link href="/cookies" className="hover:text-accent transition">Cookies</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Reine Luxe Co. All rights reserved.
          </p>
          <div className="flex gap-4 text-muted-foreground text-sm">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
