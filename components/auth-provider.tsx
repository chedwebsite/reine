'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'

const AuthContext = createContext<{
  user: User | null
  session: Session | null
  loading: boolean
  refreshSession: () => Promise<void>
}>({
  user: null,
  session: null,
  loading: true,
  refreshSession: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = async () => {
    try {
      // Use getUser() instead of getSession() — this validates the session
      // with the Supabase server and refreshes it if expired/expiring.
      const { data: { user: currentUser }, error } = await supabase.auth.getUser()
      if (error || !currentUser) {
        setSession(null)
        setUser(null)
        return
      }
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      setUser(currentUser)
    } catch {
      setSession(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    // 1. Initial session load + server-side validation
    refreshSession()

    // 2. Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      // IMPORTANT: handle SIGNED_OUT / TOKEN_REFRESHED / INITIAL_SESSION events
      if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      if (event === 'TOKEN_REFRESHED') {
        setSession(nextSession)
        setUser(nextSession?.user ?? null)
        setLoading(false)
        return
      }

      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    // 3. Periodic session refresh — Supabase tokens expire hourly by default.
    //    This keeps the user's session alive across locations/pages.
    const refreshInterval = setInterval(async () => {
      if (!mounted) return
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (currentSession?.expires_at) {
        const expiresAt = currentSession.expires_at * 1000 // ms
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000
        // Refresh if within 5 minutes of expiry
        if (expiresAt - now < fiveMinutes) {
          const { data: { user: refreshedUser }, error } = await supabase.auth.getUser()
          if (!error && refreshedUser) {
            setUser(refreshedUser)
            setSession((await supabase.auth.getSession()).data.session)
          } else {
            setSession(null)
            setUser(null)
          }
        }
      }
    }, 60 * 1000) // check every minute

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, session, loading, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)