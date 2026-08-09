import Link from 'next/link'

const cols = [
  {
    heading: 'Shop',
    links: [
      { href: '/collections', label: 'Collections' },
      { href: '/sale', label: 'Sale' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      
    ],
  },
  {
    heading: 'Support',
    links: [
      // { href: '/track-order', label: 'Track Order' },
      { href: '/faq', label: 'FAQ' },
      { href: '/shipping', label: 'Shipping' },
      { href: '/returns', label: 'Returns' },
    ],
  },

  {
    heading: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/cookies', label: 'Cookies' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-[#1c1c1c] bg-[#060606] pt-20 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle gold radial glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-[#c9a84c44] to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-24 bg-[#c9a84c08] blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl relative z-10">
        {/* Brand mark */}
        <div className="mb-16 flex flex-col items-center text-center">
          <span className="text-4xl font-display font-light tracking-[0.3em] text-gold-shimmer uppercase mb-2">
            Reine Luxe
          </span>
          <span className="label-luxury opacity-60">Luxury Fashion &amp; Accessories</span>
          <div className="mt-6 w-12 h-px bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {cols.map(({ heading, links }) => (
            <div key={heading}>
              <p className="label-luxury mb-5">{heading}</p>
              <ul className="space-y-3">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm font-body font-light text-[#8a8478] hover:text-[#c9a84c] transition-colors duration-300 underline-gold"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="divider-gold mb-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-body font-light text-[#4a4a44] tracking-wider">
            &copy; {new Date().getFullYear()} Reine Luxe Co. All rights reserved.
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Instagram', href: 'https://instagram.com' },
              { label: 'Twitter', href: 'https://twitter.com' },
              { label: 'LinkedIn', href: 'https://linkedin.com' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-body font-light tracking-widest uppercase text-[#4a4a44] hover:text-[#c9a84c] transition-colors duration-300"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
