-- ============================================================
-- Admin access setup
-- Run this in your Supabase SQL Editor
--
-- ⚠️ SECURITY NOTICE ⚠️
-- A plaintext admin password was previously hardcoded in this file and is
-- still present in git history. That password should be considered
-- compromised — rotate it now via the Supabase Dashboard
-- (Authentication → Users) and remove/replace the old auth user.
-- Never commit credentials. This file now contains NO password.
-- ============================================================

-- Step 1: Create the admin_users table if it doesn't exist
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

drop policy if exists "Admins can read own row" on admin_users;
create policy "Admins can read own row" on admin_users
  for select using (auth.uid() = id);

-- Step 2: Grant admin access to an existing, CONFIRMED auth user.
-- First create that user (with a strong password) in the Supabase Dashboard:
--   Authentication → Users → Add user → (set email + password, confirm email)
-- Then set the email below to that account and run this INSERT.
--
-- TODO: replace 'YOUR_ADMIN_EMAIL@example.com' with the real admin email.
insert into admin_users (id, email)
select id, email
from auth.users
where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (email) do nothing;

-- Optional sanity check:
select auth.users.email, admin_users.id from admin_users
join auth.users on auth.users.id = admin_users.id;
