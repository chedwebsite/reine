-- ============================================================
-- Orders RLS Policies
-- Run this in your Supabase SQL Editor
--
-- IMPORTANT: Server-side payment confirmation (webhook + verify), order
-- creation, and admin operations now run through a SERVICE ROLE client
-- (lib/supabase-admin.ts) which bypasses RLS. These policies therefore only
-- govern direct access via the anonymous/authenticated clients and can be
-- kept tight.
-- ============================================================

alter table orders enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can insert own orders" on orders;
drop policy if exists "Service can insert orders" on orders;
drop policy if exists "Service can update orders" on orders;
drop policy if exists "Admins can do everything" on orders;
drop policy if exists "Anyone can insert orders" on orders;
drop policy if exists "Users can update own orders" on orders;

-- Logged-in users can see their own orders (by user_id or email)
create policy "Users can view own orders" on orders
  for select using (
    auth.uid() = user_id
    or lower(customer_email) = lower(auth.jwt() ->> 'email')
  );

-- A user may update their own order (used for cancelling pending orders).
-- Ownership is enforced in the API code too. WITHOUT this servant-style
-- "update using (true)" policy, no authenticated user can touch another
-- user's order rows.
create policy "Users can update own orders" on orders
  for update using (
    auth.uid() = user_id
    or lower(customer_email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    auth.uid() = user_id
    or lower(customer_email) = lower(auth.jwt() ->> 'email')
  );

-- Admins can do everything (defense in depth; admin routes also use the
-- service-role client, so this mainly covers direct dashboard/DB access).
create policy "Admins can do everything" on orders
  for all using (
    exists (
      select 1 from admin_users where id = auth.uid()
    )
  );

-- There is intentionally NO public insert or update policy anymore. New
-- orders are created by the service-role client in /api/payments/initialize,
-- and status updates happen server-side (webhook, verify, admin). This closes
-- the previous "anyone can insert orders" and "any authenticated user can
-- update any order (using(true))" holes.

