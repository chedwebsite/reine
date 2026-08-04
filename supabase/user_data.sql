-- Run this in your Supabase SQL Editor

-- User favorites
create table if not exists user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references products(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);
alter table user_favorites enable row level security;
create policy "Users manage own favorites" on user_favorites
  for all using (auth.uid() = user_id);

-- User carts
create table if not exists user_carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  items jsonb default '[]',
  updated_at timestamptz default now()
);
alter table user_carts enable row level security;
create policy "Users manage own cart" on user_carts
  for all using (auth.uid() = user_id);
