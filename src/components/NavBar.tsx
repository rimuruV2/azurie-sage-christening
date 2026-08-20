import { Link, useRouterState } from "@tanstack/react-router";
import { ThemeToggle } from "./ThemeToggle";

export function NavBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHome = pathname === "/";

  const linkClass =
    "rounded-full px-3 py-1.5 font-display text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold leading-none text-foreground">
          Azurie Sage
        </Link>
        <div className="flex items-center gap-1">
          {onHome ? (
            <a href="#pictures" className={linkClass}>
              Pictures
            </a>
          ) : (
            <Link to="/" hash="pictures" className={linkClass}>
              Pictures
            </Link>
          )}
          <Link
            to="/wishlist"
            className={linkClass}
            activeProps={{ className: `${linkClass} bg-secondary/70 text-foreground` }}
          >
            Wishlist
          </Link>
          {onHome ? (
            <a href="#rsvp" className={linkClass}>
              RSVP
            </a>
          ) : (
            <Link to="/" hash="rsvp" className={linkClass}>
              RSVP
            </Link>
          )}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
