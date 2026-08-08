import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Package, Heart, Settings, ChevronRight } from 'lucide-react'
import Navbar from '@/components/navbar'
import ProfileForm from '@/components/account/profile-form'
import PasswordResetForm from '@/components/account/password-reset-form'

export const metadata: Metadata = {
  title: 'My Account | Reine Luxe Co.',
  description: 'Manage your Reine Luxe Co. account profile, view your orders, and track your favorites.',
  openGraph: {
    title: 'My Account | Reine Luxe Co.',
    description: 'Manage your Reine Luxe Co. account profile, view your orders, and track your favorites.',
  },
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ recovery?: string }>
}) {
  const { recovery } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch order count
  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user.id},and(customer_email.eq.${user.email?.replace(/'/g, "''")})`)

  const fullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Guest'

  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' })
    : ''

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Account</h1>

        {/* Password Recovery Banner */}
        {recovery === 'true' && (
          <div className="border border-accent/40 bg-accent/10 rounded-sm p-6 mb-8">
            <h2 className="text-lg font-display font-semibold text-foreground mb-2">
              Set a New Password
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter a new password for your account below.
            </p>
            <PasswordResetForm />
          </div>
        )}

        {/* Profile Header */}
        <div className="border border-border rounded-sm p-8 bg-secondary/30 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-accent/15 border-2 border-accent/40 flex items-center justify-center text-2xl font-display font-bold text-accent flex-shrink-0">
            {initials}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-display font-semibold text-foreground">{fullName}</h2>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            {memberSince && (
              <p className="text-xs text-muted-foreground/70 mt-2">Member since {memberSince}</p>
            )}
          </div>
          <div className="flex gap-4 sm:flex-col sm:items-end">
            <div className="text-center">
              <p className="text-2xl font-display font-bold text-accent">{orderCount ?? 0}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Orders</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Link href="/orders" className="border border-border rounded-sm p-5 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition group">
            <Package size={20} className="text-accent mb-3" />
            <p className="font-display font-semibold text-foreground">My Orders</p>
            <p className="text-xs text-muted-foreground mt-1">Track and manage your orders</p>
            <ChevronRight size={16} className="text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
          </Link>
          <Link href="/favorites" className="border border-border rounded-sm p-5 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition group">
            <Heart size={20} className="text-accent mb-3" />
            <p className="font-display font-semibold text-foreground">Favorites</p>
            <p className="text-xs text-muted-foreground mt-1">View your saved items</p>
            <ChevronRight size={16} className="text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
          </Link>
          <Link href="/contact" className="border border-border rounded-sm p-5 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition group">
            <Settings size={20} className="text-accent mb-3" />
            <p className="font-display font-semibold text-foreground">Support</p>
            <p className="text-xs text-muted-foreground mt-1">Get help with your account</p>
            <ChevronRight size={16} className="text-accent mt-3 opacity-0 group-hover:opacity-100 transition" />
          </Link>
        </div>

        {/* Profile Form */}
        <ProfileForm
          initialProfile={{
            fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '',
            phone: profile?.phone || '',
            address: profile?.address || '',
            city: profile?.city || '',
            state: profile?.state || '',
            zip: profile?.zip || '',
          }}
        />
      </div>
    </main>
  )
}