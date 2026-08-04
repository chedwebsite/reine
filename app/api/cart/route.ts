import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([])
  const { data } = await supabase.from('user_carts').select('items').eq('user_id', user.id).single()
  return NextResponse.json(data?.items ?? [])
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { items } = await req.json()
  await supabase.from('user_carts').upsert({ user_id: user.id, items, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  return NextResponse.json({ success: true })
}
