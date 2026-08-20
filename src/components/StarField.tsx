type Star = {
  top: string;
  left: string;
  size: string;
  delay: string;
  duration: string;
};

const stars: Star[] = [
  { top: "5%", left: "4%", size: "w-1.5 h-1.5", delay: "0s", duration: "2.2s" },
  { top: "8%", left: "18%", size: "w-1 h-1", delay: "0.3s", duration: "2.8s" },
  { top: "3%", left: "34%", size: "w-2 h-2", delay: "0.6s", duration: "2.4s" },
  { top: "12%", left: "48%", size: "w-1 h-1", delay: "0.9s", duration: "3s" },
  { top: "6%", left: "62%", size: "w-1.5 h-1.5", delay: "1.2s", duration: "2.6s" },
  { top: "10%", left: "78%", size: "w-1 h-1", delay: "1.5s", duration: "2.3s" },
  { top: "4%", left: "92%", size: "w-2 h-2", delay: "1.8s", duration: "2.7s" },
  { top: "18%", left: "8%", size: "w-1 h-1", delay: "0.2s", duration: "2.5s" },
  { top: "22%", left: "28%", size: "w-1.5 h-1.5", delay: "0.5s", duration: "2.9s" },
  { top: "16%", left: "56%", size: "w-1 h-1", delay: "0.8s", duration: "2.1s" },
  { top: "24%", left: "72%", size: "w-2 h-2", delay: "1.1s", duration: "2.6s" },
  { top: "20%", left: "88%", size: "w-1 h-1", delay: "1.4s", duration: "3.1s" },
  { top: "32%", left: "14%", size: "w-1.5 h-1.5", delay: "0.1s", duration: "2.4s" },
  { top: "36%", left: "40%", size: "w-1 h-1", delay: "0.4s", duration: "2.7s" },
  { top: "30%", left: "66%", size: "w-1.5 h-1.5", delay: "0.7s", duration: "2.2s" },
  { top: "38%", left: "84%", size: "w-1 h-1", delay: "1s", duration: "2.8s" },
  { top: "46%", left: "6%", size: "w-1 h-1", delay: "1.3s", duration: "2.5s" },
  { top: "50%", left: "26%", size: "w-2 h-2", delay: "1.6s", duration: "2.3s" },
  { top: "44%", left: "52%", size: "w-1 h-1", delay: "1.9s", duration: "2.9s" },
  { top: "52%", left: "74%", size: "w-1.5 h-1.5", delay: "0.35s", duration: "2.6s" },
  { top: "48%", left: "94%", size: "w-1 h-1", delay: "0.65s", duration: "2.1s" },
  { top: "62%", left: "12%", size: "w-1.5 h-1.5", delay: "0.95s", duration: "2.8s" },
  { top: "66%", left: "36%", size: "w-1 h-1", delay: "1.25s", duration: "2.4s" },
  { top: "60%", left: "60%", size: "w-2 h-2", delay: "1.55s", duration: "3s" },
  { top: "68%", left: "82%", size: "w-1 h-1", delay: "1.85s", duration: "2.5s" },
  { top: "76%", left: "4%", size: "w-1 h-1", delay: "0.15s", duration: "2.7s" },
  { top: "80%", left: "24%", size: "w-1.5 h-1.5", delay: "0.45s", duration: "2.2s" },
  { top: "74%", left: "46%", size: "w-1 h-1", delay: "0.75s", duration: "2.9s" },
  { top: "82%", left: "68%", size: "w-2 h-2", delay: "1.05s", duration: "2.6s" },
  { top: "78%", left: "90%", size: "w-1 h-1", delay: "1.35s", duration: "2.3s" },
  { top: "90%", left: "16%", size: "w-1.5 h-1.5", delay: "1.65s", duration: "2.8s" },
  { top: "94%", left: "38%", size: "w-1 h-1", delay: "1.95s", duration: "2.4s" },
  { top: "88%", left: "58%", size: "w-2 h-2", delay: "0.25s", duration: "3.1s" },
  { top: "92%", left: "80%", size: "w-1 h-1", delay: "0.55s", duration: "2.5s" },
  { top: "96%", left: "96%", size: "w-1.5 h-1.5", delay: "0.85s", duration: "2.7s" },
];

export function StarField() {
  return (
    <>
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-pink/20 via-transparent to-pink/10" />
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {stars.map((star, i) => (
        <svg
          key={i}
          className={`absolute text-gold animate-twinkle drop-shadow-[0_0_4px_rgba(212,175,55,0.8)] ${star.size}`}
          style={{
            top: star.top,
            left: star.left,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      ))}
    </div>
    </>
  );
}
