import { useEffect, useState } from "react";

const EVENT_DATE = new Date("2026-10-03T11:00:00+08:00").getTime();

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const now = Date.now();
  const diff = Math.max(0, EVENT_DATE - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-4">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card/70 p-3 text-center backdrop-blur-sm"
          >
            <span className="block font-display text-3xl font-bold text-foreground sm:text-4xl">--</span>
            <span className="mt-1 block text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const units: { value: number; label: string }[] = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-4">
      {units.map(({ value, label }) => (
        <div
          key={label}
          className="rounded-2xl border border-border bg-card/70 p-3 text-center shadow-sm backdrop-blur-sm"
        >
          <span className="block font-display text-3xl font-bold text-foreground sm:text-4xl">
            {String(value).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
