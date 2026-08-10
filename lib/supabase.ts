import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Product {
  id: string
  name: string
  category: string
  price: number
  image: string
  rating: number
  reviews: number
  description?: string
  in_stock?: boolean
  sizes?: string[]
}

export interface Order {
  id?: string
  customer_email: string
  customer_name: string
  amount: number
  paystack_reference?: string
  status?: string
  items?: any
  created_at?: string
}
