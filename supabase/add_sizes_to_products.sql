-- ============================================================
-- Add size support to products
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add the sizes column (array of size strings, e.g. ['XS','S','M','L','XL'])
alter table products
  add column if not exists sizes text[] default null;

-- Backfill sizes for existing clothing items (one-time)
update products set sizes = array['XS','S','M','L','XL','XXL']
where category = 'Haute Couture' and (sizes is null or sizes = '{}');

update products set sizes = array['S','M','L','XL']
where category = 'Accessories' and name ilike '%scarf%' and (sizes is null or sizes = '{}');

update products set sizes = array['36','37','38','39','40','41','42']
where category = 'Accessories' and name ilike '%heel%' and (sizes is null or sizes = '{}');
