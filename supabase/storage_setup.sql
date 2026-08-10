-- ============================================================
-- Supabase Storage setup for admin product image uploads
-- Run this in your Supabase SQL Editor (supabase.com > SQL Editor)
--
-- Creates a PUBLIC bucket named "product-images":
--   * anyone can VIEW product images  (needed by the storefront)
--   * only admins (in the admin_users table) can UPLOAD / UPDATE / DELETE
-- ============================================================

-- 1) Create the bucket (public = files readable WITHOUT auth)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- 2) Public read so product pages and the storefront can display images
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- 3) Admin-only write (uses RLS on storage.objects)

drop policy if exists "Admins upload product images" on storage.objects;
create policy "Admins upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and auth.uid() in (select id from admin_users)
);

drop policy if exists "Admins update product images" on storage.objects;
create policy "Admins update product images"
on storage.objects for update
using (
  bucket_id = 'product-images'
  and auth.uid() in (select id from admin_users)
);

drop policy if exists "Admins delete product images" on storage.objects;
create policy "Admins delete product images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.uid() in (select id from admin_users)
);

-- Optional: folder to store originals/temp separately from final uploads
-- (not required — the app uploads under the 'products' folder automatically)
