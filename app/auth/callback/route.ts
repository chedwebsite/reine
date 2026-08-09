import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const type = searchParams.get('type')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      // If there's an error, redirect to login with error message
      return NextResponse.redirect(`${origin}/login?error=confirmation_failed`)
    }

    // For email confirmation, redirect to success page
    if (type === 'signup' || type === 'email') {
      return NextResponse.redirect(`${origin}/login?confirmed=true`)
    }

    // For password recovery, redirect to account page where user can set new password
    if (type === 'recovery') {
      return NextResponse.redirect(`${origin}/account?recovery=true`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
