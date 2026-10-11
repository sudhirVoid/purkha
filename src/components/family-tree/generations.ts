import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "./types";

/**
 * Generation (पुस्ता) palette — each generation gets its own heritage tone so
 * the eye can follow a lineage at a glance. Tones are drawn from the PURKHA
 * brand (Himal, Sindoor, Sayapatri) and extended with Nepali landscape hues.
 */
export type GenerationTone = {
  /** Display name of the tone */
  name: string;
  /** Main accent colour (ribbons, edges, chips) */
  base: string;
  /** Darker shade for gradients / text on soft backgrounds */
  deep: string;
  /** Very light wash for chips and avatar fallbacks */
  soft: string;
  /** Readable text colour on top of `base` */
  ink: string;
};

export const GENERATION_TONES: GenerationTone[] = [
  { name: "Himal", base: "#14295C", deep: "#0B1A3D", soft: "#E3E9F7", ink: "#FFFFFF" },
  { name: "Sindoor", base: "#B3173A", deep: "#8E1230", soft: "#FBE4E8", ink: "#FFFFFF" },
  { name: "Sayapatri", base: "#D48F0B", deep: "#8A5A00", soft: "#FDF0D2", ink: "#2A1C00" },
  { name: "Rara", base: "#1F7A6D", deep: "#135449", soft: "#DDF1EC", ink: "#FFFFFF" },
  { name: "Tamba", base: "#B4531A", deep: "#86390C", soft: "#F9E6D9", ink: "#FFFFFF" },
  { name: "Jamuni", base: "#5B3A8C", deep: "#3E2563", soft: "#ECE5F6", ink: "#FFFFFF" },
];

export const toneFor = (generation: number | undefined): GenerationTone =>
  GENERATION_TONES[Math.max(0, generation ?? 0) % GENERATION_TONES.length];

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
export const toNepaliDigits = (n: number) => String(n).replace(/\d/g, (d) => NEPALI_DIGITS[Number(d)]);

/** Human label for a generation, e.g. "पुस्ता २". Generation index is 0-based. */
export const generationLabel = (generation: number) => `पुस्ता ${toNepaliDigits(generation + 1)}`;

/**
 * Computes a 0-based generation index for every person and bond.
 * - Blood descendants are one generation below their parents.
 * - Spouses share their partner's generation.
 * - The result is normalised so the eldest generation is 0.
 */
export function computeGenerations(nodes: FamilyNode[], edges: Edge[]): Map<string, number> {
  const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
  const partnersOf = new Map<string, string[]>();
  const parentBondOf = new Map<string, string>();
  const directParentsOf = new Map<string, string[]>();

  edges.forEach((e) => {
    const s = kindOf.get(e.source);
    const t = kindOf.get(e.target);
    if (s === "person" && t === "bond") partnersOf.set(e.target, [...(partnersOf.get(e.target) ?? []), e.source]);
    else if (s === "bond" && t === "person") parentBondOf.set(e.target, e.source);
    else if (s === "person" && t === "person") directParentsOf.set(e.target, [...(directParentsOf.get(e.target) ?? []), e.source]);
  });

  const parentsOf = (id: string) => {
    const bond = parentBondOf.get(id);
    return bond ? partnersOf.get(bond) ?? [] : directParentsOf.get(id) ?? [];
  };

  const persons = nodes.filter((n) => n.data.kind === "person").map((n) => n.id);
  const gen = new Map<string, number>();
  const visiting = new Set<string>();
  const compute = (id: string): number => {
    if (gen.has(id)) return gen.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const parents = parentsOf(id);
    const g = parents.length ? Math.max(...parents.map(compute)) + 1 : 0;
    visiting.delete(id);
    gen.set(id, g);
    return g;
  };
  persons.forEach(compute);

  // Fix-point: partners share a generation, children sit below their parents.
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 64) {
    changed = false;
    partnersOf.forEach((parts) => {
      if (parts.length < 2) return;
      const max = Math.max(...parts.map((p) => gen.get(p) ?? 0));
      parts.forEach((p) => {
        if ((gen.get(p) ?? 0) < max) {
          gen.set(p, max);
          changed = true;
        }
      });
    });
    persons.forEach((p) => {
      const parents = parentsOf(p);
      if (!parents.length) return;
      const min = Math.max(...parents.map((q) => gen.get(q) ?? 0)) + 1;
      if ((gen.get(p) ?? 0) < min) {
        gen.set(p, min);
        changed = true;
      }
    });
  }

  partnersOf.forEach((parts, bondId) => {
    gen.set(bondId, parts.length ? Math.max(...parts.map((p) => gen.get(p) ?? 0)) : 0);
  });

  const values = [...gen.values()];
  const min = values.length ? Math.min(...values) : 0;
  if (min !== 0) gen.forEach((v, k) => gen.set(k, v - min));
  return gen;
}
