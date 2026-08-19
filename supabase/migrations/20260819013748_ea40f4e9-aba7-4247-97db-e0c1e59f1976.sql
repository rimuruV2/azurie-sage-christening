CREATE TABLE public.wishlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  reserved_by_name text,
  reserved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT wishlist_reserved_name_len CHECK (reserved_by_name IS NULL OR char_length(btrim(reserved_by_name)) BETWEEN 2 AND 80)
);

GRANT SELECT ON public.wishlist_items TO anon, authenticated;
GRANT UPDATE (reserved_by_name, reserved_at) ON public.wishlist_items TO anon, authenticated;
GRANT ALL ON public.wishlist_items TO service_role;

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view wishlist items"
  ON public.wishlist_items FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Anyone can reserve an unreserved item"
  ON public.wishlist_items FOR UPDATE TO anon, authenticated
  USING (reserved_by_name IS NULL)
  WITH CHECK (reserved_by_name IS NOT NULL);

CREATE TABLE public.gallery_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.gallery_photos TO anon, authenticated;
GRANT ALL ON public.gallery_photos TO service_role;

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery photos"
  ON public.gallery_photos FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.wishlist_items (name, image_url, sort_order) VALUES
  ('Storybook collection', '/__l5e/assets-v1/d2060961-62da-4f7c-99eb-f63a114be75f/storybooks.jpeg', 1),
  ('Graded reading books set', '/__l5e/assets-v1/2f2d0357-9ae5-4336-9da5-3be084aa4024/reading-books.jpeg', 2),
  ('Baby food processor', '/__l5e/assets-v1/e2d7e22e-1d2e-4361-95d0-075ef5c84018/food-processor.jpeg', 3),
  ('Diapers (size M)', '/__l5e/assets-v1/568c7937-33f3-46a4-842b-d08c50e4e666/diapers.jpeg', 4),
  ('Baby laundry detergent', '/__l5e/assets-v1/845b990e-2251-40c6-9d97-86c09db68099/laundry-detergent.jpeg', 5),
  ('Baby fabric softener', '/__l5e/assets-v1/36c70e6c-45b7-4e0d-adb8-5ce9534f2dbb/fabric-softener.jpeg', 6),
  ('Convertible high chair', '/__l5e/assets-v1/f06a260b-968c-483f-9a0a-5aada1261950/high-chair.jpeg', 7),
  ('Baby tableware set', '/__l5e/assets-v1/4e12ae42-2251-4cae-928d-b845606fb49a/tableware.jpeg', 8),
  ('Bottle & nipple cleanser', '/__l5e/assets-v1/9f5fff71-b2bc-4f11-82d9-ea627e182fb3/bottle-cleanser.jpeg', 9),
  ('Feeding bottles (240ml)', '/__l5e/assets-v1/b846f752-ff70-4d56-8998-265c99df2a9c/feeding-bottles.jpeg', 10),
  ('Diaper bag backpack', '/__l5e/assets-v1/599ac0d9-9d5d-482d-bd24-14d0f58b972f/diaper-bag.jpeg', 11);

INSERT INTO public.gallery_photos (image_url, caption, sort_order) VALUES
  ('/__l5e/assets-v1/fcd23e26-3bb5-45a1-af08-cb480e4a42ba/IMG_3270.jpg', 'Azurie Sage', 1),
  ('/__l5e/assets-v1/a0ab8c22-a794-4d08-bdc4-ffcacdc45c34/IMG_3237.jpg', 'Sweet dreams', 2),
  ('/__l5e/assets-v1/29668c12-ace1-43bc-86fc-7545f2fd8c44/IMG_3257.jpg', 'Held close', 3),
  ('/__l5e/assets-v1/6c132544-d2d7-4b2d-8dfa-66aaf5a9707d/IMG_3262.jpg', 'Big pink bow', 4),
  ('/__l5e/assets-v1/df2eb08b-58b6-44f8-8f32-02d10da0e32a/IMG_3263.jpg', 'Bunny blanket naps', 5),
  ('/__l5e/assets-v1/9ed5b263-d67a-44d6-a9b3-d7f12788cefa/IMG_2954.jpg', 'Out and about', 6),
  ('/__l5e/assets-v1/0158faf3-ce44-4e5d-9002-e7335da4b6fc/IMG_3292.jpg', 'Milk time', 7),
  ('/__l5e/assets-v1/58a60eb2-731e-43be-a925-87ef8b4aa9df/IMG_3306.jpg', 'I love my family', 8),
  ('/__l5e/assets-v1/d73fd37a-4575-445e-9ad1-c15a6f9764f1/IMG_3722.jpg', 'Two months', 9),
  ('/__l5e/assets-v1/5ed5a0b5-2c0b-4d89-89f2-04ad6c8c3275/IMG_3729.jpg', 'Sunflower baby', 10);