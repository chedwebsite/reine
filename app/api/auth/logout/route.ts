import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
  const response = NextResponse.redirect(new URL('/login', baseUrl))
  // Explicitly clear Supabase auth cookies to guarantee the session is gone
  response.cookies.set('sb-auth-token', '', { maxAge: 0, path: '/' })
  return response
}

export async function POST() {
  return GET()
}