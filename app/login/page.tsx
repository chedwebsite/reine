'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, Eye, EyeOff, Mail, KeyRound } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
        // If email not confirmed, show resend option
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setShowResend(true)
        }
      } else {
        router.push('/')
      }
    } else {
      const { error, data } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage({ type: 'error', text: error.message })
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
      redirectTo: `${window.location.origin}/auth/callback?next=/account`,
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
      options: { redirectTo: `${location.origin}/auth/callback` },
    })
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