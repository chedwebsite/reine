'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase-browser'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
]

const INACTIVITY_MS = 10 * 60 * 1000 // 10 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isLoginPage = pathname === '/admin/login'

  const signOut = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }, [router])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningRef.current) clearTimeout(warningRef.current)
    setShowWarning(false)

    // Show warning 1 min before timeout
    warningRef.current = setTimeout(() => setShowWarning(true), INACTIVITY_MS - 60_000)
    timeoutRef.current = setTimeout(() => signOut(), INACTIVITY_MS)
  }, [signOut])

  // Admin check + session persistence
  useEffect(() => {
    if (isLoginPage) return
    if (session === undefined) return
    if (session === null) { router.push('/admin/login'); return }

    const supabase = createClient()
    supabase.from('admin_users').select('id').eq('id', user!.id).maybeSingle().then(({ data }) => {
      if (!data) { supabase.auth.signOut(); router.push('/admin/login') }
      else setIsAdmin(true)
    })
  }, [isLoginPage, user, session, router])

  // Inactivity timer
  useEffect(() => {
    if (isLoginPage || !isAdmin) return

    resetTimer()
    ACTIVITY_EVENTS.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningRef.current) clearTimeout(warningRef.current)
      ACTIVITY_EVENTS.forEach(e => window.removeEventListener(e, resetTimer))
    }
  }, [isLoginPage, isAdmin, resetTimer])

  if (isLoginPage) return <>{children}</>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-background flex">
      {showWarning && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-900/90 border border-yellow-500/50 text-yellow-300 text-sm px-4 py-3 rounded-sm shadow-lg">
          Session expiring in 1 minute due to inactivity.{' '}
          <button onClick={resetTimer} className="underline font-semibold ml-1">Stay logged in</button>
        </div>
      )}

      <aside className="w-56 border-r border-border flex flex-col py-8 px-4 gap-2">
        <Link href="/" className="text-xl font-display font-bold tracking-widest text-foreground mb-8 px-2">
          REINE LUX
        </Link>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-body transition ${
              pathname === href
                ? 'bg-accent text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <div className="mt-auto">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition w-full"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
