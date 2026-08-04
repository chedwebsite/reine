'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth-provider'
import { createClient } from '@/lib/supabase-browser'
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const isLoginPage = pathname === '/admin/login'

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

  if (isLoginPage) return <>{children}</>
  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-background flex">
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
          <Link
            href="/api/auth/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition"
          >
            <LogOut size={16} />
            Logout
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}
