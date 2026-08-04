'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

export default function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  // Read cart count from localStorage and keep it in sync
  useEffect(() => {
    function readCart() {
      try {
        const saved = localStorage.getItem('cart')
        const items = saved ? JSON.parse(saved) : []
        setCartCount(items.reduce((sum: number, i: any) => sum + (i.quantity ?? 1), 0))
      } catch {
        setCartCount(0)
      }
    }
    readCart()
    window.addEventListener('storage', readCart)
    // Poll every second to catch in-page cart updates
    const interval = setInterval(readCart, 1000)
    return () => {
      window.removeEventListener('storage', readCart)
      clearInterval(interval)
    }
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  const navLinks = [
    { href: '/collections', label: 'COLLECTIONS' },
    { href: '/about', label: 'ABOUT' },
    { href: '/contact', label: 'CONTACT' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-widest">
            REINE LUXE
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm font-body transition ${
                  pathname === href ? 'text-accent font-semibold' : 'text-foreground hover:text-accent'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-48 sm:w-64 px-3 py-1.5 bg-secondary border border-border rounded-sm text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button type="submit" className="p-2 text-foreground hover:text-accent transition" aria-label="Submit search">
                  <Search size={18} />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-muted-foreground hover:text-foreground transition" aria-label="Close search">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-foreground hover:text-accent transition" aria-label="Search">
                <Search size={20} />
              </button>
            )}
            {user ? (
              <>
                <Link href="/favorites" className="p-2 text-foreground hover:text-accent transition" title="Favorites">
                  <Heart size={20} />
                </Link>
                <Link href="/orders" className="p-2 text-foreground hover:text-accent transition" title="My Orders">
                  <User size={20} />
                </Link>
                <Link href="/api/auth/logout" className="p-2 text-muted-foreground hover:text-foreground transition" title="Sign out">
                  <LogOut size={18} />
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex px-4 py-2 bg-accent text-[#0a0a0a] rounded-sm text-sm font-display font-semibold hover:bg-accent/90 transition"
              >
                Login
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="p-2 text-foreground hover:text-accent transition relative" title="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-[#0a0a0a] text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden p-2 text-foreground hover:text-accent transition"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-2">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="flex-1 px-3 py-2 bg-secondary border border-border rounded-sm text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <button type="submit" className="p-2 bg-accent text-[#0a0a0a] rounded-sm">
                <Search size={16} />
              </button>
            </form>
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-3 rounded-sm text-sm font-body transition ${
                  pathname === href
                    ? 'bg-accent/10 text-accent font-semibold'
                    : 'text-foreground hover:bg-secondary hover:text-accent'
                }`}
              >
                {label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                className="mt-2 px-3 py-3 bg-accent text-[#0a0a0a] rounded-sm text-sm font-display font-semibold text-center hover:bg-accent/90 transition"
              >
                Login
              </Link>
            )}
            {user && (
              <div className="mt-2 pt-2 border-t border-border flex flex-col gap-1">
                <Link href="/favorites" className="px-3 py-3 rounded-sm text-sm font-body text-foreground hover:bg-secondary hover:text-accent transition flex items-center gap-3">
                  <Heart size={16} /> Favorites
                </Link>
                <Link href="/orders" className="px-3 py-3 rounded-sm text-sm font-body text-foreground hover:bg-secondary hover:text-accent transition flex items-center gap-3">
                  <User size={16} /> My Orders
                </Link>
                <Link href="/api/auth/logout" className="px-3 py-3 rounded-sm text-sm font-body text-muted-foreground hover:bg-secondary hover:text-foreground transition flex items-center gap-3">
                  <LogOut size={16} /> Sign Out
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
