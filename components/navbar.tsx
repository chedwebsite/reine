'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search, LayoutDashboard, PackageSearch } from 'lucide-react'

import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase-browser'

export default function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [cartCount, setCartCount] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function readCart() {
      try {
        const saved = localStorage.getItem('cart')
        const items = saved ? JSON.parse(saved) : []
        setCartCount(items.reduce((sum: number, i: any) => sum + (i.quantity ?? 1), 0))
      } catch { setCartCount(0) }
    }
    readCart()
    window.addEventListener('storage', readCart)
    const interval = setInterval(readCart, 1000)
    return () => { window.removeEventListener('storage', readCart); clearInterval(interval) }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch user's full name from profile
  useEffect(() => {
    async function fetchUserName() {
      if (!user) {
        setUserName(null)
        return
      }

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()

        if (data?.full_name) {
          // Get first name only
          const firstName = data.full_name.split(' ')[0]
          setUserName(firstName)
        } else {
          // Fallback to email username
          const emailName = user.email?.split('@')[0]
          setUserName(emailName || null)
        }
      } catch (error) {
        console.error('Error fetching user name:', error)
        const emailName = user.email?.split('@')[0]
        setUserName(emailName || null)
      }
    }

    fetchUserName()
  }, [user, supabase])

  useEffect(() => { setMobileOpen(false); setSearchOpen(false) }, [pathname])
  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    router.push(`/search?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchQuery('')
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    // Clear locally-persisted cart/favorites so the next guest/user
    // doesn't see the previous session's cart count.
    localStorage.removeItem('cart')
    localStorage.removeItem('favorites')
    setCartCount(0)
    router.push('/login')
    router.refresh()
  }

  const navLinks = [
    { href: '/collections', label: 'Collections' },
    { href: '/sale', label: 'Sale' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? 'glass border-b border-[#c9a84c22] shadow-[0_4px_30px_#00000060]'
        : 'bg-background/90 backdrop-blur-sm border-b border-border'
        }`}
    >
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">

          {/* Brand */}
          <Link href="/" className="shrink-0 flex flex-col leading-none group">
            <span className="text-[1.2rem] sm:text-[1.4rem] lg:text-[1.6rem] font-display font-light tracking-[0.2em] sm:tracking-[0.25em] text-gold-shimmer uppercase whitespace-nowrap">
              Reine Luxe
            </span>
            <span className="text-[0.45rem] sm:text-[0.5rem] tracking-[0.3em] sm:tracking-[0.35em] text-[#8a8478] uppercase font-body font-light mt-0.5 group-hover:text-[#c9a84c] transition-colors duration-500">
              Co.
            </span>
          </Link>

          {/* Desktop nav — lg and up */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`underline-gold text-sm font-body font-light tracking-widest uppercase transition-colors duration-300 ${active ? 'text-accent active' : 'text-[#8a8478] hover:text-foreground'
                    }`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right icons */}
          <div className="hidden lg:flex items-center gap-0.5 sm:gap-1">

            {/* Search — expands inline (hidden on very small screens when closed) */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-1 animate-fade-in">
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-32 sm:w-48 lg:w-56 px-3 py-1.5 bg-[#141414] border border-[#c9a84c44] rounded-sm text-sm text-foreground placeholder-[#8a8478] focus:outline-none focus:border-accent transition-colors"
                />
                <button type="submit" className="p-2 text-[#8a8478] hover:text-accent transition-colors" aria-label="Search">
                  <Search size={17} />
                </button>
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 text-[#8a8478] hover:text-foreground transition-colors" aria-label="Close">
                  <X size={17} />
                </button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" aria-label="Search">
                <Search size={19} />
              </button>
            )}

            {user ? (
              <>
                {userName && (
                  <span className="hidden md:inline-flex text-sm text-[#8a8478] font-body">
                    Hi, {userName}
                  </span>
                )}
                <Link href="/favorites" className="p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" title="Favorites">
                  <Heart size={19} />
                </Link>
                <Link href="/orders" className="p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" title="My Orders">
                  <User size={19} />
                </Link>
                <Link href="/account" className="hidden sm:inline-flex p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" title="My Account">
                  <LayoutDashboard size={19} />
                </Link>
                <button onClick={handleLogout} className="p-2 text-[#8a8478] hover:text-foreground transition-colors duration-300" title="Sign out">
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/track-order"
                  className="p-2 text-[#8a8478] hover:text-accent transition-colors duration-300"
                  title="Track Order"
                >
                  <PackageSearch size={19} />
                </Link>
                <Link
                  href="/login"
                  className="hidden md:inline-flex px-4 sm:px-5 py-2 border border-[#c9a84c55] text-accent text-xs font-body font-medium tracking-[0.15em] uppercase rounded-sm hover:bg-accent hover:text-[#080808] transition-all duration-300 btn-press"
                >
                  Login
                </Link>
              </>
            )}


            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" title="Cart">
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-[#080808] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold leading-none animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile/tablet right — cart + hamburger */}
          <div className="lg:hidden flex items-center gap-1">
            <Link href="/cart" className="relative p-2 text-[#8a8478] hover:text-accent transition-colors duration-300" title="Cart">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-[#080808] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold leading-none animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="p-2 text-[#8a8478] hover:text-accent transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/tablet menu — below lg */}
      <div
        className={`lg:hidden block overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="glass border-t border-[#c9a84c22] px-4 py-5 flex flex-col gap-1">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8478]" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full pl-9 pr-3 py-2.5 bg-[#141414] border border-[#222] rounded-sm text-sm text-foreground placeholder-[#8a8478] focus:outline-none focus:border-[#c9a84c44]"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-accent text-[#080808] rounded-sm text-xs font-body font-medium tracking-wider uppercase">
              Go
            </button>
          </form>

          <div className="divider-gold mb-3" />

          {navLinks.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-3 text-sm font-body font-light tracking-widest uppercase transition-all duration-200 rounded-sm ${active
                  ? 'text-accent bg-[#c9a84c0a]'
                  : 'text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c]'
                  }`}
              >
                {label}
              </Link>
            )
          })}

          {!user && (
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/cart"
                className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-3"><ShoppingCart size={15} /> Cart</span>
                {cartCount > 0 && (
                  <span className="bg-accent text-[#080808] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                href="/track-order"
                className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center gap-3"
              >
                <PackageSearch size={15} /> Track Order
              </Link>
              <Link
                href="/login"
                className="px-3 py-3 border border-[#c9a84c55] text-accent rounded-sm text-sm font-body font-medium tracking-[0.15em] uppercase text-center hover:bg-accent hover:text-[#080808] transition-all duration-300"
              >
                Login
              </Link>
            </div>
          )}


          {user && (
            <div className="mt-3 pt-3 border-t border-[#1c1c1c] flex flex-col gap-1">
              {userName && (
                <div className="px-3 py-2 text-sm font-body text-accent">
                  Hi, {userName}
                </div>
              )}
              <Link href="/cart" className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center justify-between gap-3">
                <span className="flex items-center gap-3"><ShoppingCart size={15} /> Cart</span>
                {cartCount > 0 && (
                  <span className="bg-accent text-[#080808] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-body font-semibold leading-none">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/account" className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center gap-3">
                <LayoutDashboard size={15} /> My Account
              </Link>
              <Link href="/favorites" className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center gap-3">
                <Heart size={15} /> Favorites
              </Link>
              <Link href="/orders" className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center gap-3">
                <User size={15} /> My Orders
              </Link>
              <button onClick={handleLogout} className="px-3 py-3 rounded-sm text-sm font-body text-[#8a8478] hover:text-foreground hover:bg-[#1c1c1c] transition-all flex items-center gap-3 w-full text-left">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}