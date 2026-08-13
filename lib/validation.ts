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
      color: z.string().optional(),
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
  sale_price: z.number().min(0, 'Sale price must be non-negative').nullable().optional(),
  image: z.string().url('Invalid image URL'),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().int().nonnegative().optional(),
  in_stock: z.boolean().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  main_image_colors: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      url: z.string().url('Invalid image URL'),
      colors: z.array(z.string()).optional(),
    })
  ).optional(),
}).refine(
  (data) => data.sale_price == null || data.sale_price < data.price,
  { message: 'Sale price must be lower than the regular price', path: ['sale_price'] }
)

// ─── Cart / Favorites ────────────────────────────────────────────
// A single cart line-item. Shared by the server cart endpoint and the client
// checkout page so both validate against the exact same shape.
export const cartItemSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
  name: z.string().min(1, 'Product name is required'),
  price: z.number().nonnegative('Price must be a non-negative number'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  image: z.string().optional(),
  size: z.string().optional(),
  color: z.string().optional(),
})

export const cartUpdateSchema = z.object({
  items: z.array(cartItemSchema),
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


