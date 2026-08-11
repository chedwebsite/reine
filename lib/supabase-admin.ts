import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client authenticated with the SERVICE ROLE key.
 *
 * The service role bypasses Row Level Security, so this client is only for
 * server-side operations that legitimately need it (payment confirmation via
 * webhook/verify, order creation, and admin reads/writes). It MUST NEVER be
 * imported by client components or bundled for the browser — the key is a
 * highly-privileged secret.
 *
 * Env var: SUPABASE_SERVICE_ROLE_KEY
 *   (Supabase Dashboard → Settings → API → Project API keys → service_role)
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRoleKey) {
    throw new Error(
      '[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment ' +
        '(Supabase Dashboard → Settings → API → service_role) so server-side payment/admin code can run.'
    )
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
