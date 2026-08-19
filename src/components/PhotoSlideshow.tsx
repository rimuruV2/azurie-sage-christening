import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import p1 from "@/assets/gallery/IMG_3270.jpg.asset.json";
import p2 from "@/assets/gallery/IMG_3237.jpg.asset.json";
import p3 from "@/assets/gallery/IMG_3257.jpg.asset.json";
import p4 from "@/assets/gallery/IMG_3262.jpg.asset.json";
import p5 from "@/assets/gallery/IMG_3263.jpg.asset.json";
import p6 from "@/assets/gallery/IMG_2954.jpg.asset.json";
import p7 from "@/assets/gallery/IMG_3292.jpg.asset.json";
import p8 from "@/assets/gallery/IMG_3306.jpg.asset.json";
import p9 from "@/assets/gallery/IMG_3722.jpg.asset.json";
import p10 from "@/assets/gallery/IMG_3729.jpg.asset.json";

const photos = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10].map((p, i) => ({
  url: p.url,
  alt: `Baby Azurie Sage, photo ${i + 1}`,
}));

export function PhotoSlideshow() {
  const [index, setIndex] = useState(0);
  const go = (step: number) => setIndex((i) => (i + step + photos.length) % photos.length);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {photos.map((photo) => (
            <img
              key={photo.url}
              src={photo.url}
              alt={photo.alt}
              loading="lazy"
              className="h-[420px] w-full shrink-0 bg-background object-contain sm:h-[520px]"
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 text-foreground shadow-sm transition hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {photos.map((photo, i) => (
          <button
            key={photo.url}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to photo ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
