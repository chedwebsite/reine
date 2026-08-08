-- ============================================================
-- Orders RLS Policies
-- Run this in your Supabase SQL Editor
-- ============================================================

alter table orders enable row level security;

-- Drop existing policies to avoid conflicts
drop policy if exists "Users can view own orders" on orders;
drop policy if exists "Users can insert own orders" on orders;
drop policy if exists "Service can insert orders" on orders;
drop policy if exists "Service can update orders" on orders;
drop policy if exists "Admins can do everything" on orders;
drop policy if exists "Anyone can insert orders" on orders;

-- Logged-in users can see their own orders (by user_id or email)
create policy "Users can view own orders" on orders
  for select using (
    auth.uid() = user_id
    or lower(customer_email) = lower(auth.jwt() ->> 'email')
  );

-- Allow inserts from authenticated users (checkout while logged in)
-- and from anon/service role (guest checkout via API route)
create policy "Anyone can insert orders" on orders
  for insert with check (true);

-- Allow the API to update order status (verify payment, admin updates)
create policy "Service can update orders" on orders
  for update using (true);

-- Admins can do everything
create policy "Admins can do everything" on orders
  for all using (
    exists (
      select 1 from admin_users where id = auth.uid()
    )
  );
