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
