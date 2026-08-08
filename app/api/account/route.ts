import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST204') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    email: user.email,
    userMetadata: user.user_metadata,
    profile: profile ?? null,
  })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { fullName, phone, address, city, state, zip } = body

  // Update auth user metadata (full name)
  if (fullName) {
    await supabase.auth.updateUser({
      data: { full_name: fullName, name: fullName },
    })
  }

  // Upsert user profile
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      full_name: fullName ?? null,
      phone: phone ?? null,
      address: address ?? null,
      city: city ?? null,
      state: state ?? null,
      zip: zip ?? null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    // If the table doesn't exist yet, still allow the metadata update to succeed
    if (error.code === 'PGRST204' || error.code === '42P01') {
      return NextResponse.json({
        message: 'Profile metadata updated, but profile table not available yet. Run supabase/account.sql to create it.',
        profile: null,
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Profile updated', profile: data })
}