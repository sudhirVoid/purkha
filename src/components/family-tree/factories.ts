import { MarkerType, type Edge } from "@xyflow/react";
import type { FamilyNode, Gender, BondStatus, ChildRelation } from "./types";

export const edgeBase: Partial<Edge> = {
  type: "familyEdge",
  style: { stroke: "#14295C", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "#14295C" },
};

export const mkEdge = (source: string, target: string, childRelation?: ChildRelation): Edge =>
  ({ id: `e-${source}-${target}-${Math.random().toString(36).slice(2, 6)}`, source, target, ...edgeBase, data: { childRelation: childRelation || "biological" } }) as Edge;

export const personNode = (
  id: string,
  x: number,
  y: number,
  label: string,
  gender: Gender = "other",
  isCollapsed?: boolean,
): FamilyNode => ({
  id,
  type: "family",
  position: { x, y },
  data: { label, kind: "person", gender, media: [], isCollapsed },
});

export const bondNode = (
  id: string,
  x: number,
  y: number,
  marriageDate?: string,
  bondStatus?: BondStatus,
  isCollapsed?: boolean,
): FamilyNode => ({
  id,
  type: "bond",
  position: { x, y },
  data: { label: "Love", kind: "bond", marriageDate, bondStatus: bondStatus || "married", isCollapsed },
});

let idCounter = 100;
export const nextId = () => `n${++idCounter}`;
