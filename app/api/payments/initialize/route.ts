import { NextRequest, NextResponse } from 'next/server'
import { initializePayment } from '@/lib/paystack'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, orderId, customerName, items, userId } = body

    if (!email || !amount || !orderId || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await initializePayment({
      email,
      amount,
      orderId,
      customerName,
    })

    const reference = result.data?.reference
    if (reference) {
      await supabase.from('orders').insert({
        customer_email: email,
        customer_name: customerName,
        amount,
        paystack_reference: reference,
        status: 'pending',
        items: items ?? [],
        // Store the authenticated user's ID so orders can be tracked reliably
        user_id: userId ?? null,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}