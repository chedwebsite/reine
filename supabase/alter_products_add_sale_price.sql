-- ============================================================
-- Products: add explicit sale_price column
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1) Add the column (optional discounted price, managed by admins on /admin/products)
alter table products
  add column if not exists sale_price numeric;

-- 2) One-time backfill: mark the cheapest ~40% of products as "on sale"
--    at a flat 25% off so the existing Sale page experience is preserved.
--    After this, admins can edit each product's sale price in
--    /admin/products (leave blank = not on sale).
update products
set sale_price = round(price * 0.75)
where (sale_price is null or sale_price >= price)
  and id in (
    select id
    from (
      select id,
             row_number() over (order by price, id) as rn,
             count(*) over () as total
      from products
    ) ranked
    where rn <= ceil(total * 0.4)
  );