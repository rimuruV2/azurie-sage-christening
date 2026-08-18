import { createFileRoute } from "@tanstack/react-router";
import { RsvpForm } from "@/components/RsvpForm";

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

function Index() {
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
