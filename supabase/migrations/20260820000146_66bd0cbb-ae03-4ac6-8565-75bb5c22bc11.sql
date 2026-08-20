
GRANT INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_photos TO authenticated;

CREATE POLICY "Admins can insert wishlist items" ON public.wishlist_items
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update wishlist items" ON public.wishlist_items
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete wishlist items" ON public.wishlist_items
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert gallery photos" ON public.gallery_photos
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update gallery photos" ON public.gallery_photos
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete gallery photos" ON public.gallery_photos
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read az-media objects" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'az-media');
CREATE POLICY "Admins can upload az-media objects" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'az-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update az-media objects" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'az-media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete az-media objects" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'az-media' AND public.has_role(auth.uid(), 'admin'));
