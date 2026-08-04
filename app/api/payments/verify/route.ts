import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      )
    }

    const result = await verifyPayment({ reference })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
