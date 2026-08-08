# Reine Luxe Co. — Project Upgrades & Recommendations

## ✅ What Was Fixed in This Session

### 1. Continuous Login / Session Persistence
- **`components/auth-provider.tsx`** — Replaced `getSession()` (cached) with `getUser()` (server-validated) for initial load. Added:
  - `SIGNED_OUT` / `TOKEN_REFRESHED` event handling
  - Automatic token refresh every minute when within 5 minutes of expiry
  - `loading` state and `refreshSession()` method exposed via context
- **`components/navbar.tsx`** — Logout now uses client-side `supabase.auth.signOut()` which immediately triggers the auth state change, keeping the UI in sync. No more stale "logged in" state after logout.
- **`app/api/auth/logout/route.ts`** — Added explicit cookie clearing for guaranteed server-side session termination.

### 2. Order Tracking
- **`app/orders/page.tsx`** — Orders now query by `user_id` (with email fallback for legacy orders). Added status badges and links to order detail pages.
- **`app/orders/[id]/page.tsx`** — **NEW** Order detail page with:
  - Visual tracking timeline (Order Placed → Payment Confirmed → Processing → Shipped → Delivered)
  - Cancelled order state
  - Itemized product list with images
  - Order summary (customer, email, date, reference, total)
  - Ownership security check (only the order owner can view)
- **`app/api/payments/initialize/route.ts`** — Orders now store `user_id` for reliable per-user tracking.
- **`app/api/admin/orders/route.ts`** — Status updates now append to `status_history` and support optional `trackingNumber`.
- **`supabase/account.sql`** — Migration adds `user_id`, `shipping_address`, `tracking_number`, `status_history` columns to orders + backfills existing orders by email.

### 3. User Account / Profile
- **`app/account/page.tsx`** — **NEW** Profile dashboard with:
  - Avatar (initials), name, email, member-since date
  - Order count stat
  - Quick links (Orders, Favorites, Support)
  - Editable profile form
- **`components/account/profile-form.tsx`** — **NEW** Client component to edit name, phone, and shipping address.
- **`app/api/account/route.ts`** — **NEW** API for GET/PATCH profile data (updates both `auth.users` metadata and `user_profiles` table).
- **`supabase/account.sql`** — Creates `user_profiles` table with RLS policies.

### 4. Responsive Navbar
- Desktop nav links now only show on `lg` screens and up
- Mobile/tablet hamburger menu shows below `lg`
- Responsive brand sizing, padding, and search input widths
- Added "My Account" link (desktop icon + mobile menu item)

---

## 🚨 Things That Need Upgrades

### Critical / Security
| Priority | Item | Description |
|---|---|---|
| 🔴 HIGH | **Admin auth protection** | `app/api/admin/orders/route.ts` and `app/api/admin/products/route.ts` have **no admin authorization check**. Any logged-in user can call these endpoints. Add a middleware or server-side check against the `admin_users` table. |
| 🔴 HIGH | **Rate limiting** | Add rate limiting to `/api/payments/initialize`, `/api/auth/*`, and `/api/contact` to prevent abuse. |
| 🔴 HIGH | **Input validation** | Use Zod or similar for all API request bodies (payments, contact, account, admin). |
| 🟠 MEDIUM | **CSRF protection** | Add CSRF tokens for state-changing requests (PATCH/POST). |
| 🟠 MEDIUM | **Password reset flow** | No "Forgot password" link on the login page. Add `supabase.auth.resetPasswordForEmail()`. |
| 🟠 MEDIUM | **Email verification** | Signup currently just shows "check your email" — no resend option or verification status indicator. |

### Functional
| Priority | Item | Description |
|---|---|---|
| 🟠 MEDIUM | **Cart persistence for logged-in users** | Cart is stored only in `localStorage`. The `user_carts` table exists in SQL but is never used. Sync cart to DB so users don't lose carts across devices. |
| 🟠 MEDIUM | **Favorites sync** | `user_favorites` table exists but favorites are likely localStorage-only. Sync to DB. |
| 🟠 MEDIUM | **Order confirmation email** | `lib/email.ts` exists but verify it's fully wired. Add order status update emails (shipped, delivered). |
| 🟠 MEDIUM | **Shipping address on orders** | Checkout collects address but it's not stored on the order. Store `shipping_address` JSONB on order creation. |
| 🟡 LOW | **Order cancellation** | Add a "Cancel Order" button for pending orders (with admin approval). |
| 🟡 LOW | **Order search/filter** | Add search + status filter to admin orders table. |
| 🟡 LOW | **Pagination** | Orders list and admin orders table have no pagination — will break with many orders. |

