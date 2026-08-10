-- ============================================================
-- Add color + color-tagged gallery image support to products
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add the colors column (array of color names, e.g. ['Red','Black','Gold'])
alter table products
  add column if not exists colors text[] default null;

-- Add the images column (jsonb array of { url, colors: string[] })
-- Each extra image can carry one or more color tags so that it becomes
-- highlighted when a matching color is selected on the product page.
-- Example:
--   [
--     { "url": "https://.../red.jpg", "colors": ["Red"] },
--     { "url": "https://.../black.jpg", "colors": ["Black", "Gold"] }
--   ]
alter table products
  add column if not exists images jsonb default null;
