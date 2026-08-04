# Reine Luxe Co. - Quick Start Guide

## Overview

You now have a fully functional luxury ecommerce website integrated with Paystack for secure payments. The site is ready to test locally and deploy to production.

---

## Local Development (Already Running)

The development server is already running at: **http://localhost:3000**

### Access These Pages:
- **Homepage**: http://localhost:3000
- **Collections**: http://localhost:3000/collections
- **Cart**: http://localhost:3000/cart
- **About**: http://localhost:3000/about
- **Contact**: http://localhost:3000/contact

---

## Testing the Full Flow

### Step 1: Browse Products
1. Go to http://localhost:3000/collections
2. See all 8 luxury products
3. Filter by category (Haute Couture, Accessories, Jewelry)

### Step 2: Add to Cart
1. Click the shopping cart icon on any product
2. You can add multiple items
3. Cart persists in your browser

### Step 3: View Cart
1. Click the cart icon in the top right
2. Adjust quantities with +/- buttons
3. See order summary with taxes and shipping

### Step 4: Proceed to Checkout
1. Click "Proceed to Checkout" button
2. Fill in your details:
   - Email: test@example.com
   - Full Name: Test Customer
   - Phone: +234 800 000 0000
   - Address: 123 Test Street
   - City: Test City
   - State: Test State

### Step 5: Complete Payment
1. Click "Pay with Paystack"
2. You'll be redirected to Paystack checkout
3. Use test card: **4111 1111 1111 1111**
4. Enter any future expiry date (e.g., 12/25)
5. Enter any 3-digit CVV (e.g., 123)
6. Complete payment
7. See order confirmation page

---

## Key Files & What They Do

| File | Purpose |
|------|---------|
| `app/page.tsx` | Beautiful homepage hero section |
| `app/collections/page.tsx` | Product catalog with 8 items |
| `app/cart/page.tsx` | Shopping cart management |
| `app/checkout/page.tsx` | Payment form + Paystack integration |
| `app/order-confirmation/page.tsx` | Success page after payment |
| `app/layout.tsx` | Root layout with fonts & styling |
| `app/globals.css` | Design tokens (colors, spacing) |
| `lib/paystack.ts` | Paystack utilities & API calls |
| `app/api/payments/initialize/route.ts` | Start payment API |
| `app/api/payments/verify/route.ts` | Verify payment API |

---

## Configuration

### Environment Variables (Already Set)
✅ `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` - Client-side key (safe to expose)
✅ `PAYSTACK_SECRET_KEY` - Server-side key (secure)

These are configured in your Vercel project settings.

### Pricing & Currency
- Currency: Nigerian Naira (₦)
- Shipping: Fixed ₦50
- Tax: 10% of subtotal
- All prices displayed in Naira

---

## Customization Quick Tips

### Change Prices
Edit `app/collections/page.tsx` line 10-30, modify the `products` array:
```javascript
price: 250000,  // Change to your price
```

### Change Colors
Edit `app/globals.css` line 52-83:
```css
--accent: #d4af37;        // Gold
--background: #0a0a0a;    // Black
--foreground: #f5f5f0;    // Cream
```

### Add More Products
In `app/collections/page.tsx`, add objects to the `products` array:
```javascript
{
  id: '9',
  name: 'New Product',
  category: 'Jewelry',
  price: 200000,
  image: 'image-url.jpg',
  rating: 5,
  reviews: 10,
}
```

### Change Text/Copy
All text is easily editable in the page files. Just search for the text you want to change.

---

## Deploying to Production

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
     - `PAYSTACK_SECRET_KEY`
   - Deploy

3. **Update Paystack Keys**
   - Get live keys from Paystack dashboard
   - Update environment variables in Vercel settings
   - Keys start with `pk_live_` and `sk_live_`

---

## Paystack Test Cards

Use these to test payments:

| Card Type | Number | CVV | Expiry |
|-----------|--------|-----|--------|
| Visa | 4111 1111 1111 1111 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |

---

## Troubleshooting

### Payment not initializing?
- Check environment variables are set in Vercel
- Verify Paystack keys are correct (not flipped)
- Check browser console for errors

### Cart not persisting?
- Cart uses browser localStorage
- Make sure cookies/storage is enabled
- Clear browser cache if having issues

### Prices showing incorrectly?
- Paystack expects amount in kobo (1/100 of naira)
- Code automatically multiplies by 100
- Check `lib/paystack.ts` line 20

### Styling not loading?
- Run `pnpm install` to ensure all packages installed
- Restart dev server with `pnpm dev`
- Clear Next.js cache: `rm -rf .next`

---

## Next Steps

1. **Test Locally** - Complete the full checkout flow
2. **Deploy** - Push to Vercel
3. **Monitor** - Watch payments in Paystack dashboard
4. **Customize** - Update products, prices, and content
5. **Enhance** - Add features like user accounts, wishlists, reviews

---

## Resources

- **Paystack Dashboard**: https://dashboard.paystack.com
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Next.js Docs**: https://nextjs.org
- **Paystack API**: https://paystack.com/docs/api/

---

## Support

For help with:
- **Paystack**: https://paystack.com/support
- **Vercel**: https://vercel.com/support
- **Next.js**: https://github.com/vercel/next.js/discussions

---

## Summary

You have a production-ready luxury ecommerce platform with:
- ✅ Beautiful luxury design
- ✅ Product catalog
- ✅ Shopping cart
- ✅ Secure Paystack payments
- ✅ Order confirmation
- ✅ Mobile responsive
- ✅ Ready to deploy

**Everything is configured and ready to go!** 🚀
