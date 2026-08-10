import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ProductImage {
  url: string
  colors?: string[]
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  /** Optional explicit sale price (must be lower than `price`). When set, this is the price charged everywhere. */
  sale_price?: number | null
  image: string
  rating: number
  reviews: number
  description?: string
  in_stock?: boolean
  sizes?: string[]
  colors?: string[]
  /** Colors this exact main photo shows (mirrors the extra-image color tags) */
  main_image_colors?: string[]
  images?: ProductImage[]
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
