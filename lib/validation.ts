import { z } from 'zod'

// ─── Payment ─────────────────────────────────────────────────────
export const paymentInitializeSchema = z.object({
  email: z.string().email('Invalid email address'),
  amount: z.number().positive('Amount must be positive'),
  orderId: z.string().min(1, 'Order ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
      size: z.string().optional(),
    })
  ).optional().default([]),
  userId: z.string().uuid().nullable().optional(),
  shippingAddress: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    zip: z.string().max(20).optional(),
    phone: z.string().max(30).optional(),
  }).optional(),
})

export const paymentVerifySchema = z.object({
  reference: z.string().min(1, 'Reference is required'),
})

// ─── Contact ─────────────────────────────────────────────────────
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(30).optional(),
  message: z.string().min(1, 'Message is required').max(5000),
})

// ─── Account ─────────────────────────────────────────────────────
export const accountUpdateSchema = z.object({
  fullName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zip: z.string().max(20).optional(),
})

// ─── Admin ───────────────────────────────────────────────────────
export const adminOrderUpdateSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().max(100).optional(),
})

export const adminProductSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  category: z.string().min(1, 'Category is required'),
  price: z.number().nonnegative('Price must be non-negative'),
  image: z.string().url('Invalid image URL'),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  in_stock: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
})

// ─── Cart / Favorites ────────────────────────────────────────────
export const cartUpdateSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      image: z.string().optional(),
      size: z.string().optional(),
    })
  ),
})

export const favoriteSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
})

// ─── Auth ────────────────────────────────────────────────────────
export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// ─── Public order tracking ───────────────────────────────────────
export const orderTrackSchema = z.object({
  reference: z.string().min(3, 'Order reference is required').max(100),
  email: z.string().email('Invalid email address'),
})


