# Azurie Sage — Christening RSVP Website

A soft-pastel christening invitation site with a working RSVP form saved to a real database, plus a private host page to see the guest list.

## Pages

- `/` — Invitation + RSVP
  - Hero: "Azurie Sage" in elegant script, "You're invited to our baby's christening", cream/blush/dusty-blue palette.
  - Event details section (church, reception, date/time) with placeholder copy you can edit — tell me the date/venue any time and I'll fill it in.
  - RSVP form: full name, email, attending (Yes / No), number of guests (0–10 when attending). Validated on both sides, friendly success + error toasts.
- `/admin` — Host login + guest list
  - Email/password sign-in. Signed-in host sees every RSVP: name, email, attending, guest count, submitted date, plus totals (attending / declined / total headcount).
  - Not signed in → redirected to login.

## Backend (Lovable Cloud)

- Enable Lovable Cloud (database + auth).
- Table `rsvps`: id, full_name, email, attending (bool), guest_count (int), created_at.
- Security:
  - Anyone can submit an RSVP (public insert only).
  - Nobody public can read RSVPs; only signed-in hosts (admin role) can read them.
  - Roles stored in a separate `user_roles` table with a `has_role` check — no role flags on profiles.
- Reads for the admin page go through an authenticated server function so nothing leaks to the browser.

## Design

Palette: cream `#FDF6EF`, blush `#EBD3D0`, dusty blue `#A9BFD1`, warm brown text `#4A4034`. Script display font for names/headings paired with a clean body serif/sans. Soft cards, gentle rounded corners, subtle fade-in on scroll. All colors as design tokens in `src/styles.css`.

## Technical notes

- `src/routes/index.tsx` replaced with the invitation page; `src/routes/admin.tsx` for the host area (auth gate + list).
- RSVP insert and admin list live in `src/lib/rsvp.functions.ts` (`createServerFn`); admin fn uses `requireSupabaseAuth` middleware and verifies the admin role.
- Zod schema shared by the form and the server validator; guest_count constrained in the DB too.
- Migration creates the table, GRANTs for anon insert / authenticated select, RLS enabled, policies, and the roles table + `has_role` function.
- Per-route `head()` metadata (title, description, og/twitter); `admin` marked `noindex`.
- Toasts via `sonner`, `<Toaster />` mounted once in `__root.tsx`.

## After approval

You'll need to create the host account once via the sign-up on `/admin`; I'll wire the first registered user to be granted the admin role via a migration-seeded step or tell you the one-line grant to run.
