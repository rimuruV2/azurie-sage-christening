import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitRsvp } from "@/lib/rsvp.functions";
import { rsvpSchema } from "@/lib/rsvp-schema";

export function RsvpForm() {
  const send = useServerFn(submitRsvp);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState("1");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<null | { attending: boolean }>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (attending === null) {
      setErrors({ attending: "Please let us know if you can join us" });
      return;
    }

    const parsed = rsvpSchema.safeParse({ fullName, phone, attending, guestCount });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setPending(true);
    try {
      await send({ data: parsed.data });
      setDone({ attending: parsed.data.attending });
      toast.success(
        parsed.data.attending ? "Thank you — we can't wait to see you!" : "Thank you for letting us know.",
      );
    } catch {
      toast.error("Something went wrong saving your RSVP. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <p className="font-script text-4xl text-primary-foreground">Thank you</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {done.attending
            ? "Your RSVP is confirmed. We're so glad you'll be celebrating Azurie Sage with us."
            : "We'll miss you, but we're grateful you let us know. Azurie sends love."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Your full name</Label>
        <Input
          id="fullName"
          value={fullName}
          maxLength={100}
          autoComplete="name"
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Maria Santos"
        />
        {errors["fullName"] && <p className="text-xs text-destructive">{errors["fullName"]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          inputMode="tel"
          value={phone}
          maxLength={30}
          autoComplete="tel"
          onChange={(e) => setPhone(e.target.value)}
          placeholder="0917 123 4567"
        />
        {errors["phone"] && <p className="text-xs text-destructive">{errors["phone"]}</p>}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Will you be joining us?</legend>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Joyfully accepts", value: true },
            { label: "Regretfully declines", value: false },
          ].map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setAttending(option.value)}
              aria-pressed={attending === option.value}
              className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                attending === option.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors["attending"] && <p className="text-xs text-destructive">{errors["attending"]}</p>}
      </fieldset>

      {attending === true && (
        <div className="space-y-2">
          <Label htmlFor="guestCount">Number of guests attending (including you)</Label>
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={10}
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
          />
          {errors["guestCount"] && <p className="text-xs text-destructive">{errors["guestCount"]}</p>}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full rounded-full py-6 text-base">
        {pending ? "Confirming…" : "Confirm"}
      </Button>
    </form>
  );
}
