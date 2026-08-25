import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const addWishlistSchema = z.object({
  name: z.string().trim().min(2).max(120),
  storage_path: z.string().trim().min(3).max(300),
});

export const addWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addWishlistSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: max } = await context.supabase
      .from("wishlist_items")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await context.supabase.from("wishlist_items").insert({
      name: data.name,
      image_url: `storage:${data.storage_path}`,
      sort_order: (max?.sort_order ?? 0) + 1,
    });

    if (error) {
      console.error("Add wishlist item failed", error.message);
      throw new Error("Could not add this gift. Make sure you're signed in as the host.");
    }

    return { ok: true };
  });

const addPhotoSchema = z.object({
  storage_path: z.string().trim().min(3).max(300),
  caption: z.string().trim().max(160).optional(),
});

export const addGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addPhotoSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: max } = await context.supabase
      .from("gallery_photos")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await context.supabase.from("gallery_photos").insert({
      image_url: `storage:${data.storage_path}`,
      caption: data.caption?.length ? data.caption : null,
      sort_order: (max?.sort_order ?? 0) + 1,
    });

    if (error) {
      console.error("Add gallery photo failed", error.message);
      throw new Error("Could not add this photo. Make sure you're signed in as the host.");
    }

    return { ok: true };
  });

const idSchema = z.object({ id: z.string().uuid() });

export const deleteWishlistItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("wishlist_items").delete().eq("id", data.id);
    if (error) {
      console.error("Delete wishlist item failed", error.message);
      throw new Error("Could not remove this gift.");
    }
    return { ok: true };
  });

export const deleteGalleryPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("gallery_photos").delete().eq("id", data.id);
    if (error) {
      console.error("Delete gallery photo failed", error.message);
      throw new Error("Could not remove this photo.");
    }
    return { ok: true };
  });

const quantitySchema = z.object({
  id: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

export const setWishlistQuantity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => quantitySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("wishlist_items")
      .update({ quantity: data.quantity })
      .eq("id", data.id);
    if (error) {
      console.error("Set wishlist quantity failed", error.message);
      throw new Error("Could not update the quantity. It may be lower than the reservations made.");
    }
    return { ok: true };
  });

const reservationSchema = z.object({
  id: z.string().uuid(),
  reserved_count: z.number().int().min(0).max(99),
});

export const setWishlistReservations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => reservationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch =
      data.reserved_count === 0
        ? { reserved_count: 0, reserved_by_name: null, reserved_at: null }
        : { reserved_count: data.reserved_count };
    const { error } = await context.supabase
      .from("wishlist_items")
      .update(patch)
      .eq("id", data.id);

    if (error) {
      console.error("Set wishlist reservations failed", error.message);
      throw new Error("Could not update reservations. It may exceed the gift's quantity.");
    }
    return { ok: true };
  });

export const listWishlistReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("wishlist_reservations")
      .select("id, item_id, name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("List reservations failed", error.message);
      throw new Error("Could not load the reservations.");
    }
    return data ?? [];
  });

const addReservationSchema = z.object({
  item_id: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
});

export const addWishlistReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addReservationSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("wishlist_reservations")
      .insert({ item_id: data.item_id, name: data.name });
    if (error) {
      console.error("Add reservation failed", error.message);
      throw new Error("Could not add this reservation. The gift may be fully reserved.");
    }
    return { ok: true };
  });

export const deleteWishlistReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("wishlist_reservations")
      .delete()
      .eq("id", data.id);
    if (error) {
      console.error("Delete reservation failed", error.message);
      throw new Error("Could not remove this reservation.");
    }
    return { ok: true };
  });
