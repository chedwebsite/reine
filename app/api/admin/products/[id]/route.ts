import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin, applyRateLimit } from '@/lib/security'
import { adminProductSchema } from '@/lib/validation'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  const rateError = applyRateLimit(req, 60, 60_000)
  if (rateError) return rateError

  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

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

  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').update(parsed.data).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  const rateError = applyRateLimit(req, 30, 60_000)
  if (rateError) return rateError

  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}