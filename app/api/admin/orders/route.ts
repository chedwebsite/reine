import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('orders').select('*').order('id', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { id, status, trackingNumber } = await req.json()

  // Fetch current order to append to status_history
  const { data: existing } = await supabase
    .from('orders')
    .select('status, status_history')
    .eq('id', id)
    .single()

  const history = Array.isArray(existing?.status_history) ? existing.status_history : []
  const newEntry = {
    status,
    timestamp: new Date().toISOString(),
  }

  const updatePayload: Record<string, unknown> = {
    status,
    status_history: [...history, newEntry],
  }

  // Optionally set a tracking number when marking as shipped
  if (trackingNumber) {
    updatePayload.tracking_number = trackingNumber
  }

  const { data: updated, error } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(updated)
}