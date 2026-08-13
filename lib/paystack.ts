import axios from 'axios'

const PAYSTACK_API_URL = 'https://api.paystack.co'

const paystackClient = axios.create({
  baseURL: PAYSTACK_API_URL,
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  },
})

export interface InitializePaymentParams {
  email: string
  amount: number
  orderId: string
  customerName: string
}

export interface VerifyPaymentParams {
  reference: string
}

export async function initializePayment(params: InitializePaymentParams) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not set — add it to your server environment (Vercel → Project → Settings → Environment Variables → Redeploy).'
    )
  }
  try {
    const response = await paystackClient.post('/transaction/initialize', {
      email: params.email,
      amount: params.amount * 100, // Paystack expects amount in kobo (1/100 of naira)
      metadata: {
        orderId: params.orderId,
        customerName: params.customerName,
      },
    })
    return response.data
  } catch (error) {
    console.error('[Paystack] Initialize payment error:', error)
    throw error
  }
}

export async function verifyPayment(params: VerifyPaymentParams) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not set — add it to your server environment (Vercel → Project → Settings → Environment Variables → Redeploy).'
    )
  }
  try {
    const response = await paystackClient.get(`/transaction/verify/${params.reference}`)
    return response.data
  } catch (error) {
    console.error('[Paystack] Verify payment error:', error)
    throw error
  }
}

export function getPaystackPublicKey(): string {
  const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
  if (!key) {
    throw new Error('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set')
  }
  return key
}
