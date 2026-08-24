import type { MediaKind } from "./types";

export function mediaKindOf(file: File): MediaKind {
  if (file.type.startsWith("video")) return "video";
  if (file.type.startsWith("audio")) return "audio";
  return "image";
}

export function formatDate(dateString?: string) {
  if (!dateString) return null;
  const dateObj = new Date(dateString + "T00:00:00");
  if (Number.isNaN(dateObj.getTime())) return dateString;
  return dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const LOVE_COLORS = [
  // 1. Classic Rose
  { grad1: "hsl(345 90% 62%)", grad2: "hsl(325 75% 45%)", stroke: "hsl(345 60% 35%)", connector: "#e11d48" },
  // 2. Vibrant Pink
  { grad1: "hsl(330 90% 65%)", grad2: "hsl(310 80% 50%)", stroke: "hsl(330 60% 40%)", connector: "#db2777" },
  // 3. Bright Red
  { grad1: "hsl(0 85% 65%)", grad2: "hsl(350 75% 45%)", stroke: "hsl(0 60% 35%)", connector: "#dc2626" },
  // 4. Fuchsia
  { grad1: "hsl(290 85% 65%)", grad2: "hsl(270 75% 45%)", stroke: "hsl(290 60% 35%)", connector: "#c026d3" },
  // 5. Violet
  { grad1: "hsl(260 85% 65%)", grad2: "hsl(240 75% 50%)", stroke: "hsl(260 60% 40%)", connector: "#7c3aed" },
  // 6. Orange/Peach
  { grad1: "hsl(15 90% 65%)", grad2: "hsl(5 80% 50%)", stroke: "hsl(15 60% 40%)", connector: "#ea580c" },
];

export function getLoveColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOVE_COLORS[Math.abs(hash) % LOVE_COLORS.length];
}
