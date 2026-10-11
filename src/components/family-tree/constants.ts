import type { Gender, MediaKind } from "./types";

export const genderIcon: Record<Gender, string> = { male: "♂", female: "♀", other: "⚧" };
export const genderLabel: Record<Gender, string> = { male: "पुरुष", female: "महिला", other: "अन्य" };

// Refined PURKHA card surfaces — warm lokta cream with subtle gender accents
export const genderStyles: Record<Gender, string> = {
  male: "bg-[#FFFAF4] text-[#14295C] border-[#D4DFEE]",
  female: "bg-[#FFF9F6] text-[#8E1230] border-[#F2D6DC]",
  other: "bg-[#FDFBF7] text-[#4A4238] border-[#E4D3B4]",
};

export const kindStyles: Record<MediaKind, string> = { image: "image", video: "video", audio: "audio" };
