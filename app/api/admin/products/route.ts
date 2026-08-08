import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin, applyRateLimit } from '@/lib/security'
import { adminProductSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  // Rate limit admin reads
  const rateError = applyRateLimit(req, 60, 60_000)
  if (rateError) return rateError

  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  // Rate limit admin writes
  const rateError = applyRateLimit(req, 30, 60_000)
  if (rateError) return rateError

  // Validate input
  const body = await req.json().catch(() => null)
  const parsed = adminProductSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.from('products').insert([parsed.data]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}