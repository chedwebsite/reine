-- ============================================================
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Create the admin_users table if it doesn't exist yet
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;

drop policy if exists "Admins can read own row" on admin_users;
create policy "Admins can read own row" on admin_users
  for select using (auth.uid() = id);

-- Step 2: Create the admin auth user
-- (Supabase's built-in function to create a user with a confirmed email)
select auth.uid(); -- just a test, ignore output

insert into auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
)
values (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'henrydanielchibuzor@gmail.com',
  crypt('Chibuzor@2000', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  false,
  'authenticated',
  'authenticated'
)
on conflict do nothing;

-- Step 3: Grant admin access
insert into admin_users (id, email)
select id, email
from auth.users
where email = 'henrydanielchibuzor@gmail.com'
on conflict (email) do nothing;
