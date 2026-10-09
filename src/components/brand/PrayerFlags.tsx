import { cn } from "@/lib/utils";

// Lungta order: sky (blue), air (white), fire (red), water (green), earth (yellow)
const LUNGTA = ["#2A5DB0", "#F7F3EA", "#C8102E", "#2E8B57", "#F2C230"];

/** A decorative string of gently swaying prayer flags. Purely ornamental. */
export function PrayerFlags({ count = 15, className }: { count?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none relative h-10 w-full", className)}>
      <svg className="absolute inset-x-0 top-0 h-6 w-full" preserveAspectRatio="none" viewBox="0 0 100 10">
        <path d="M0 1 Q50 9 100 1" fill="none" stroke="rgb(74 66 56 / 0.45)" strokeWidth="0.25" />
      </svg>
      <div className="absolute inset-x-0 top-0 flex justify-between px-[2%]">
        {Array.from({ length: count }, (_, i) => {
          // Follow the sagging string (quadratic curve) so flags hang naturally
          const t = (i + 0.5) / count;
          const sag = 4 * t * (1 - t) * 13;
          return (
            <span
              key={i}
              className="lungta-flag block h-6 w-5 rounded-[1px] shadow-sm"
              style={{
                backgroundColor: LUNGTA[i % LUNGTA.length],
                marginTop: `${sag + 2}px`,
                animationDelay: `${(i % 5) * -0.7}s`,
                border: LUNGTA[i % LUNGTA.length] === "#F7F3EA" ? "1px solid #E4D3B4" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
