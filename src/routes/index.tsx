import { createFileRoute } from "@tanstack/react-router";
import { RsvpForm } from "@/components/RsvpForm";
import { PhotoSlideshow } from "@/components/PhotoSlideshow";
import { Wishlist } from "@/components/Wishlist";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Azurie Sage's Christening — RSVP" },
      {
        name: "description",
        content:
          "You're warmly invited to the christening of baby Azurie Sage. Find the details and RSVP online.",
      },
      { property: "og:title", content: "Azurie Sage's Christening — RSVP" },
      {
        property: "og:description",
        content: "Celebrate baby Azurie Sage's christening with us. RSVP online.",
      },
    ],
  }),
  component: Index,
});

const details = [
  {
    label: "The Christening",
    lines: ["Saturday, October 3, 2026", "11:00 in the morning", "Our Lady of the Holy Rosary Parish"],
  },
  {
    label: "The Reception",
    lines: ["12:00 NN - 2:00 PM", "Jollibee Lower Bicutan"],
  },
  {
    label: "Attire",
    lines: ["Casual pink for guests", "White for ninong and ninang", "Come comfortable"],
  },
];

const wishlist = [
  { name: "Storybook collection", image: storybooks.url },
  { name: "Graded reading books set", image: readingBooks.url },
  { name: "Baby food processor", image: foodProcessor.url },
  { name: "Diapers (size M)", image: diapers.url },
  { name: "Baby laundry detergent", image: laundryDetergent.url },
  { name: "Baby fabric softener", image: fabricSoftener.url },
  { name: "Convertible high chair", image: highChair.url },
  { name: "Baby tableware set", image: tableware.url },
  { name: "Bottle & nipple cleanser", image: bottleCleanser.url },
  { name: "Feeding bottles (240ml)", image: feedingBottles.url },
  { name: "Diaper bag backpack", image: diaperBag.url },
];

type WishlistItem = (typeof wishlist)[number];

function Index() {
  const [active, setActive] = useState<WishlistItem | null>(null);

  return (

    <main className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden px-6 py-24 text-center sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-secondary/50 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl animate-rise">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            With hearts full of gratitude
          </p>
          <h1 className="mt-8 font-script text-6xl leading-tight text-foreground sm:text-8xl">
            Azurie Sage
          </h1>
          <div className="mx-auto mt-8 flex items-center justify-center gap-4">
            <span className="h-px w-16 bg-border" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Christening</span>
            <span className="h-px w-16 bg-border" />
          </div>
          <p className="mt-8 text-base leading-relaxed text-muted-foreground">
            We invite you to join us as our little one receives the sacrament of baptism, and to stay
            afterwards for a warm celebration with family and friends.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {details.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm"
            >
              <h2 className="font-display text-xl">{item.label}</h2>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {item.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pictures" className="px-6 pb-24">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-script text-5xl">AZ's Pictures</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              A few of our favourite moments with our little sunshine.
            </p>
          </div>
          <div className="mt-10">
            <PhotoSlideshow />
          </div>
        </div>
      </section>

      <section id="wishlist" className="px-6 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-script text-5xl">AZ's Wishlist</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              Your presence is the greatest gift. But if you'd like to spoil our little one, here are a
              few things she'd love.
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {wishlist.map((item) => (
              <li
                key={item.name}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setActive(item)}
                  className="block w-full cursor-zoom-in transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`View ${item.name} larger`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="aspect-square w-full bg-background object-contain"
                  />
                </button>
                <p className="px-4 py-4 text-center text-sm text-muted-foreground">{item.name}</p>
              </li>
            ))}
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
                className="relative max-h-full w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card"
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
                  src={active.image}
                  alt={active.name}
                  className="max-h-[70vh] w-full bg-background object-contain"
                />
                <p className="px-6 py-4 text-center font-display text-lg">{active.name}</p>
              </div>
            </div>
          )}

        </div>
      </section>


      <section id="rsvp" className="bg-secondary/30 px-6 py-24">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <h2 className="font-script text-5xl">Kindly confirm</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Please let us know by September 20, 2026 so we can prepare a seat for you.
            </p>
          </div>
          <div className="mt-10">
            <RsvpForm />
          </div>
        </div>
      </section>

      <footer className="px-6 py-12 text-center text-xs text-muted-foreground">
        <p className="font-script text-2xl text-foreground">Azurie Sage</p>
        <p className="mt-3">With love from the family</p>
      </footer>
    </main>
  );
}
