-- 0021_camiones_w_v_x_images.sql
-- Adds 3 product images each for kama-serie-w, kama-serie-v, and kama-serie-x.
-- Images copied from camiones/ source folder into public/images/listings/{slug}/.

UPDATE products
SET images = ARRAY[
  '/images/listings/kama-serie-w/1.jpg',
  '/images/listings/kama-serie-w/2.jpg',
  '/images/listings/kama-serie-w/3.jpg'
]
WHERE slug = 'kama-serie-w';

UPDATE products
SET images = ARRAY[
  '/images/listings/kama-serie-v/1.jpg',
  '/images/listings/kama-serie-v/2.jpg',
  '/images/listings/kama-serie-v/3.jpg'
]
WHERE slug = 'kama-serie-v';

UPDATE products
SET images = ARRAY[
  '/images/listings/kama-serie-x/1.jpg',
  '/images/listings/kama-serie-x/2.jpg',
  '/images/listings/kama-serie-x/3.jpg'
]
WHERE slug = 'kama-serie-x';
