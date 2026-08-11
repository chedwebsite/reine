'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

/**
 * Client-side auth callback.
 *
 * Handles ALL auth links that come back through /auth/callback:
 *  - PKCE `?code=...` (OAuth, signup, recovery): exchanged on the CLIENT,
 *    because the code_verifier lives in this browser's storage — a server
 *    route can't access it.
 *  - `?token_hash=...&type=...` (email confirmation / magic link / invite):
 *    verified with verifyOtp, which does NOT need the code_verifier.
 *  - `<url>#access_token=...&type=...` (implicit-grant / fragment format that
 *    signup confirmation emails use). The tokens live in the URL FRAGMENT, so
 *    useSearchParams never exposes them. supabase-js auto-detects the fragment
 *    during client init (_initialize → _getSessionFromURL), confirms the email
 *    server-side, stores the session and clears the hash. We simply wait for
 *    that automatic processing via getSession() and check a session exists.
 *
 * This replaces the previous server route, which silently failed on PKCE
 * (producing "Email link is invalid or has expired") and ignored token_hash.
 */
function AuthCallbackContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    async function process() {
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') ?? 'email'
      const next = searchParams.get('next') ?? '/'

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (handled.current) return
          if (error) {
            handled.current = true
            setState('error')
            setError(error.message)
            return
          }
        } else if (tokenHash) {
          const validTypes = ['signup', 'email', 'recovery', 'magiclink', 'email_change', 'sms']
          const otpType = validTypes.includes(type) ? (type as 'signup') : 'email'
          const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash })
          if (handled.current) return
          if (error) {
            handled.current = true
            setState('error')
            setError(error.message)
            return
          }
        } else {
          // Implicit-grant / fragment flow (`#access_token=...&type=...`).
          // Signup confirmation emails commonly link to the callback with the
          // session tokens in the URL fragment. useSearchParams cannot see
          // those, but supabase-js auto-detects them on initialization,
          // confirms the email server-side and stores a session. So before
          // declaring the link invalid, wait for that automatic processing to
          // finish (getSession() awaits the client's initializePromise) and
          // check whether a session now exists.
          const { data } = await supabase.auth.getSession()
          if (handled.current) return
          if (!data.session) {
            handled.current = true
            setState('error')
            setError(
              'This link is missing its authentication token. It may be invalid, already used, or expired. Please try again or use the "Resend verification email" option on the Sign In page.'
            )
            return
          }
          // A session was established from the URL fragment → the email was
          // confirmed successfully.
        }

        handled.current = true
        setState('success')

        // Route to the appropriate destination after processing.
        if (type === 'recovery') {
          router.replace('/auth/reset-password')
        } else if (type === 'signup' || type === 'email') {
          // Keep the "next" target so "Continue to Website" on /login returns
          // the user to wherever they were headed.
          router.replace(`/login?confirmed=true&next=${encodeURIComponent(next)}`)
        } else {
          router.replace(next)
        }
      } catch (e) {
        handled.current = true
        setState('error')
        setError(e instanceof Error ? e.message : 'Unexpected error')
      }
    }

    process()
  }, [supabase, searchParams, router])

  if (state === 'loading') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center"><XCircle size={40} className="text-red-500" /></div>
          <h1 className="text-2xl font-display font-bold text-foreground">Confirmation failed</h1>
          <p className="text-muted-foreground text-sm">
            {error || 'The link is invalid or has expired. Please try again or contact support.'}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="inline-block bg-accent text-[#0a0a0a] px-6 py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition">
              Go to Sign In
            </Link>
            <Link href="/contact" className="inline-block text-accent hover:text-accent/80 text-sm font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="flex justify-center"><CheckCircle2 size={48} className="text-green-500" /></div>
        <h1 className="text-2xl font-display font-bold text-foreground">Success!</h1>
        <p className="text-muted-foreground text-sm">Redirecting you…</p>
      </div>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></main>}>
      <AuthCallbackContent />
    </Suspense>
  )
}
