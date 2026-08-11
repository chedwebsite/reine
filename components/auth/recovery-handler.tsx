'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

/**
 * Global password‑recovery handler (mounted in the root layout).
 *
 * Supabase sends password‑reset links with the session token in the URL
 * FRAGMENT (e.g. /#access_token=...&type=recovery). Fragments are not sent to
 * the server, so a server route (/auth/callback) can never see them — which is
 * why users landing on the project root saw no reset form. The browser
 * Supabase client reads that fragment itself and emits a `PASSWORD_RECOVERY`
 * auth event. We catch that here (on ANY page) and send the user to the
 * dedicated reset page.
 */
export default function RecoveryHandler() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // A recovery session is ready on the client → show the reset form.
        router.replace('/auth/reset-password')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return null
}
