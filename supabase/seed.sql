-- Run this in your Supabase SQL Editor to seed the products table

insert into products (name, category, price, image, rating, reviews, description, in_stock) values

-- Haute Couture
(
  'Silk Evening Gown',
  'Haute Couture',
  250000,
  'https://images.unsplash.com/photo-1595777707802-52ca3d0cedc1?w=500&h=600&fit=crop',
  5,
  24,
  'An exquisite floor-length silk evening gown with hand-embroidered detailing. Crafted from the finest Italian silk, this piece embodies timeless elegance.',
  true
),
(
  'Tailored Blazer',
  'Haute Couture',
  180000,
  'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop',
  4.9,
  31,
  'A precision-tailored blazer in premium wool crepe. Structured shoulders and a refined silhouette make this a wardrobe cornerstone.',
  true
),
(
  'Velvet Cocktail Dress',
  'Haute Couture',
  195000,
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=600&fit=crop',
  4.8,
  17,
  'Deep midnight velvet cocktail dress with a sweetheart neckline and subtle train. Perfect for black-tie occasions.',
  true
),
(
  'Couture Trench Coat',
  'Haute Couture',
  320000,
  'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=600&fit=crop',
  5,
  9,
  'A statement trench coat in double-faced cashmere with gold-tone hardware. Timeless design meets modern luxury.',
  true
),

-- Accessories
(
  'Luxury Handbag',
  'Accessories',
  150000,
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=600&fit=crop',
  4.8,
  18,
  'Structured top-handle bag in full-grain calfskin leather. Features a detachable chain strap and gold-tone clasp closure.',
  true
),
(
  'Designer Heels',
  'Accessories',
  120000,
  'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=600&fit=crop',
  4.7,
  15,
  'Pointed-toe stiletto heels in nude satin with a delicate ankle strap. Handcrafted in Italy for the perfect fit.',
  true
),
(
  'Cashmere Scarf',
  'Accessories',
  85000,
  'https://images.unsplash.com/photo-1520274031891-04a8d3707e2d?w=500&h=600&fit=crop',
  4.9,
  28,
  'Ultra-soft pure cashmere scarf in a classic oversized weave. Sourced from the finest Mongolian cashmere.',
  true
),
(
  'Silk Clutch Bag',
  'Accessories',
  95000,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=600&fit=crop',
  4.6,
  11,
  'Evening clutch in hand-painted silk with a mother-of-pearl clasp. Each piece is uniquely finished by artisan hands.',
  true
),

-- Jewelry
(
  'Diamond Earrings',
  'Jewelry',
  450000,
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=600&fit=crop',
  5,
  12,
  'Brilliant-cut diamond drop earrings set in 18k white gold. Each stone is hand-selected for exceptional clarity and brilliance.',
  true
),
(
  'Gold Bracelet',
  'Jewelry',
  320000,
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=600&fit=crop',
  4.8,
  22,
  'Solid 18k yellow gold link bracelet with a secure lobster clasp. A timeless piece that transcends trends.',
  true
),
(
  'Pearl Necklace',
  'Jewelry',
  280000,
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=600&fit=crop',
  5,
  19,
  'South Sea cultured pearl strand necklace with a diamond-set 18k gold clasp. Each pearl is matched for size, lustre, and colour.',
  true
),
(
  'Sapphire Ring',
  'Jewelry',
  580000,
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=600&fit=crop',
  5,
  8,
  'Ceylon sapphire solitaire ring flanked by pavé diamonds in platinum. A rare gemstone of exceptional colour saturation.',
  true
);
