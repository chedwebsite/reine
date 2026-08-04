import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 200 })
  const { data } = await supabase
    .from('user_favorites')
    .select('product_id')
    .eq('user_id', user.id)
  return NextResponse.json((data ?? []).map((r: any) => r.product_id))
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { product_id } = await req.json()
  const { error } = await supabase.from('user_favorites').insert({ user_id: user.id, product_id })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { product_id } = await req.json()
  await supabase.from('user_favorites').delete().eq('user_id', user.id).eq('product_id', product_id)
  return NextResponse.json({ success: true })
}
