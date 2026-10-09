import { BaseEdge, type EdgeProps } from "@xyflow/react";
import { getLoveColor } from "../utils";
import type { ChildRelation } from "../types";

/** Dash patterns per child relation type (standard genogram conventions) */
const RELATION_DASH: Record<ChildRelation, string | undefined> = {
  biological: undefined,     // solid line
  adopted: "8 4",            // dashed line  ----  ----
  foster: "3 3",             // dotted line  ...
  step: "12 4 3 4",          // dash-dot     ----·----·
};

/**
 * Custom edge component for clean family-tree connectors.
 * Draws orthogonal paths with at most one horizontal-vertical bend
 * and smooth rounded corners — no zigzag routing.
 * 
 * Supports:
 * - Love-color matching (connector inherits bond node color)
 * - Child relation dash patterns (adopted=dashed, foster=dotted, step=dash-dot)
 */
export function FamilyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  id,
  style,
  markerEnd,
  markerStart,
  source,
  target,
  data,
}: EdgeProps) {
  const R = 12; // corner radius for rounded bends
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;

  let path: string;

  if (Math.abs(dx) < 1) {
    // Perfectly (or nearly) aligned vertically — straight line
    path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
  } else if (dy > 0) {
    // Normal top-to-bottom flow: drop halfway, go horizontal, drop to target
    const midY = sourceY + dy / 2;
    const absDx = Math.abs(dx);
    const absDyHalf = dy / 2;
    const r = Math.min(R, absDx / 2, absDyHalf / 2); // clamp radius to available space
    const sx = dx > 0 ? 1 : -1; // sign for horizontal direction

    path = [
      `M ${sourceX} ${sourceY}`,
      // Vertical drop from source to first bend
      `L ${sourceX} ${midY - r}`,
      // Rounded corner: turn horizontal
      `Q ${sourceX} ${midY} ${sourceX + sx * r} ${midY}`,
      // Horizontal segment
      `L ${targetX - sx * r} ${midY}`,
      // Rounded corner: turn vertical
      `Q ${targetX} ${midY} ${targetX} ${midY + r}`,
      // Vertical drop to target
      `L ${targetX} ${targetY}`,
    ].join(" ");
  } else {
    // Edge case: target is above or same level — use a simple bezier
    const midY = sourceY + dy / 2;
    path = `M ${sourceX} ${sourceY} C ${sourceX} ${midY}, ${targetX} ${midY}, ${targetX} ${targetY}`;
  }

  // Determine the bond ID for color matching
  const bondId = source.startsWith("bond-") ? source : target.startsWith("bond-") ? target : null;
  const color = bondId ? getLoveColor(bondId) : null;

  // Determine child relation for dash pattern
  const childRelation = ((data as any)?.childRelation as ChildRelation) || "biological";
  const dashArray = RELATION_DASH[childRelation];

  const computedStyle = {
    ...style,
    stroke: color ? color.connector : (style?.stroke || "currentColor"),
    strokeDasharray: dashArray,
    // Make non-biological lines slightly thinner for subtlety
    strokeWidth: childRelation !== "biological" ? 1.5 : (style?.strokeWidth || 2),
  };

  return (
    <BaseEdge
      id={id}
      path={path}
      style={computedStyle}
      markerEnd={markerEnd}
      markerStart={markerStart}
    />
  );
}
