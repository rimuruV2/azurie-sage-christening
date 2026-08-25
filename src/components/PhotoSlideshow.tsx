import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { listGalleryPhotos } from "@/lib/wishlist.functions";

export function PhotoSlideshow() {
  const fetchPhotos = useServerFn(listGalleryPhotos);
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["gallery_photos"],
    queryFn: () => fetchPhotos(),
  });

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<null | { image_url: string; caption: string | null }>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(false);
  const count = photos.length;

  const slideWidth = () => (trackRef.current?.clientWidth ?? 900) / 3;

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragStart.current = e.clientX;
    dragged.current = false;
    setPaused(true);
    setTransitionEnabled(false);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 5) dragged.current = true;
    setDragOffset(delta);
  }

  function endDrag() {
    if (dragStart.current === null) return;
    const width = slideWidth();
    const steps = Math.round(-dragOffset / width);
    dragStart.current = null;
    setDragOffset(0);
    setTransitionEnabled(true);
    if (steps !== 0) setIndex((i) => i + steps);
    setPaused(false);
  }


  useEffect(() => {
    if (count) setIndex(count);
    return;
  }, [count]);

  const go = (step: number) => {
    if (!count) return;
    setTransitionEnabled(true);
    setIndex((i) => i + step);
    return;
  };

  useEffect(() => {
    if (!count) return;
    if (index >= count * 2) {
      setTransitionEnabled(false);
      setIndex((i) => i - count);
    } else if (index < count) {
      setTransitionEnabled(false);
      setIndex((i) => i + count);
    }
    return;
  }, [index, count]);

  useEffect(() => {
    if (!transitionEnabled) {
      const r = requestAnimationFrame(() => setTransitionEnabled(true));
      return () => cancelAnimationFrame(r);
    }
    return;
  }, [transitionEnabled]);

  useEffect(() => {
    if (paused || count <= 3) return;
    const timer = setInterval(() => {
      setTransitionEnabled(true);
      setIndex((i) => i + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, [paused, count]);

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-56 animate-pulse rounded-3xl border border-border bg-card" />
        ))}
      </div>
    );
  }

  if (!count) {
    return <p className="text-center text-sm text-muted-foreground">Photos coming soon.</p>;
  }

  const displayPhotos = [...photos, ...photos, ...photos];
  const activeDot = index % count;

  return (
    <div
      className="mx-auto max-w-5xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          className="cursor-grab overflow-hidden rounded-3xl active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={`flex ${transitionEnabled ? "transition-transform duration-700 ease-out" : ""}`}
            style={{
              transform: `translateX(calc(-${index * (100 / 3)}% + ${dragOffset}px))`,
            }}
          >
            {displayPhotos.map((photo, i) => (
              <figure
                key={`${photo.id}-${i}`}
                className="w-1/3 shrink-0 px-1.5"
              >
                <button
                  type="button"
                  draggable={false}
                  onClick={() => {
                    if (dragged.current) return;
                    setSelectedPhoto({ image_url: photo.image_url, caption: photo.caption });
                  }}
                  className="block w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-[0_0_28px_-6px_var(--gold)] transition-shadow duration-500 hover:shadow-[0_0_40px_-4px_var(--gold)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >

                  <img
                    src={photo.image_url}
                    alt={photo.caption ?? "Baby Azurie Sage"}
                    loading="lazy"
                    className="h-40 w-full bg-background object-cover sm:h-60"
                  />
                </button>
                {photo.caption && (
                  <figcaption className="mt-2 text-center text-xs text-muted-foreground">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photos"
          className="absolute -left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-sm transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photos"
          className="absolute -right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground shadow-sm transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => {
              setTransitionEnabled(true);
              setIndex(count + i);
              return;
            }}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === activeDot}
            className={`h-2 rounded-full transition-all ${
              i === activeDot ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close photo"
            className="absolute right-4 top-4 rounded-full bg-background/90 p-2 text-foreground shadow-sm transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-6 w-6" />
          </button>
          <figure
            className="max-h-[85vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image_url}
              alt={selectedPhoto.caption ?? "Baby Azurie Sage"}
              className="max-h-[80vh] w-auto rounded-3xl border border-border bg-card object-contain shadow-[0_0_50px_-10px_var(--gold)]"
            />
            {selectedPhoto.caption && (
              <figcaption className="mt-4 text-center text-sm text-muted-foreground">
                {selectedPhoto.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