### Performance & SEO
| Priority | Item | Description |
|---|---|---|
| 🟠 MEDIUM | **Image optimization** | Product images use raw Unsplash URLs. Use `next/image` with proper sizing/loading. |
| 🟠 MEDIUM | **Metadata per page** | Only the root layout has metadata. Add per-page metadata (products, collections, about, etc.). |
| 🟡 LOW | **Sitemap + robots.txt** | Add `app/sitemap.ts` and `app/robots.ts` for SEO. |
| 🟡 LOW | **Structured data** | Add JSON-LD (Product, Organization, BreadcrumbList) for rich search results. |
| 🟡 LOW | **Caching** | Add ISR/revalidate for product pages and collections. |

---

## ✨ Things That Should Be Added

### E-commerce Essentials
1. **Product Reviews & Ratings** — Allow customers to leave reviews on products (table + UI).
2. **Wishlist sharing** — Let users share their favorites list.
3. **Coupon / Discount codes** — Admin-managed promo codes applied at checkout.
4. **Multiple payment methods** — Add Flutterwave, Stripe, or bank transfer alongside Paystack.
5. **Order invoice PDF** — Generate downloadable PDF invoices for orders.
6. **Gift wrapping option** — Add as a checkout option.
7. **Size guide** — Add a size guide modal on product pages.
8. **Stock notifications** — "Notify me when back in stock" for out-of-stock items.

### User Experience
9. **Guest checkout** — Allow checkout without creating an account (currently requires login for order tracking).
10. **Order tracking by reference** — Public order lookup page using just the Paystack reference + email.
11. **Saved payment methods** — Store Paystack customer references for one-click checkout.
12. **Multi-address book** — Save multiple shipping addresses.
13. **Order reorder** — "Buy again" button on past orders.
14. **Product recommendations** — "You might also like" based on cart/history.
15. **Recently viewed products** — Track and display in a carousel.
16. **Dark/light theme toggle** — Currently dark-only.

### Admin Panel
17. **Dashboard analytics** — Revenue, orders, top products, conversion charts.
18. **Inventory management** — Stock levels, low-stock alerts, bulk import/export.
19. **Customer management** — View customer profiles, order history, contact info.
20. **Refund management** — Process refunds via Paystack API.
21. **Product variants** — Sizes, colors, SKUs.
22. **Blog/CMS** — Manage content pages, announcements, lookbook posts.

### Technical / Professional
23. **Testing** — Add unit tests (Vitest) + E2E tests (Playwright).
24. **CI/CD** — GitHub Actions for lint, type-check, test, build on push.
25. **Error tracking** — Sentry integration for production error monitoring.
26. **Analytics** — Vercel Analytics is present; add GA4 or Plausible for deeper insights.
27. **i18n** — Multi-language support (English, French, etc.).
28. **PWA** — Add manifest, service worker, offline support.
29. **Accessibility audit** — Run axe/lighthouse, fix contrast, ARIA labels, keyboard nav.
30. **Environment config** — Move hardcoded values (shipping cost, tax rate) to env/config.
31. **API documentation** — OpenAPI spec for the API routes.
32. **Database migrations** — Use a proper migration tool (e.g., Supabase CLI migrations) instead of raw SQL files.

---

## 📋 Required Setup Steps

### 1. Run the SQL migration
Open your Supabase SQL Editor and run **`supabase/account.sql`** to:
- Add `user_id`, `shipping_address`, `tracking_number`, `status_history` to orders
- Create the `user_profiles` table with RLS
- Backfill existing orders with user IDs

### 2. Add admin authorization
Add a check in `app/api/admin/*` routes to verify the user is in the `admin_users` table before allowing access.

### 3. Configure environment variables
Ensure these are set in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=