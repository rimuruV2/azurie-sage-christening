ALTER TABLE public.wishlist_items
  ADD COLUMN IF NOT EXISTS quantity integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS reserved_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.wishlist_items
  ADD CONSTRAINT wishlist_quantity_positive CHECK (quantity >= 1 AND quantity <= 99);

ALTER TABLE public.wishlist_items
  ADD CONSTRAINT wishlist_reserved_count_valid CHECK (reserved_count >= 0 AND reserved_count <= quantity);

UPDATE public.wishlist_items
SET reserved_count = 1
WHERE reserved_by_name IS NOT NULL AND reserved_count = 0;

CREATE OR REPLACE FUNCTION public.reserve_wishlist_item(_item_id uuid, _name text)
RETURNS TABLE (id uuid, reserved_count integer, quantity integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE public.wishlist_items w
  SET reserved_count = w.reserved_count + 1,
      reserved_by_name = COALESCE(w.reserved_by_name, _name),
      reserved_at = COALESCE(w.reserved_at, now())
  WHERE w.id = _item_id
    AND w.reserved_count < w.quantity
  RETURNING w.id, w.reserved_count, w.quantity;
END;
$$;

GRANT EXECUTE ON FUNCTION public.reserve_wishlist_item(uuid, text) TO anon, authenticated;