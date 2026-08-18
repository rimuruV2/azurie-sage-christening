import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { rsvpSchema } from "./rsvp-schema";

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => rsvpSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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

    const { error } = await supabase.from("rsvps").insert({
      full_name: data.fullName,
      email: data.email,
      attending: data.attending,
      guest_count: data.guestCount,
    });

    if (error) {
      console.error("RSVP insert failed", error.message);
      throw new Error("We couldn't save your RSVP. Please try again.");
    }

    return { ok: true as const };
  });

export const listRsvps = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError) {
      console.error("Role check failed", roleError.message);
      throw new Error("Could not verify your access.");
    }
    if (!isAdmin) {
      return { isAdmin: false as const, rsvps: [] };
    }

    const { data, error } = await context.supabase
      .from("rsvps")
      .select("id, full_name, email, attending, guest_count, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("RSVP list failed", error.message);
      throw new Error("Could not load the guest list.");
    }

    return { isAdmin: true as const, rsvps: data ?? [] };
  });
