import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import crypto from 'crypto'

/**
 * Server-side admin authorization check.
 * Verifies the current session user exists in the admin_users table.
 * Returns true if authorized, false otherwise.
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}

/**
 * Wraps an admin-only API handler. Returns 401/403 if not authorized.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const admin = await isAdmin()
  if (!admin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 403 }
    )
  }
  return null
}

// ─── Rate Limiting ────────────────────────────────────────────────
// Simple in-memory sliding-window rate limiter.
// NOTE: For production with multiple instances, use Redis/Upstash instead.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key)
  }
}, 60_000).unref?.()

/**
 * Rate limit by IP + route.
 * @param key - Unique key (e.g. IP + route path)
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { allowed: true }
}

/**
 * Get client IP from request (handles proxies).
 */
export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/**
 * Apply rate limiting to a request.
 * Returns a 429 response if rate limited, null otherwise.
 */
export function applyRateLimit(
  req: NextRequest,
  limit: number,
  windowMs: number
): NextResponse | null {
  const ip = getClientIp(req)
  const path = new URL(req.url).pathname
  const result = rateLimit(`${ip}:${path}`, limit, windowMs)

  if (!result.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter ?? 60),
        },
      }
    )
  }
  return null
}

// ─── CSRF Protection ──────────────────────────────────────────────
// Simple double-submit cookie pattern for state-changing requests.

const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

/**
 * Generate a CSRF token and set it as a cookie.
 * Call this on GET requests that render forms.
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Verify the CSRF token from the request header matches the cookie.
 * Returns true if valid.
 */
export function verifyCsrf(req: NextRequest): boolean {
  const cookieToken = req.cookies.get(CSRF_COOKIE)?.value
  const headerToken = req.headers.get(CSRF_HEADER)
  if (!cookieToken || !headerToken) return false
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  )
}

/**
 * Apply CSRF protection to a state-changing request.
 * Returns a 403 response if invalid, null otherwise.
 */
export function applyCsrf(req: NextRequest): NextResponse | null {
  if (!verifyCsrf(req)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    )
  }
  return null
}

export { CSRF_COOKIE, CSRF_HEADER }