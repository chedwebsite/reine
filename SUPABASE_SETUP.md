# Reine Luxe Co. — Supabase Connection & Setup Guide

This app already talks to Supabase for **auth, database, and (now) image storage**.
The only config you need is one env file plus a few SQL scripts that you run once
in the Supabase SQL Editor.

---

## 1. Where the connection lives

| File | What it does |
|------|--------------|
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `lib/supabase-browser.ts` | Browser client (auth, storage uploads) |
| `lib/supabase-server.ts` | Server client (admin API routes, RLS-aware) |
| `lib/supabase.ts` | Shared anon client (storefront product reads) |
| `lib/upload-image.ts` | **NEW** — uploads a local image to Storage, returns public URL |

Your `.env.local` already has these set:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### How to find your URL + key (if you ever need to re-link)
1. Go to **https://supabase.com/dashboard** and open your project.
2. **Project Settings → API**.
3. Copy the **Project URL** and the **anon / public** key.
4. Paste them into `.env.local` (exactly the two names above) and restart `npm run dev`.

---

## 1.5 Authentication email links (IMPORTANT)

Supabase builds the **"Confirm your email address"** link from this dashboard
setting, and it only redirects back to URLs you explicitly allow:

1. Open the **Supabase Dashboard → Authentication → URL Configuration**.
2. **Site URL** (no trailing slash):
   - Production: `https://reine-mocha.vercel.app`
   - Leave the default `http://localhost:3000` *only* if you want local-dev-only links.
3. **Redirect URLs** — add **both**:
   - `https://reine-mocha.vercel.app/auth/callback`
   - `https://reine-mocha.vercel.app/**` (wildcard for any other callback paths)
4. Click **Save**.

Why: the app (see `app/login/page.tsx`) now always asks Supabase to redirect
confirmation / password‑reset / OAuth links to `NEXT_PUBLIC_SITE_URL` +
`/auth/callback` (set in `.env.local`, and on Vercel as an env var). But if the
redirect URL is **not** in the dashboard's allow‑list, Supabase silently ignores
it and falls back to the dashboard **Site URL** — which defaults to
`http://localhost:3000` on new projects. That is what causes the confirmation
email to go to `localhost` instead of the project URL.

> After changing these settings, use the **Resend verification email** button
> on the login page (or sign up again with a fresh address) — already-sent links
> keep the old redirect target.

---

## 2. One-time database setup (run in SQL Editor)

Open your project in the Supabase dashboard → **SQL Editor** → **New query**,
then run these files **in order**:

1. `supabase/admin_setup.sql` — creates `admin_users` + your admin login
2. `supabase/add_colors_and_images.sql` — `colors` + `images` columns on products
3. `supabase/add_sizes_to_products.sql` — `sizes` column (if not already applied)
4. **`supabase/add_main_image_colors.sql`** — NEW: lets the main photo be tagged to colours
5. **`supabase/storage_setup.sql`** — NEW: creates the public `product-images` bucket
   with admin-only write access
6. `supabase/user_data.sql`, `supabase/orders_rls.sql`, `supabase/account.sql` — accounts/orders, if not already applied

> The `.sql` files are idempotent (`if not exists` / `on conflict do nothing`),
> so re-running them is safe.

---

## 3. How the new image upload works

1. Admin opens **/admin/products** → Add Product (or Edit).
2. Beside **Main Image** or under **Extra Images** there is an **Upload** button.
3. The browser picks a local image → `lib/upload-image.ts` uploads it to the
   `product-images` bucket under `products/<timestamp>_<random>.jpg`.
4. The public URL is returned and filled into the form automatically.
5. On save, the URL is persisted in the `image` / `images` columns like any URL.

**Security:** the bucket is *public read* (so the storefront can display images)
but *admin-only write*. Writes are gated by a Row Level Security policy that
checks the logged-in user is in `admin_users` (policy 3 in `storage_setup.sql`).

---

## 4. Trying it locally

```bash
npm run dev
```

- **/admin/products/new** — create a product, upload a photo, save it.
- Open the product page `/products/<id>` — the uploaded image should appear.
- If upload fails, check the browser DevTools console:
  - `InvalidKeyException` → bucket name/policy not created yet (run `storage_setup.sql`)
  - `Unauthorized` → you're not signed into the admin account (see `admin_setup.sql`)