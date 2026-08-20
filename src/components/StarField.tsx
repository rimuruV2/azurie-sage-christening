const stars = [
  { top: "8%", left: "6%", size: "w-2 h-2", delay: "0s" },
  { top: "14%", left: "22%", size: "w-1.5 h-1.5", delay: "0.4s" },
  { top: "6%", left: "44%", size: "w-2 h-2", delay: "0.8s" },
  { top: "18%", left: "68%", size: "w-1.5 h-1.5", delay: "1.2s" },
  { top: "10%", left: "88%", size: "w-2.5 h-2.5", delay: "1.6s" },
  { top: "32%", left: "12%", size: "w-1.5 h-1.5", delay: "0.2s" },
  { top: "38%", left: "54%", size: "w-2 h-2", delay: "0.6s" },
  { top: "30%", left: "82%", size: "w-1.5 h-1.5", delay: "1s" },
  { top: "52%", left: "8%", size: "w-2 h-2", delay: "1.4s" },
  { top: "58%", left: "36%", size: "w-1.5 h-1.5", delay: "1.8s" },
  { top: "54%", left: "72%", size: "w-2.5 h-2.5", delay: "0.3s" },
  { top: "72%", left: "18%", size: "w-1.5 h-1.5", delay: "0.7s" },
  { top: "78%", left: "50%", size: "w-2 h-2", delay: "1.1s" },
  { top: "70%", left: "86%", size: "w-1.5 h-1.5", delay: "1.5s" },
  { top: "90%", left: "30%", size: "w-2 h-2", delay: "1.9s" },
  { top: "92%", left: "66%", size: "w-1.5 h-1.5", delay: "0.5s" },
];

export function StarField() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-pink/20 via-transparent to-pink/10" />
      {stars.map((star, i) => (
        <svg
          key={i}
          className={`absolute text-gold animate-twinkle ${star.size}`}
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      ))}
    </div>
  );
}
