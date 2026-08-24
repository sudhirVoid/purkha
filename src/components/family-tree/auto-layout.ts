import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "./types";

/**
 * Pure layout algorithm for family tree graphs.
 *
 * Accepts flat arrays of nodes and edges, returns the same nodes
 * with their `position` fields updated so the tree is laid out
 * top-to-bottom with no overlapping.
 *
 * No React or DOM dependencies — fully testable in isolation.
 */
export function autoLayout(nodes: FamilyNode[], edges: Edge[]): FamilyNode[] {
  const kindOf = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const partnersOf = new Map<string, string[]>();
  const parentBondOf = new Map<string, string>();
  const childrenOfBond = new Map<string, string[]>();
  const directChildrenOf = new Map<string, string[]>();
  edges.forEach((edge) => {
    const sourceKind = kindOf.get(edge.source);
    const targetKind = kindOf.get(edge.target);
    if (sourceKind === "person" && targetKind === "bond") {
      partnersOf.set(edge.target, [...(partnersOf.get(edge.target) || []), edge.source]);
    } else if (sourceKind === "bond" && targetKind === "person") {
      parentBondOf.set(edge.target, edge.source);
      childrenOfBond.set(edge.source, [...(childrenOfBond.get(edge.source) || []), edge.target]);
    } else if (sourceKind === "person" && targetKind === "person") {
      directChildrenOf.set(edge.source, [...(directChildrenOf.get(edge.source) || []), edge.target]);
    }
  });

  const persons = nodes.filter((node) => node.data.kind === "person").map((node) => node.id);
  const bonds = nodes.filter((node) => node.data.kind === "bond").map((node) => node.id);

  // ── Level computation ──────────────────────────────────────────────
  const level = new Map<string, number>();
  const compute = (id: string, seen: Set<string>): number => {
    if (level.has(id)) return level.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    let lvl = 0;
    if (parentBondOf.has(id)) {
      const bond = parentBondOf.get(id)!;
      const parts = partnersOf.get(bond) || [];
      if (parts.length) lvl = Math.max(...parts.map((partnerId) => compute(partnerId, seen))) + 1;
    } else {
      const dp = persons.filter((personId) => (directChildrenOf.get(personId) || []).includes(id));
      if (dp.length) lvl = Math.max(...dp.map((personId) => compute(personId, seen))) + 1;
    }
    level.set(id, lvl);
    return lvl;
  };
  persons.forEach((personId) => compute(personId, new Set()));

  // Ensure partners in a bond share the same level (max of all partners).
  let changed = true;
  while (changed) {
    changed = false;
    bonds.forEach((bondId) => {
      const parts = partnersOf.get(bondId) || [];
      if (parts.length < 2) return;
      const maxLvl = Math.max(...parts.map((partnerId) => level.get(partnerId) ?? 0));
      parts.forEach((partnerId) => {
        if ((level.get(partnerId) ?? 0) < maxLvl) {
          level.set(partnerId, maxLvl);
          changed = true;
        }
      });
    });
  }

  // ── Sizing constants ───────────────────────────────────────────────
  const LEVEL_H = 260;
  const NODE_GAP = 50;
  const NODE_W = 230;
  const BOND_W = 100;
  const BOND_DY = 110;

  // ── Initial person positioning by level ────────────────────────────
  const byLevel = new Map<number, string[]>();
  persons.forEach((personId) => {
    const lvl = level.get(personId) ?? 0;
    byLevel.set(lvl, [...(byLevel.get(lvl) || []), personId]);
  });

  const positions = new Map<string, { x: number; y: number }>();
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);

  sortedLevels.forEach((lvl) => {
    const pool = byLevel.get(lvl)!;
    const parentX = (id: string) => {
      const bondId = parentBondOf.get(id);
      if (!bondId) return 0;
      const parts = partnersOf.get(bondId) || [];
      const px = parts.map((partnerId) => positions.get(partnerId)?.x ?? 0);
      return px.length ? px.reduce((sum, val) => sum + val, 0) / px.length : 0;
    };
    const sorted = [...pool].sort((a, b) => parentX(a) - parentX(b));

    const ordered: string[] = [];
    const placed = new Set<string>();
    sorted.forEach((personId) => {
      if (placed.has(personId)) return;
      ordered.push(personId);
      placed.add(personId);
      const partnerBonds = bonds.filter((bondId) => (partnersOf.get(bondId) || []).includes(personId));
      partnerBonds.forEach((bondId) => {
        (partnersOf.get(bondId) || []).forEach((otherPartnerId) => {
          if (!placed.has(otherPartnerId) && level.get(otherPartnerId) === lvl) {
            ordered.push(otherPartnerId);
            placed.add(otherPartnerId);
          }
        });
      });
    });

    const step = NODE_W + NODE_GAP;
    const totalW = (ordered.length - 1) * step;
    ordered.forEach((id, i) => {
      positions.set(id, { x: i * step - totalW / 2, y: lvl * LEVEL_H });
    });
  });

  // ── Position bond nodes between partners ───────────────────────────
  bonds.forEach((bondId) => {
    const parts = partnersOf.get(bondId) || [];
    const pts = parts.map((partnerId) => positions.get(partnerId)).filter(Boolean) as { x: number; y: number }[];
    if (pts.length) {
      const avgX = pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((pt) => pt.y));
      positions.set(bondId, { x: avgX, y: maxY + BOND_DY });
    }
  });

  // ── Position children under their parent bond ──────────────────────
  childrenOfBond.forEach((kids, bondId) => {
    const bondPos = positions.get(bondId);
    if (!bondPos) return;
    const step = NODE_W + NODE_GAP;

    // Group kids and their spouses into units
    const units = kids.map((kidId) => {
      const spouseBonds = bonds.filter((bId) => (partnersOf.get(bId) || []).includes(kidId));
      const spouses = spouseBonds
        .flatMap((bId) => partnersOf.get(bId) || [])
        .filter((spouseId) => spouseId !== kidId && level.get(spouseId) === level.get(kidId));

      const allMembers = [kidId, ...spouses].sort(
        (a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0),
      );

      return {
        members: allMembers,
        width: allMembers.length * step,
      };
    });

    units.sort((a, b) => {
      const avgA = a.members.reduce((sum, memberId) => sum + (positions.get(memberId)?.x ?? 0), 0) / a.members.length;
      const avgB = b.members.reduce((sum, memberId) => sum + (positions.get(memberId)?.x ?? 0), 0) / b.members.length;
      return avgA - avgB;
    });

    const totalWidth = units.reduce((sum, unit) => sum + unit.width, 0);
    let startX = bondPos.x - totalWidth / 2;

    units.forEach((unit) => {
      unit.members.forEach((memberId, i) => {
        const cur = positions.get(memberId);
        positions.set(memberId, {
          x: startX + i * step + step / 2,
          y: cur?.y ?? bondPos.y + LEVEL_H - BOND_DY,
        });
      });
      startX += unit.width;
    });
  });

  // Re-adjust bonds after children and their spouses have been moved
  bonds.forEach((bondId) => {
    const parts = partnersOf.get(bondId) || [];
    const pts = parts.map((partnerId) => positions.get(partnerId)).filter(Boolean) as { x: number; y: number }[];
    if (pts.length) {
      const avgX = pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((pt) => pt.y));
      positions.set(bondId, { x: avgX, y: maxY + BOND_DY });
    }
  });

  // ── Global overlap resolution ──────────────────────────────────────
  // Group ALL positioned nodes (persons + bonds) by their Y-band and
  // push apart any that overlap horizontally.
  const allPositioned = [...positions.entries()].map(([id, pos]) => ({ id, ...pos }));

  // Group by approximate Y (within 80px = same visual row)
  const yBands = new Map<number, { id: string; x: number; y: number }[]>();
  allPositioned.forEach((item) => {
    const bandKey = Math.round(item.y / 80) * 80;
    yBands.set(bandKey, [...(yBands.get(bandKey) || []), item]);
  });

  yBands.forEach((band) => {
    if (band.length < 2) return;
    band.sort((a, b) => a.x - b.x);

    for (let i = 1; i < band.length; i++) {
      const prev = band[i - 1];
      const curr = band[i];
      const prevW = kindOf.get(prev.id) === "bond" ? BOND_W : NODE_W;
      const minGap = (prevW + NODE_W) / 2 + NODE_GAP;
      const actualGap = curr.x - prev.x;
      if (actualGap < minGap) {
        const shift = minGap - actualGap;
        for (let j = i; j < band.length; j++) {
          band[j].x += shift;
          positions.set(band[j].id, { x: band[j].x, y: band[j].y });
        }
      }
    }

    const minX = band[0].x;
    const maxX = band[band.length - 1].x;
    const centerOffset = (minX + maxX) / 2;
    if (Math.abs(centerOffset) > NODE_W) {
      const shift = centerOffset / 2;
      band.forEach((item) => {
        item.x -= shift;
        positions.set(item.id, { x: item.x, y: item.y });
      });
    }
  });

  // Final bond re-center after overlap resolution moved person nodes
  bonds.forEach((bondId) => {
    const parts = partnersOf.get(bondId) || [];
    const pts = parts.map((partnerId) => positions.get(partnerId)).filter(Boolean) as { x: number; y: number }[];
    if (pts.length) {
      const avgX = pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((pt) => pt.y));
      positions.set(bondId, { x: avgX, y: maxY + BOND_DY });
    }
  });

  // ── Orphan fallback ────────────────────────────────────────────────
  let orphanY = 0;
  nodes.forEach((node) => {
    if (!positions.has(node.id)) {
      positions.set(node.id, { x: -400, y: orphanY });
      orphanY += 120;
    }
  });

  return nodes.map((node) => ({ ...node, position: positions.get(node.id)! }));
}
