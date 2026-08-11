'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import PasswordResetForm from '@/components/account/password-reset-form'

/**
 * Dedicated password‑reset page.
 *
 * Reachable either via /auth/callback (code flow) or directly via the global
 * RecoveryHandler (hash flow). It waits until Supabase has a valid recovery
 * session, then shows the password form.
 */
export default function ResetPasswordPage() {
  const supabase = createClient()
  const [state, setState] = useState<'loading' | 'ready' | 'invalid'>('loading')
  const done = useRef(false)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined

    async function init() {
      // A session may already be set from the recovery hash on this page or
      // from a previous redirect.
      const { data: { session } } = await supabase.auth.getSession()
      if (done.current) return
      if (session?.user) {
        done.current = true
        setState('ready')
        return
      }

      // Otherwise wait for the recovery session to arrive (PASSWORD_RECOVERY).
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
  }, [supabase])

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
