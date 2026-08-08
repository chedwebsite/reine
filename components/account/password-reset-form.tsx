'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function PasswordResetForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' })
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setTimeout(() => router.push('/account'), 1500)
    }
    setLoading(false)
  }

  const field = 'w-full px-4 py-3 bg-background border border-border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {message && (
        <div className={`p-3 rounded-sm text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-green-500/10 text-green-500 border border-green-500/30'}`}>
          {message.text}
        </div>
      )}

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={`${field} pr-12`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
        required
        className={field}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-[#0a0a0a] py-3 rounded-sm font-display font-semibold hover:bg-accent/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        Update Password
      </button>
    </form>
  )
}