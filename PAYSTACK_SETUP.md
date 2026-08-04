# Reine Luxe Co. - Paystack Integration Guide

## Overview

This is a luxury ecommerce website built with Next.js 16 and integrated with Paystack for secure payment processing. The application features a sophisticated dark theme with gold accents, perfect for a high-end brand.

## Key Features

### Frontend Features
- **Homepage**: Hero section with featured collections and newsletter signup
- **Collections Page**: Browse all products with category filtering
- **Shopping Cart**: Add/remove items with quantity management and localStorage persistence
- **Checkout Flow**: Multi-step form for customer information and shipping
- **Order Confirmation**: Success page after payment verification

### Payment Integration (Paystack)
- **Payment Initialization**: API route that initializes Paystack transactions
- **Payment Verification**: API route that verifies payment status using Paystack reference
- **Secure Transactions**: Server-side secret key handling with client-side public key

### Design System
- **Typography**: Playfair Display (headings), Lora (body)
- **Color Scheme**:
  - Background: #0a0a0a (Deep Black)
  - Foreground: #f5f5f0 (Cream)
  - Accent: #d4af37 (Gold)
  - Secondary: #2a2a2a (Dark Gray)
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Project Structure

```
app/
├── page.tsx                          # Homepage
├── collections/
│   └── page.tsx                      # Collections & products
├── cart/
│   └── page.tsx                      # Shopping cart
├── checkout/
│   └── page.tsx                      # Checkout form with Paystack integration
├── order-confirmation/
│   └── page.tsx                      # Payment success page
├── api/
│   └── payments/
│       ├── initialize/route.ts       # Initialize Paystack payment
│       └── verify/route.ts           # Verify payment status
├── layout.tsx                        # Root layout with fonts
└── globals.css                       # Design tokens and styles

lib/
└── paystack.ts                       # Paystack utility functions
```

## Environment Variables

Required environment variables:
```env
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx  # Client-side public key
PAYSTACK_SECRET_KEY=sk_test_xxxxx              # Server-side secret key
```

These should be added in your Vercel project settings or `.env.local`.

## How It Works

### Payment Flow
1. User adds items to cart (stored in localStorage)
2. User proceeds to checkout
3. User fills in contact and shipping information
4. User clicks "Pay with Paystack"
5. Backend initializes payment with Paystack API
6. User is redirected to Paystack checkout page
7. User completes payment (test: use test cards provided by Paystack)
8. Paystack redirects back with payment reference
9. Backend verifies payment status
10. Order confirmation page is displayed
11. Cart is cleared from localStorage

### API Routes

#### POST `/api/payments/initialize`
Initializes a Paystack payment transaction.

Request body:
```json
{
  "email": "customer@example.com",
  "amount": 1000.00,
  "orderId": "order_1234567890",
  "customerName": "John Doe"
}
```

Response: Paystack authorization response with `authorization_url`

#### POST `/api/payments/verify`
Verifies a payment using the Paystack reference code.

Request body:
```json
{
  "reference": "paystack_reference_code"
}
```

Response: Paystack verification response with payment status

## Testing

### Test Paystack Integration
1. Use Paystack test credentials provided in your dashboard
2. Test cards:
   - Visa: 4111 1111 1111 1111
   - Mastercard: 5555 5555 5555 4444
3. Expiry: Any future date
4. CVV: Any 3 digits

### Test Flow
1. Navigate to http://localhost:3000
2. Click "Explore Collections"
3. Add products to cart
4. Proceed to checkout
5. Fill in test customer information
6. Click "Pay with Paystack"
7. Complete payment with test card
8. Verify order confirmation

## Customization

### Products
Products are currently hardcoded in `/app/collections/page.tsx`. To add a database connection:
1. Connect a database (Neon, Supabase, etc.)
2. Create a products table
3. Update the collections page to fetch from database

### Styling
- Design tokens are defined in `app/globals.css`
- Font variables are configured in `app/layout.tsx`
- Modify Tailwind classes to adjust styling

### Shipping & Tax
- Shipping cost: Fixed ₦50 per order
- Tax rate: 10% of subtotal
- Modify in `checkout/page.tsx` as needed

## Security Considerations

✅ **Implemented:**
- Server-side Paystack secret key handling
- Environment variables for sensitive data
- Payment verification on backend
- Input validation in checkout form

📋 **Recommendations for Production:**
- Add HTTPS enforcement
- Implement CSRF protection
- Add rate limiting on API routes
- Store orders in database with user tracking
- Implement email notifications
- Add order history page for users
- Implement user authentication
- Add security headers (CSP, etc.)

## Deployment

The app is ready to deploy to Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel settings
4. Deploy

## Dependencies

- `next`: 16.0.0
- `react`: 19.0.0
- `tailwindcss`: 4.0.0
- `axios`: 1.19.0
- `lucide-react`: Icon library

## Support

For issues or questions about Paystack integration, refer to:
- Paystack Documentation: https://paystack.com/docs
- Paystack API Reference: https://paystack.com/docs/api/
