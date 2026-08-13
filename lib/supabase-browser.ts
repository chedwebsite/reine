import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser-side Supabase client.
 *
 * Fail fast with a clear error if the public env vars are missing, instead of
 * passing `undefined` straight into `createBrowserClient()` (which the previous
 * `!` non-null assertions did — crashing at runtime with a hard-to-read error).
 * These are public ("anon") credentials, so they're safe to embed in the bundle;
 * they just need to be configured.
 *
 * Required env vars (see .env.local):
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error(
      '[supabase-browser] Missing environment variable NEXT_PUBLIC_SUPABASE_URL. ' +
        'Add it to your environment (see .env.local) and restart the development server.'
    )
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!anonKey) {
    throw new Error(
      '[supabase-browser] Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Add it to your environment (see .env.local) and restart the development server.'
    )
  }

  return createBrowserClient(url, anonKey)
}
