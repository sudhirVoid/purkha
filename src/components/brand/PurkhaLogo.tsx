import { cn } from "@/lib/utils";

export const BRAND = {
  name: "PURKHA",
  nameNepali: "पुर्खा",
  meaning: "The Ancestors",
  league: "The League of Nepali People",
  motto: "हाम्रा पुर्खा, हाम्रो पहिचान",
  mottoEnglish: "Our ancestors, our identity",
} as const;

type MarkProps = {
  className?: string;
  title?: string;
};

/**
 * The PURKHA mark.
 * The double-pennant silhouette of the Nepali flag holds two generations:
 * the moon (elders, above) is joined to the sun (descendants, below)
 * by a marigold thread of lineage.
 */
export function PurkhaMark({ className, title = "PURKHA" }: MarkProps) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI * 2) / 12;
    const cx = 13;
    const cy = 35;
    return {
      x1: cx + Math.cos(a) * 4.6,
      y1: cy + Math.sin(a) * 4.6,
      x2: cx + Math.cos(a) * 6.4,
      y2: cy + Math.sin(a) * 6.4,
    };
  });

  return (
    <svg
      viewBox="0 0 40 48"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : true}
      className={cn("shrink-0", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 3 L35 23 L17 23 L35 45 L5 45 Z"
        fill="var(--color-sindoor)"
        stroke="var(--color-himal)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Moon — the elders */}
      <path d="M7.5 13.5 a5 5 0 0 0 10 0 a5 3.4 0 0 1 -10 0 Z" fill="#FBF4E7" />
      <circle cx="12.5" cy="12.2" r="1.6" fill="#FBF4E7" />
      {/* Thread of lineage */}
      <line
        x1="12.6"
        y1="20"
        x2="13"
        y2="27.6"
        stroke="var(--color-sayapatri)"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.4 2"
      />
      {/* Sun — the descendants */}
      <circle cx="13" cy="35" r="3.4" fill="#FBF4E7" />
      {rays.map((r, i) => (
        <line
          key={i}
          {...r}
          stroke="#FBF4E7"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

type LogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "inverse";
  showNepali?: boolean;
  showTagline?: boolean;
};

const sizes = {
  sm: { mark: "h-8 w-auto", word: "text-lg", np: "text-xs", tag: "text-[9px]" },
  md: { mark: "h-10 w-auto", word: "text-[22px]", np: "text-sm", tag: "text-[10px]" },
  lg: { mark: "h-14 w-auto", word: "text-3xl", np: "text-base", tag: "text-[11px]" },
};

export function PurkhaLogo({
  className,
  size = "md",
  tone = "default",
  showNepali = true,
  showTagline = false,
}: LogoProps) {
  const s = sizes[size];
  const inverse = tone === "inverse";

  return (
    <span className={cn("inline-flex items-center gap-3 select-none", className)}>
      <PurkhaMark className={s.mark} />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              "font-brand font-bold tracking-[0.22em]",
              s.word,
              inverse ? "text-lokta-light" : "text-himal",
            )}
          >
            {BRAND.name}
          </span>
          {showNepali && (
            <span
              className={cn(
                "font-devanagari font-semibold",
                s.np,
                inverse ? "text-sayapatri" : "text-sindoor",
              )}
              lang="ne"
            >
              {BRAND.nameNepali}
            </span>
          )}
        </span>
        {showTagline && (
          <span
            className={cn(
              "font-label-xs uppercase tracking-[0.2em] mt-1.5",
              s.tag,
              inverse ? "text-lokta-light/70" : "text-on-surface-variant",
            )}
          >
            {BRAND.league}
          </span>
        )}
      </span>
    </span>
  );
}
