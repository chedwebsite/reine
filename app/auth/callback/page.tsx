'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { isAuthPKCECodeVerifierMissingError } from '@supabase/supabase-js'

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
  // One stable browser client for the whole page. Creating a fresh client on
  // every render can race with the automatic `#fragment` processing
  // (particularly under React StrictMode in dev), which is a classic cause of a
  // false "missing its authentication token" failure for implicit-grant links.
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    async function waitForAutoProcessedSession(timeoutMs = 4000) {
      // When Supabase redirects with tokens in the URL fragment
      // (`#access_token=...&type=...`), supabase-js detects and stores them
      // asynchronously on initialization. Poll getSession() (which awaits the
      // client's initializePromise) and give the fragment processing a grace
      // period before declaring the link dead.
      const start = Date.now()
      while (Date.now() - start < timeoutMs) {
        const { data } = await supabase.auth.getSession()
        if (data.session) return data.session
        await new Promise((resolve) => setTimeout(resolve, 250))
      }
      // One last check in case the session was persisted just after the loop.
      return (await supabase.auth.getSession()).data.session
    }

    async function process() {
      const code = searchParams.get('code')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type') ?? 'email'
      const next = searchParams.get('next') ?? '/'

      // Supabase redirects FAILED / EXPIRED links back with error params and
      // NO code/token_hash. Surface the real cause instead of the generic
      // "missing token" message, which misleads users whose link just expired.
      const errorCode = searchParams.get('error_code')
      const errorDescription = searchParams.get('error_description')
      const errorParam = searchParams.get('error')

      const expiredOrInvalid = (message: string) =>
        errorCode === 'otp_expired' || /expired|invalid|already used/i.test(message)

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (handled.current) return
          if (error) {
            // PKCE link opened in a browser/device that doesn't hold the
            // code_verifier created at signup (e.g. a different device, or after
            // the originating browser's storage/cookies were cleared). For an
            // email CONFIRMATION link this is NOT a real failure: Supabase's
            // /auth/v1/verify step already confirmed the email server-side
            // before redirecting us here. We just can't auto-sign-in on this
            // device, so route to the confirmation-success flow instead of
            // showing a scary "Confirmation failed".
            const isEmailConfirmationFlow = !['recovery', 'magiclink'].includes(type)
            const isConfirmedButCannotSignIn =
              isAuthPKCECodeVerifierMissingError(error) && isEmailConfirmationFlow

            if (isConfirmedButCannotSignIn) {
              // fall through → success ("Email Confirmed"), user signs in manually
            } else {
              handled.current = true
              setState('error')
              setError(
                expiredOrInvalid(error.message)
                  ? 'This confirmation link has expired or was already used. Please request a new verification email from the Sign In page.'
                  : error.message
              )
              return
            }
          }
        } else if (tokenHash) {
          const validTypes = ['signup', 'email', 'recovery', 'magiclink', 'email_change', 'sms']
          const otpType = validTypes.includes(type) ? (type as 'signup') : 'email'
          const { error } = await supabase.auth.verifyOtp({ type: otpType, token_hash: tokenHash })
          if (handled.current) return
          if (error) {
            handled.current = true
            setState('error')
            setError(
              expiredOrInvalid(error.message)
                ? 'This confirmation link has expired or was already used. Please request a new verification email from the Sign In page.'
                : error.message
            )
            return
          }
        } else {
          // No code, no token_hash. Two sub-cases:
          //
          // 1) Supabase redirected a FAILED link back with `?error=/error_code=`.
          // 2) Implicit-grant / fragment flow (`#access_token=...&type=...`):
          //    the tokens live in the URL FRAGMENT, which useSearchParams cannot
          //    see. supabase-js auto-detects the fragment during client init,
          //    confirms the email server-side and stores the session, so wait
          //    for that automatic processing to finish before giving up.
          if (errorParam || errorCode) {
            handled.current = true
            setState('error')
            setError(
              errorDescription && errorDescription !== 'null'
                ? errorDescription
                : 'This confirmation link is invalid, expired, or has already been used. Please request a new verification email from the Sign In page.'
            )
            return
          }

          const session = await waitForAutoProcessedSession()
          if (handled.current) return
          if (!session) {
            handled.current = true
            // The callback arrived with no auth payload at all. This happens when
            // the link in the email doesn't actually carry the token — usually a
            // broken email template (the button href must keep Supabase's
            // `{{ .ConfirmationURL }}` placeholder) or an email client that
            // mangled/truncated the URL.
            console.warn('[auth-callback] no token payload in callback:', window.location.href)
            setState('error')
            setError(
              'This link is missing its authentication token, so your email could not be verified. The link may be invalid, already used, or expired — or the confirmation email link itself may be incomplete (the email template button must use Supabase\u2019s {{ .ConfirmationURL }} placeholder). Please try again or use the "Resend verification email" option on the Sign In page.'
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
