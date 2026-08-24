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
