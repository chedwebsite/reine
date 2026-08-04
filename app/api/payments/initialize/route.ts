import { NextRequest, NextResponse } from 'next/server'
import { initializePayment } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, amount, orderId, customerName } = body

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

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment initialization error:', error)
    return NextResponse.json(
      { error: 'Payment initialization failed' },
      { status: 500 }
    )
  }
}
