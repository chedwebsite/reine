import axios from 'axios'

const PAYSTACK_API_URL = 'https://api.paystack.co'

// Lazy client factory with the secret-key guard centralized here instead of
// being duplicated in initializePayment/verifyPayment. The client is created
// once and cached, and the guard runs only when a Paystack call is actually
// made (not at import time), guaranteeing the Authorization header is never
// built with `Bearer undefined`.
let paystackClient: ReturnType<typeof axios.create> | null = null

function getPaystackClient() {
  if (paystackClient) return paystackClient

  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'PAYSTACK_SECRET_KEY is not set — add it to your server environment (Vercel → Project → Settings → Environment Variables → Redeploy).'
    )
  }

  paystackClient = axios.create({
    baseURL: PAYSTACK_API_URL,
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })
  return paystackClient
}

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
  try {
    const response = await getPaystackClient().post('/transaction/initialize', {
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
  try {
    const response = await getPaystackClient().get(`/transaction/verify/${params.reference}`)
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
