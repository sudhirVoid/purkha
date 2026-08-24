import type { Gender, MediaKind } from "./types";

export const genderIcon: Record<Gender, string> = { male: "♂", female: "♀", other: "⚧" };

// Harmonized with the lokta-texture background (#fcf2e4) using the Heirloom theme palette
export const genderStyles: Record<Gender, string> = {
  male: "bg-[#f2f6fa] text-[#101d28] border-[#bbc8d7]", // primary-fixed tint
  female: "bg-[#fff5f0] text-[#341100] border-[#ffb692]", // tertiary-fixed tint
  other: "bg-[#f2f9f4] text-[#092011] border-[#b2cdb6]", // secondary-fixed tint
};

export const kindStyles: Record<MediaKind, string> = { image: "image", video: "video", audio: "audio" };
