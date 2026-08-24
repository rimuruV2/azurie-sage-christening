import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { listWishlist, reserveWishlistItem } from "@/lib/wishlist.functions";

type Item = {
  id: string;
  name: string;
  image_url: string;
  reserved_by_name: string | null;
  reserved_count: number;
  quantity: number;
  sort_order: number;
};


export function Wishlist() {
  const fetchWishlist = useServerFn(listWishlist);
  const reserveFn = useServerFn(reserveWishlistItem);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["wishlist_items"],
    queryFn: () => fetchWishlist(),
  });

  const [active, setActive] = useState<Item | null>(null);
  const [name, setName] = useState("");

  const reserve = useMutation({
    mutationFn: (input: { id: string; name: string }) => reserveFn({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
      toast.success("Thank you! This gift is reserved for you.");
      setActive(null);
      setName("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong. Please try again.");
      queryClient.invalidateQueries({ queryKey: ["wishlist_items"] });
    },
  });

  if (isLoading) {
    return (
      <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <li key={i} className="h-56 animate-pulse rounded-3xl border border-border bg-card" />
        ))}
      </ul>
    );
  }

  return (
    <>
      <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        {items.map((item) => {
          const reserved = Boolean(item.reserved_by_name);
          return (
            <li
              key={item.id}
              className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                disabled={reserved}
                onClick={() => setActive(item as Item)}
                className="block w-full transition enabled:cursor-pointer enabled:hover:opacity-90 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={reserved ? `${item.name} is already reserved` : `Reserve ${item.name}`}
              >
                <img
                  src={item.image_url}
                  alt={item.name}
                  loading="lazy"
                  className={`aspect-square w-full bg-background object-contain ${
                    reserved ? "opacity-40 grayscale" : ""
                  }`}
                />
              </button>
              <div className="px-4 py-4 text-center">
                <p className="text-sm text-muted-foreground">{item.name}</p>
                {reserved ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                    Reserved
                  </p>
                ) : (
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-primary">Available</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.name}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-6 backdrop-blur-sm"
        >
          <div
            className="relative max-h-full w-full max-w-md overflow-auto rounded-3xl border border-border bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-sm text-foreground shadow-sm"
            >
              Close
            </button>
            <img
              src={active.image_url}
              alt={active.name}
              className="max-h-[45vh] w-full bg-background object-contain"
            />
            <div className="px-6 pb-6 pt-4">
              <p className="text-center font-display text-lg">{active.name}</p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (name.trim().length < 2) {
                    toast.error("Please enter your name.");
                    return;
                  }
                  reserve.mutate({ id: active.id, name: name.trim() });
                }}
              >
                <label className="block text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Your name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm normal-case tracking-normal text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Maria Santos"
                  />
                </label>
                <button
                  type="submit"
                  disabled={reserve.isPending}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {reserve.isPending ? "Reserving…" : "Reserve this gift"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
