-- ============================================================
-- User Profiles & Account Management
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Add user_id + tracking columns to orders (if not present)
alter table orders
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists shipping_address jsonb default null,
  add column if not exists tracking_number text default null,
  add column if not exists status_history jsonb default '[]'::jsonb;

-- Step 2: Create user_profiles table
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table user_profiles enable row level security;

drop policy if exists "Users manage own profile" on user_profiles;
create policy "Users manage own profile" on user_profiles
  for all using (auth.uid() = id);

-- Step 3: Index orders by user_id for fast lookups
create index if not exists orders_user_id_idx on orders(user_id);

-- Step 4: Backfill user_id for existing orders by matching email
update orders
set user_id = u.id
from auth.users u
where orders.user_id is null
  and lower(orders.customer_email) = lower(u.email)
  and exists (
    select 1 from auth.users u2
    where lower(u2.email) = lower(orders.customer_email)
    limit 1
  );