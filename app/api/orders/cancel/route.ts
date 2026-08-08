import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

const cancelOrderSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const parsed = cancelOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { id } = parsed.data

  // Fetch the order to verify ownership and status
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Only the owner can cancel
  const isOwner =
    (order.user_id && order.user_id === user.id) ||
    (!order.user_id && order.customer_email === user.email)

  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Only pending orders can be cancelled
  if (order.status !== 'pending') {
    return NextResponse.json(
      { error: 'Only pending orders can be cancelled.' },
      { status: 400 }
    )
  }

  // Update the order status to cancelled
  const history = Array.isArray(order.status_history) ? order.status_history : []
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'cancelled',
      status_history: [...history, { status: 'cancelled', timestamp: new Date().toISOString() }],
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}