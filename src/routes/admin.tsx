import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { listRsvps } from "@/lib/rsvp.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Host Sign In — Azurie Sage's Christening" },
      { name: "description", content: "Private area for the family to review christening RSVPs." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Host Sign In — Azurie Sage's Christening" },
      { property: "og:description", content: "Private area for the family to review RSVPs." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUserEmail(data.user?.email ?? null);
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      setUserEmail(session?.user?.email ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="font-script text-4xl">Azurie Sage</p>
          <h1 className="mt-2 text-xl font-medium">Host area</h1>
        </div>
        <div className="mt-10">
          {checking ? (
            <p className="text-center text-sm text-muted-foreground">Loading…</p>
          ) : userEmail ? (
            <>
              <NewPasswordCard />
              <div className="mt-8">
                <GuestList email={userEmail} />
              </div>
            </>

          ) : (
            <AuthCard />
          )}
        </div>
        <p className="mt-10 text-center text-sm">
          <Link to="/" className="underline underline-offset-4">
            Back to the invitation
          </Link>
        </p>
      </div>
    </main>
  );
}

function AuthCard() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const cleanEmail = email.trim().toLowerCase();
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox if confirmation is required.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  async function handleReset() {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      toast.error("Enter your email first, then tap reset.");
      return;
    }
    setPending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (error) throw error;
      toast.success("Password reset link sent. Check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset link");
    } finally {
      setPending(false);
    }
  }


  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-sm space-y-5 rounded-3xl border border-border bg-card p-8 shadow-sm"
    >
      <h2 className="text-center font-display text-2xl">
        {mode === "signin" ? "Sign in" : "Create host account"}
      </h2>
      <div className="space-y-2">
        <Label htmlFor="admin-email">Email</Label>
        <Input
          id="admin-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          type="password"
          value={password}
          minLength={6}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={pending} className="w-full rounded-full">
        {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
      </Button>
      <button
        type="button"
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
      >
        {mode === "signin" ? "Need to create the host account?" : "Already have an account? Sign in"}
      </button>
      {mode === "signin" && (
        <button
          type="button"
          onClick={handleReset}
          disabled={pending}
          className="w-full text-center text-xs text-muted-foreground underline underline-offset-4"
        >
          Forgot password? Email me a reset link
        </button>
      )}

    </form>
  );
}

function GuestList({ email }: { email: string }) {
  const fetchRsvps = useServerFn(listRsvps);
  const { data, isLoading, error } = useQuery({
    queryKey: ["rsvps"],
    queryFn: () => fetchRsvps({ data: undefined }),
  });

  if (isLoading) return <p className="text-center text-sm text-muted-foreground">Loading guest list…</p>;
  if (error)
    return <p className="text-center text-sm text-destructive">Could not load the guest list.</p>;
  if (!data?.isAdmin)
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          This account doesn't have host access to the guest list.
        </p>
        <Button variant="outline" className="mt-4 rounded-full" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>
    );

  const rsvps = data.rsvps;
  const attending = rsvps.filter((r) => r.attending);
  const headcount = attending.reduce((sum, r) => sum + r.guest_count, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Signed in as {email}</p>
        <Button variant="outline" className="rounded-full" onClick={() => supabase.auth.signOut()}>
          Sign out
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Attending", value: attending.length },
          { label: "Declined", value: rsvps.length - attending.length },
          { label: "Total headcount", value: headcount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-card p-6 text-center">
            <p className="font-display text-3xl">{stat.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-3xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Name</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Reply</th>
              <th className="px-5 py-4">Guests</th>
              <th className="px-5 py-4">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-muted-foreground">
                  No RSVPs yet.
                </td>
              </tr>
            )}
            {rsvps.map((r) => (
              <tr key={r.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-4">{r.full_name}</td>
                <td className="px-5 py-4 text-muted-foreground">{r.phone}</td>
                <td className="px-5 py-4">{r.attending ? "Attending" : "Declined"}</td>
                <td className="px-5 py-4">{r.attending ? r.guest_count : "—"}</td>
                <td className="px-5 py-4 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewPasswordCard() {
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated.");
      setNewPassword("");
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update password");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div className="text-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs text-muted-foreground underline underline-offset-4"
        >
          Set a new password
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={save}
      className="mx-auto max-w-sm space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          minLength={6}
          value={newPassword}
          autoComplete="new-password"
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="flex-1 rounded-full">
          {pending ? "Saving…" : "Save password"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
