import { createFileRoute, Link } from "@tanstack/react-router";
import { Wishlist } from "@/components/Wishlist";
import bpiQr from "@/assets/gifts/bpi-qr.jpeg.asset.json";
import gcashQr from "@/assets/gifts/gcash-qr.jpeg.asset.json";
import mariQr from "@/assets/gifts/maribank-qr.jpeg.asset.json";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "AZ's Wishlist — Azurie Sage's Christening" },
      {
        name: "description",
        content:
          "Reserve a gift from baby Azurie Sage's christening wishlist, or send a monetary gift through GCash, BPI, or MariBank.",
      },
      { property: "og:title", content: "AZ's Wishlist — Azurie Sage's Christening" },
      {
        property: "og:description",
        content: "Reserve a gift for baby Azurie Sage, or send a monetary gift by QR code.",
      },
    ],
  }),
  component: WishlistPage,
});

const qrCodes = [
  { label: "GCash", url: gcashQr.url, detail: "0975 963 ••••" },
  { label: "BPI", url: bpiQr.url, detail: "•••••••••767" },
  { label: "MariBank", url: mariQr.url, detail: "••••1356" },
];

function WishlistPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="px-6 pb-16 pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            With hearts full of gratitude
          </p>
          <h1 className="mt-6 font-script text-5xl sm:text-6xl">AZ's Wishlist</h1>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Your presence is the greatest gift. But if you'd like to spoil our little one, tap a
            gift to reserve it — reserved gifts are marked so no one doubles up.
          </p>
        </div>
        <div className="mx-auto max-w-5xl">
          <Wishlist />
        </div>
      </section>

      <section id="monetary" className="bg-secondary/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="font-script text-5xl">Monetary Gifts</h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
              If you prefer to give a monetary gift, you may scan any of the QR codes below. All
              accounts are under the name <span className="text-foreground">Angielyn Alonzo</span>.
            </p>
          </div>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {qrCodes.map((qr) => (
              <li
                key={qr.label}
                className="rounded-3xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <h3 className="font-display text-lg">{qr.label}</h3>
                <img
                  src={qr.url}
                  alt={`${qr.label} QR code for Angielyn Alonzo`}
                  loading="lazy"
                  className="mx-auto mt-4 w-full max-w-[220px] rounded-2xl bg-background object-contain"
                />
                <p className="mt-4 text-sm text-muted-foreground">Angielyn Alonzo</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  {qr.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="px-6 py-12 text-center">
        <Link
          to="/"
          hash="rsvp"
          className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Back to the invitation
        </Link>
      </div>
    </main>
  );
}
