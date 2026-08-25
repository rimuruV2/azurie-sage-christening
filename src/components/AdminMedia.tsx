import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listGalleryPhotos, listWishlist } from "@/lib/wishlist.functions";
import {
  addGalleryPhoto,
  addWishlistItem,
  deleteGalleryPhoto,
  deleteWishlistItem,
  setWishlistQuantity,
  setWishlistReservations,
} from "@/lib/media.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

async function uploadFile(file: File, folder: "wishlist" | "gallery") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("az-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "image/jpeg",
  });
  if (error) throw new Error(error.message);
  return path;
}

export function AdminMedia() {
  return (
    <div className="space-y-8">
      <WishlistManager />
      <GalleryManager />
    </div>
  );
}

function WishlistManager() {
  const queryClient = useQueryClient();
  const fetchWishlist = useServerFn(listWishlist);
  const addItem = useServerFn(addWishlistItem);
  const removeItem = useServerFn(deleteWishlistItem);
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["wishlist_items"],
    queryFn: () => fetchWishlist(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeItem({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      toast.success("Gift removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setQuantity = useServerFn(setWishlistQuantity);
  const fetchReservations = useServerFn(listWishlistReservations);
  const addReservation = useServerFn(addWishlistReservation);
  const removeReservation = useServerFn(deleteWishlistReservation);
  const [reserveNames, setReserveNames] = useState<Record<string, string>>({});

  const { data: reservations = [] } = useQuery({
    queryKey: ["wishlist_reservations"],
    queryFn: () => fetchReservations(),
  });

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
    queryClient.invalidateQueries({ queryKey: ["wishlist_reservations"] });
  };

  const updateQuantity = useMutation({
    mutationFn: (input: { id: string; quantity: number }) => setQuantity({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      toast.success("Quantity updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createReservation = useMutation({
    mutationFn: (input: { item_id: string; name: string }) => addReservation({ data: input }),
    onSuccess: (_d, input) => {
      refreshAll();
      setReserveNames((prev) => ({ ...prev, [input.item_id]: "" }));
      toast.success("Reservation added.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const dropReservation = useMutation({
    mutationFn: (id: string) => removeReservation({ data: { id } }),
    onSuccess: () => {
      refreshAll();
      toast.success("Reservation removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });



  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error("Please choose a photo.");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Please enter a gift name.");
      return;
    }
    setBusy(true);
    try {
      const path = await uploadFile(file, "wishlist");
      await addItem({ data: { name: name.trim(), storage_path: path } });
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      toast.success("Gift added to the wishlist.");
      setName("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-xl">Wishlist gifts</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="gift-name">Gift name</Label>
          <Input id="gift-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Feeding bottles" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gift-photo">Photo</Label>
          <Input id="gift-photo" type="file" accept="image/*" ref={fileRef} />
        </div>
        <Button type="submit" disabled={busy} className="rounded-full">
          {busy ? "Uploading…" : "Add gift"}
        </Button>
      </form>

      <ul className="mt-6 space-y-4">
        {items.map((item) => {
          const itemReservations = reservations.filter((r) => r.item_id === item.id);
          return (
            <li
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-border p-3 sm:flex-row"
            >
              <img
                src={item.image_url}
                alt={item.name}
                className="h-28 w-28 shrink-0 rounded-xl bg-background object-contain"
              />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium">{item.name}</p>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground/70">
                    {item.reserved_count} of {item.quantity} reserved
                  </span>
                  <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    Qty
                    <input
                      type="number"
                      min={Math.max(item.reserved_count, 1)}
                      max={99}
                      defaultValue={item.quantity}
                      onBlur={(e) => {
                        const quantity = Number(e.target.value);
                        if (!Number.isInteger(quantity) || quantity === item.quantity) return;
                        updateQuantity.mutate({ id: item.id, quantity });
                      }}
                      className="w-14 rounded-lg border border-border bg-background px-2 py-1 text-center text-xs"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => remove.mutate(item.id)}
                    className="text-[11px] text-destructive underline underline-offset-2"
                  >
                    Remove gift
                  </button>
                </div>

                {itemReservations.length > 0 ? (
                  <ul className="space-y-1">
                    {itemReservations.map((r) => (
                      <li key={r.id} className="flex items-center gap-2 text-xs">
                        <span className="truncate">{r.name}</span>
                        <span className="text-muted-foreground/70">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => dropReservation.mutate(r.id)}
                          className="text-[11px] text-destructive underline underline-offset-2"
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No reservations yet.</p>
                )}

                <form
                  className="flex flex-wrap items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const value = (reserveNames[item.id] ?? "").trim();
                    if (value.length < 2) {
                      toast.error("Enter a name.");
                      return;
                    }
                    if (item.reserved_count >= item.quantity) {
                      toast.error("This gift is fully reserved. Increase the quantity first.");
                      return;
                    }
                    createReservation.mutate({ item_id: item.id, name: value });
                  }}
                >
                  <Input
                    value={reserveNames[item.id] ?? ""}
                    onChange={(e) =>
                      setReserveNames((prev) => ({ ...prev, [item.id]: e.target.value }))
                    }
                    placeholder="Add reserver name"
                    className="h-8 w-48 text-xs"
                  />
                  <Button type="submit" size="sm" variant="secondary" className="h-8 rounded-full text-xs">
                    Add
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

    </section>
  );
}

function GalleryManager() {
  const queryClient = useQueryClient();
  const fetchPhotos = useServerFn(listGalleryPhotos);
  const addPhoto = useServerFn(addGalleryPhoto);
  const removePhoto = useServerFn(deleteGalleryPhoto);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ["gallery_photos"],
    queryFn: () => fetchPhotos(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removePhoto({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery_photos"] });
      toast.success("Photo removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length === 0) {
      toast.error("Please choose at least one photo.");
      return;
    }
    setBusy(true);
    try {
      for (const file of files) {
        const path = await uploadFile(file, "gallery");
        await addPhoto({ data: { storage_path: path, caption: caption.trim() || undefined } });
      }
      queryClient.invalidateQueries({ queryKey: ["gallery_photos"] });
      toast.success(files.length > 1 ? `${files.length} photos added.` : "Photo added.");
      setCaption("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <h2 className="font-display text-xl">AZ's photos</h2>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="photo-caption">Caption (optional)</Label>
          <Input
            id="photo-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Two months old"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="photo-files">Photos</Label>
          <Input id="photo-files" type="file" accept="image/*" multiple ref={fileRef} />
        </div>
        <Button type="submit" disabled={busy} className="rounded-full">
          {busy ? "Uploading…" : "Add photos"}
        </Button>
      </form>

      <ul className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
        {photos.map((photo) => (
          <li key={photo.id} className="overflow-hidden rounded-2xl border border-border">
            <img
              src={photo.image_url}
              alt={photo.caption ?? "AZ photo"}
              className="aspect-square w-full object-cover"
            />
            <div className="p-2 text-center">
              <button
                type="button"
                onClick={() => remove.mutate(photo.id)}
                className="text-[11px] text-destructive underline underline-offset-2"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
