import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { requireAdmin, applyRateLimit } from '@/lib/security'
import { adminOrderUpdateSchema } from '@/lib/validation'
import { sendOrderStatusUpdate } from '@/lib/email'

export async function GET(req: NextRequest) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  // Rate limit admin reads
  const rateError = applyRateLimit(req, 60, 60_000)
  if (rateError) return rateError

  const supabase = await createClient()

  // Search + filter + pagination
  const url = new URL(req.url)
  const search = url.searchParams.get('search')?.trim() ?? ''
  const status = url.searchParams.get('status')?.trim() ?? ''
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10) || 20))

  let query = supabase.from('orders').select('*', { count: 'exact' })

  if (status) {
    query = query.eq('status', status)
  }

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,paystack_reference.ilike.%${search}%`
    )
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    },
  })
}

export async function PATCH(req: NextRequest) {
  // Admin-only
  const adminError = await requireAdmin()
  if (adminError) return adminError

  // Rate limit admin writes
  const rateError = applyRateLimit(req, 30, 60_000)
  if (rateError) return rateError

  // Validate input
  const body = await req.json().catch(() => null)
  const parsed = adminOrderUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const { id, status, trackingNumber } = parsed.data
  const supabase = await createClient()

  // Fetch current order to append to status_history
  const { data: existing } = await supabase
    .from('orders')
    .select('status, status_history, customer_email, customer_name')
    .eq('id', id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const history = Array.isArray(existing.status_history) ? existing.status_history : []
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

  // Send status update email on every status change
  if (updated) {
    await sendOrderStatusUpdate({
      to: updated.customer_email,
      customerName: updated.customer_name,
      reference: updated.paystack_reference ?? id,
      status,
      trackingNumber: trackingNumber ?? undefined,
    }).catch(console.error)
  }

  return NextResponse.json(updated)
}