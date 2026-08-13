'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, Eye, EyeOff, Mail, KeyRound, CheckCircle2 } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const next = searchParams.get('next') ?? '/'
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [showResend, setShowResend] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Auth email links (signup confirmation, password reset, resend, OAuth) must
  // always point at the deployed project URL (NEXT_PUBLIC_SITE_URL), never the
  // host the user happens to be on. Otherwise the "Confirm your email" link
  // resolves to http://localhost:3000 while developing/testing instead of the
  // real site (e.g. https://reine-mocha.vercel.app).
  const getSiteUrl = () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    return (siteUrl || window.location.origin).replace(/\/+$/, '')
  }

  const getAuthCallbackUrl = (target: string) =>
    `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(target)}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setShowResend(true)
        }
      } else {
        router.push(next)
      }
    } else {
      // Always send the confirmation link to the deployed project URL
      // (https://reine-mocha.vercel.app) via NEXT_PUBLIC_SITE_URL, so the email
      // redirect never points at localhost while developing/testing.
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(next),
        },
      })
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.session) {
        // No session is returned ONLY when the project requires email
        // confirmation ("Confirm email" ON in Supabase → Authentication →
        // Sign In / Providers → Email). If a session IS returned, the dashboard
        // has "Confirm email" switched OFF, so the account is live immediately.
        setMessage({
          type: 'success',
          text: 'Your account has been created and you are signed in.',
        })
        // Delay navigation briefly so the success message is actually seen
        // before this component unmounts — otherwise router.push discards it
        // instantly. The submit spinner stays active while we wait (loading is
        // still true), which also prevents double-submission during the delay.
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
        router.push(next)
      } else {
        setMessage({ type: 'success', text: 'Check your email to confirm your account.' })
        setShowResend(true)
      }
    }
    setLoading(false)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      // Route the PKCE code to the client reset page where it can be exchanged
      // using the code_verifier stored in this browser.
      redirectTo: `${getSiteUrl()}/auth/reset-password`,
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password reset link sent. Check your email.' })
      setShowReset(false)
    }
    setResetLoading(false)
  }

  const handleResendVerification = async () => {
    setLoading(true)
    setMessage(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email || resetEmail,
      options: {
        emailRedirectTo: getAuthCallbackUrl(next),
      },
    })
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Verification email resent. Check your inbox.' })
    }
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: getAuthCallbackUrl(next) },
    })
  }

  useEffect(() => {
    const confirmed = searchParams.get('confirmed')
    const error = searchParams.get('error')

    if (confirmed === 'true') {
      setShowSuccessModal(true)
    } else if (error === 'confirmation_failed') {
      setMessage({ type: 'error', text: 'Email confirmation failed. Please try again or contact support.' })
    }
  }, [searchParams])

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push(next)
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-display font-bold text-foreground tracking-widest">
            REINE LUXE
          </Link>
          <h1 className="mt-6 text-3xl font-display font-bold text-foreground">
            {showReset ? 'Reset Password' : mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
        </div>

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-background border border-border rounded-sm p-8 max-w-md w-full shadow-2xl">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 size={64} className="text-green-500" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Email Confirmed!
                </h2>
                <p className="text-muted-foreground font-body">
                  Your email has been successfully confirmed. You can now sign in to your account.
                </p>
                <button
                  onClick={handleSuccessModalClose}
                  className="w-full bg-accent text-[#0a0a0a] py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition"
                >
                  Continue to Website
                </button>
              </div>
            </div>
          </div>
        )}

        {showReset ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {message && (
              <div className={`p-3 rounded-sm text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-green-500/10 text-green-500 border border-green-500/30'}`}>
                {message.text}
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                value={resetEmail}
                onChange={e => setResetEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={resetLoading}
              className="w-full bg-accent text-[#0a0a0a] py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resetLoading && <Loader2 size={16} className="animate-spin" />}
              Send Reset Link
            </button>
            <button
              type="button"
              onClick={() => { setShowReset(false); setMessage(null) }}
              className="w-full text-center text-sm text-muted-foreground hover:text-accent transition"
            >
              ← Back to login
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className={`p-3 rounded-sm text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-green-500/10 text-green-500 border border-green-500/30'}`}>
                  {message.text}
                </div>
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowReset(true); setMessage(null) }}
                    className="text-sm text-accent hover:underline flex items-center gap-1"
                  >
                    <KeyRound size={14} /> Forgot password?
                  </button>
                </div>
              )}

              {showResend && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={loading}
                  className="w-full text-center text-sm text-accent hover:underline disabled:opacity-50"
                >
                  Resend verification email
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent text-[#0a0a0a] py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs text-muted-foreground"><span className="bg-background px-2">or</span></div>
            </div>

            <button
              onClick={handleGoogle}
              className="w-full border border-border text-foreground py-3 rounded-sm font-display font-semibold hover:bg-secondary/50 transition"
            >
              Continue with Google
            </button>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(null); setShowResend(false) }} className="text-accent hover:underline">
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>}>
      <LoginContent />
    </Suspense>
  )
}