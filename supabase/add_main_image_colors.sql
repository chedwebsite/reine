-- ============================================================
-- Allow tagging the MAIN product image with specific colors,
-- matching the behaviour already available for extra images.
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- text[] of color names (e.g. ['Red','Black']) that this exact main photo shows.
-- When blank, the photo is treated as matching every color.
alter table products
  add column if not exists main_image_colors text[] default null;
