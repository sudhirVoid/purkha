import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "./types";

/** Rewrite edges so any person→person edge from a partnered person is rerouted through their bond. */
export function reconcile(nodes: FamilyNode[], edges: Edge[]): Edge[] {
  const kindOf = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const partnerBond = new Map<string, string>();
  edges.forEach((edge) => {
    if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
      partnerBond.set(edge.source, edge.target);
    }
  });
  const seen = new Set<string>();
  const out: Edge[] = [];
  for (const edge of edges) {
    let src = edge.source;
    const tgt = edge.target;
    if (kindOf.get(src) === "person" && kindOf.get(tgt) === "person" && partnerBond.has(src)) {
      src = partnerBond.get(src)!;
    }
    const key = `${src}->${tgt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(src === edge.source ? edge : { ...edge, source: src });
  }
  return out;
}
