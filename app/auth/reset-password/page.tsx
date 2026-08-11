'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import PasswordResetForm from '@/components/account/password-reset-form'

/**
 * Dedicated password-reset page.
 *
 * Handles BOTH recovery flows:
 *  - PKCE code flow: the reset email carries `?code=...`. The code must be
 *    exchanged on the CLIENT because the code_verifier lives in the browser
 *    that initiated the reset — a server route can't access it (this is why
 *    the old /auth/callback server path produced "Email link is invalid or
 *    has expired").
 *  - Hash flow: tokens arrive in the URL fragment (`#access_token=...`) which
 *    Supabase's browser client picks up and surfaces as PASSWORD_RECOVERY.
 *
 * Once a valid recovery session exists, the password form is shown.
 */
function ResetPasswordContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'loading' | 'ready' | 'invalid'>('loading')
  const done = useRef(false)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined

    async function init() {
      // 1. PKCE code flow — exchange on the client so the code_verifier is used.
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (done.current) return
        if (error) {
          done.current = true
          setState('invalid')
          return
        }
        done.current = true
        setState('ready')
        return
      }

      // 2. A session may already be present (hash flow set it on this page).
      const { data: { session } } = await supabase.auth.getSession()
      if (done.current) return
      if (session?.user) {
        done.current = true
        setState('ready')
        return
      }

      // 3. Hash flow — wait for Supabase to surface the recovery session.
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || session?.user) {
          done.current = true
          setState('ready')
        }
      })
      subscription = sub.subscription
    }

    init()

    // If no recovery session materialises, treat the link as invalid/expired.
    const timer = setTimeout(() => {
      if (!done.current) {
        done.current = true
        setState('invalid')
      }
    }, 5000)

    return () => {
      done.current = true
      clearTimeout(timer)
      subscription?.unsubscribe()
    }
  }, [supabase, searchParams])

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    )
  }

  if (state === 'invalid') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center"><KeyRound size={40} className="text-accent" /></div>
          <h1 className="text-3xl font-display font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/login" className="inline-block bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition">
            Go to Sign In
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-accent text-sm font-semibold tracking-widest">SECURITY</p>
          <h1 className="mt-2 text-3xl font-display font-bold text-foreground">Set a New Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter a new password for your account.
          </p>
        </div>
        <PasswordResetForm />
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></main>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

