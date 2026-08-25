CREATE TABLE public.wishlist_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.wishlist_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX wishlist_reservations_item_id_idx ON public.wishlist_reservations(item_id);

GRANT SELECT, INSERT, DELETE ON public.wishlist_reservations TO authenticated;
GRANT ALL ON public.wishlist_reservations TO service_role;

ALTER TABLE public.wishlist_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reservations" ON public.wishlist_reservations
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can add reservations" ON public.wishlist_reservations
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete reservations" ON public.wishlist_reservations
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Backfill from existing counts
INSERT INTO public.wishlist_reservations (item_id, name, created_at)
SELECT w.id, COALESCE(w.reserved_by_name, 'Guest'), COALESCE(w.reserved_at, now())
FROM public.wishlist_items w, generate_series(1, GREATEST(w.reserved_count, 0)) g
WHERE w.reserved_count > 0;

-- Keep reserved_count in sync with the reservation rows
CREATE OR REPLACE FUNCTION public.sync_wishlist_reserved_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.item_id, OLD.item_id);
BEGIN
  UPDATE public.wishlist_items w
  SET reserved_count = (SELECT count(*) FROM public.wishlist_reservations r WHERE r.item_id = w.id),
      reserved_by_name = (SELECT r.name FROM public.wishlist_reservations r WHERE r.item_id = w.id ORDER BY r.created_at ASC LIMIT 1),
      reserved_at = (SELECT r.created_at FROM public.wishlist_reservations r WHERE r.item_id = w.id ORDER BY r.created_at ASC LIMIT 1)
  WHERE w.id = target;
  RETURN NULL;
END;
$$;

CREATE TRIGGER wishlist_reservations_sync
AFTER INSERT OR DELETE ON public.wishlist_reservations
FOR EACH ROW EXECUTE FUNCTION public.sync_wishlist_reserved_count();

-- Reserve now records the guest's name as a row
CREATE OR REPLACE FUNCTION public.reserve_wishlist_item(_item_id uuid, _name text)
RETURNS TABLE(id uuid, reserved_count integer, quantity integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.wishlist_items;
BEGIN
  SELECT * INTO w FROM public.wishlist_items WHERE public.wishlist_items.id = _item_id FOR UPDATE;
  IF w.id IS NULL OR w.reserved_count >= w.quantity THEN
    RETURN;
  END IF;

  INSERT INTO public.wishlist_reservations (item_id, name) VALUES (_item_id, _name);

  RETURN QUERY
  SELECT x.id, x.reserved_count, x.quantity
  FROM public.wishlist_items x WHERE x.id = _item_id;
END;
$$;