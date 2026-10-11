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
  // 1. Sindoor Crimson (विवाह रङ्ग)
  { grad1: "#B3173A", grad2: "#8E1230", stroke: "#5E0B1F", connector: "#B3173A" },
  // 2. Sayapatri Gold (फूलमाला रङ्ग)
  { grad1: "#E8A317", grad2: "#C68200", stroke: "#7A4E00", connector: "#D48F0B" },
  // 3. Himal Dusk Blue (हिमाली सन्ध्या)
  { grad1: "#2A4A94", grad2: "#14295C", stroke: "#0B1A3D", connector: "#14295C" },
  // 4. Terracotta Clay (माटो रङ्ग)
  { grad1: "#D96B27", grad2: "#B4531A", stroke: "#6E2D07", connector: "#B4531A" },
  // 5. Rara Teal (रारा ताल)
  { grad1: "#2DA493", grad2: "#1F7A6D", stroke: "#10473F", connector: "#1F7A6D" },
  // 6. Jamuni Royal (बैजनी)
  { grad1: "#7E52BC", grad2: "#5B3A8C", stroke: "#341E55", connector: "#5B3A8C" },
];

export function getLoveColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return LOVE_COLORS[Math.abs(hash) % LOVE_COLORS.length];
}
