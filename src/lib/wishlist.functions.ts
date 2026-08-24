import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

const STORAGE_PREFIX = "storage:";

/** Uploaded images are stored as "storage:<path>"; swap them for temporary view links. */
async function resolveImages<T extends { image_url: string }>(
  client: ReturnType<typeof publicClient>,
  rows: T[],
): Promise<T[]> {
  const paths = rows
    .map((row) => row.image_url)
    .filter((url) => url.startsWith(STORAGE_PREFIX))
    .map((url) => url.slice(STORAGE_PREFIX.length));

  if (paths.length === 0) return rows;

  const { data, error } = await client.storage.from("az-media").createSignedUrls(paths, 60 * 60 * 24 * 7);
  if (error) {
    console.error("Signing uploaded images failed", error.message);
    return rows;
  }

  const signed = new Map<string, string>();
  data?.forEach((entry) => {
    if (entry.path && entry.signedUrl) signed.set(entry.path, entry.signedUrl);
  });

  return rows.map((row) =>
    row.image_url.startsWith(STORAGE_PREFIX)
      ? { ...row, image_url: signed.get(row.image_url.slice(STORAGE_PREFIX.length)) ?? row.image_url }
      : row,
  );
}

export const listWishlist = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from("wishlist_items")
    .select("id, name, image_url, reserved_by_name, reserved_count, quantity, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Wishlist load failed", error.message);
    throw new Error("Could not load the wishlist.");
  }

  return resolveImages(client, data ?? []);
});


export const listGalleryPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const client = publicClient();
  const { data, error } = await client
    .from("gallery_photos")
    .select("id, image_url, caption, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Gallery load failed", error.message);
    throw new Error("Could not load the photos.");
  }

  return resolveImages(client, data ?? []);
});

const reserveSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2, "Please enter your name.").max(80),
});

export const reserveWishlistItem = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => reserveSchema.parse(input))
  .handler(async ({ data }) => {
    const { data: updated, error } = await publicClient()
      .from("wishlist_items")
      .update({ reserved_by_name: data.name, reserved_at: new Date().toISOString() })
      .eq("id", data.id)
      .is("reserved_by_name", null)
      .select("id, name, image_url, reserved_by_name, sort_order");

    if (error) {
      console.error("Reserve failed", error.message);
      throw new Error("We couldn't save your reservation. Please try again.");
    }

    if (!updated || updated.length === 0) {
      throw new Error("Someone just reserved this gift. Please pick another one.");
    }

    return updated[0];
  });
