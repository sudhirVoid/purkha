import type { Edge } from "@xyflow/react";
import type { FamilyNode } from "./types";
import { computeGenerations } from "./generations";

// ── Sizing & Spacing Constants ──────────────────────────────────────────
export const NODE_W = 260; // Fixed width of PersonNode card
export const NODE_H = 112; // Typical height of PersonNode card
export const BOND_W = 84;  // Width of BondNode
export const BOND_H = 72;  // Height of BondNode
export const SIBLING_GAP = 54; // Horizontal gap between adjacent siblings
export const BOND_PADDING = 32; // Horizontal padding between partner and bond node
export const LEVEL_H = 290; // Vertical step between generations
export const BOND_DY = 82;  // Vertical offset of bond node below partner tops
export const ROOT_GAP = 80; // Gap between distinct root trees

/**
 * Hierarchical Subtree Bounding-Box Layout Algorithm.
 *
 * Core Architectural Principles:
 * 1. Stack of Horizontal Rectangles (Generation Strata):
 *    - Each generation g sits in a discrete horizontal band (rectangle) at y = g * LEVEL_H.
 *    - All nodes of the same level (e.g. husband, wife, unmarried siblings) share that generation rectangle.
 *    - Offspring extending from an upper node strictly drop into the next lower rectangle (g + 1).
 *    - Marriage bonds sit in the vertical transition layer (y = g * LEVEL_H + BOND_DY).
 *
 * 2. Subtree Bounding-Box Invariant:
 *    - The horizontal area allocated to a couple depends on all children lower than them:
 *      W(unit) = max(W_couple, sum(W_children) + gaps).
 *    - The couple is centered as a united block within [L, L + W(unit)].
 *    - All children and their descendant subtrees are partitioned strictly inside [L, L + W(unit)].
 *    - Children from one couple NEVER leave their parents' boundary or show on the other side.
 */
export function autoLayout(nodes: FamilyNode[], edges: Edge[]): FamilyNode[] {
  if (nodes.length === 0) return [];

  const kindOf = new Map(nodes.map((node) => [node.id, node.data.kind]));
  const partnersOf = new Map<string, string[]>();
  const parentBondOf = new Map<string, string>();
  const childrenOfBond = new Map<string, string[]>();
  const directChildrenOf = new Map<string, string[]>();
  const bondsOfPerson = new Map<string, string[]>();

  edges.forEach((edge) => {
    const sKind = kindOf.get(edge.source);
    const tKind = kindOf.get(edge.target);
    if (sKind === "person" && tKind === "bond") {
      partnersOf.set(edge.target, [...(partnersOf.get(edge.target) || []), edge.source]);
      bondsOfPerson.set(edge.source, [...(bondsOfPerson.get(edge.source) || []), edge.target]);
    } else if (sKind === "bond" && tKind === "person") {
      parentBondOf.set(edge.target, edge.source);
      childrenOfBond.set(edge.source, [...(childrenOfBond.get(edge.source) || []), edge.target]);
    } else if (sKind === "person" && tKind === "person") {
      directChildrenOf.set(edge.source, [...(directChildrenOf.get(edge.source) || []), edge.target]);
    }
  });

  const persons = nodes.filter((n) => n.data.kind === "person").map((n) => n.id);
  const bonds = nodes.filter((n) => n.data.kind === "bond").map((n) => n.id);

  // ── 1. Generation Level Computation ─────────────────────────────────
  const level = computeGenerations(nodes, edges);

  const byLevel = new Map<number, string[]>();
  persons.forEach((pId) => {
    const lvl = level.get(pId) ?? 0;
    byLevel.set(lvl, [...(byLevel.get(lvl) || []), pId]);
  });

  // ── 2. Build Discrete Family Unit Subtrees ──────────────────────────
  type FamilyUnit = {
    id: string; // anchor person id
    members: string[]; // ordered person IDs (spouses and anchor)
    bonds: string[]; // intermediate bonds between adjacent members
    children: FamilyUnit[]; // recursive child units
    lvl: number;
  };

  const assignedPersons = new Set<string>();
  const assignedBonds = new Set<string>();

  function buildUnit(personId: string): FamilyUnit {
    assignedPersons.add(personId);
    const myBonds = bondsOfPerson.get(personId) || [];
    const spouses: string[] = [];
    const unitBonds: string[] = [];

    myBonds.forEach((bId) => {
      assignedBonds.add(bId);
      unitBonds.push(bId);
      (partnersOf.get(bId) || []).forEach((partId) => {
        if (partId !== personId && !spouses.includes(partId)) {
          spouses.push(partId);
          assignedPersons.add(partId);
        }
      });
    });

    // Symmetrical arrangement: place spouses evenly around the anchor person
    const half = Math.floor(spouses.length / 2);
    const members = [...spouses.slice(0, half), personId, ...spouses.slice(half)];

    // Order intermediate bonds to sit between adjacent members
    const orderedBonds: string[] = [];
    for (let i = 0; i < members.length - 1; i++) {
      const p1 = members[i];
      const p2 = members[i + 1];
      const matchBond = unitBonds.find((bId) => {
        const parts = partnersOf.get(bId) || [];
        return parts.includes(p1) && parts.includes(p2);
      });
      if (matchBond) {
        orderedBonds.push(matchBond);
      } else if (unitBonds[i]) {
        orderedBonds.push(unitBonds[i]);
      }
    }

    // Collect all children born from this unit's bonds and direct parent ties
    const childIds: string[] = [];
    // Prioritize bond order so children appear under their respective mother/father's side
    orderedBonds.forEach((bId) => {
      (childrenOfBond.get(bId) || []).forEach((k) => {
        if (!childIds.includes(k)) childIds.push(k);
      });
    });
    unitBonds.forEach((bId) => {
      (childrenOfBond.get(bId) || []).forEach((k) => {
        if (!childIds.includes(k)) childIds.push(k);
      });
    });
    (directChildrenOf.get(personId) || []).forEach((k) => {
      if (!childIds.includes(k)) childIds.push(k);
    });

    // Recursively build child units
    const childrenUnits: FamilyUnit[] = [];
    childIds.forEach((cId) => {
      if (!assignedPersons.has(cId)) {
        childrenUnits.push(buildUnit(cId));
      }
    });

    return {
      id: personId,
      members,
      bonds: orderedBonds,
      children: childrenUnits,
      lvl: level.get(personId) ?? 0,
    };
  }

  // Identify root units (persons without parents in tree)
  const roots: FamilyUnit[] = [];
  persons.forEach((pId) => {
    const hasParentBond = parentBondOf.has(pId);
    let hasDirectParent = false;
    edges.forEach((e) => {
      if (e.target === pId && kindOf.get(e.source) === "person") hasDirectParent = true;
    });

    if (!hasParentBond && !hasDirectParent && !assignedPersons.has(pId)) {
      roots.push(buildUnit(pId));
    }
  });

  // Catch any remaining unassigned persons
  persons.forEach((pId) => {
    if (!assignedPersons.has(pId)) {
      roots.push(buildUnit(pId));
    }
  });

  // ── 3. Bottom-Up Subtree Width Calculation ──────────────────────────
  // The area covered by a couple depends strictly on all children lower than them
  const unitWidthMap = new Map<string, number>();

  function calculateUnitWidth(unit: FamilyUnit): number {
    const coupleCardsW =
      unit.members.length * NODE_W + unit.bonds.length * (BOND_PADDING * 2 + BOND_W);

    if (unit.children.length === 0) {
      unitWidthMap.set(unit.id, coupleCardsW);
      return coupleCardsW;
    }

    const childWidths = unit.children.map(calculateUnitWidth);
    const totalKidsW =
      childWidths.reduce((sum, w) => sum + w, 0) + (unit.children.length - 1) * SIBLING_GAP;

    // Subtree boundary expands to cover all children lower than them
    const finalW = Math.max(coupleCardsW, totalKidsW);
    unitWidthMap.set(unit.id, finalW);
    return finalW;
  }

  roots.forEach(calculateUnitWidth);

  // ── 4. Top-Down Recursive Bounding-Box Placement ────────────────────
  const positions = new Map<string, { x: number; y: number }>();

  function placeUnit(unit: FamilyUnit, leftX: number, curLvl: number) {
    const allocatedW = unitWidthMap.get(unit.id) ?? calculateUnitWidth(unit);
    const center = leftX + allocatedW / 2;
    const y = curLvl * LEVEL_H; // Horizontal rectangle row for this generation

    // Place the couple united as a block centered over the boundary
    const coupleCardsW =
      unit.members.length * NODE_W + unit.bonds.length * (BOND_PADDING * 2 + BOND_W);
    const coupleStartX = Math.round(center - coupleCardsW / 2);

    let curX = coupleStartX;
    unit.members.forEach((mId, idx) => {
      positions.set(mId, { x: curX, y });
      curX += NODE_W;
      if (idx < unit.bonds.length) {
        const bId = unit.bonds[idx];
        positions.set(bId, {
          x: curX + BOND_PADDING,
          y: y + BOND_DY,
        });
        curX += BOND_PADDING * 2 + BOND_W;
      }
    });

    // Place all children inside [leftX, leftX + allocatedW] at row (curLvl + 1)
    if (unit.children.length > 0) {
      const childWidths = unit.children.map((c) => unitWidthMap.get(c.id)!);
      const totalKidsW =
        childWidths.reduce((sum, w) => sum + w, 0) + (unit.children.length - 1) * SIBLING_GAP;

      const childrenStartX = Math.round(center - totalKidsW / 2);
      let childCursorX = childrenStartX;

      unit.children.forEach((childUnit) => {
        const childW = unitWidthMap.get(childUnit.id)!;
        // Recursively layout child inside their strictly bounded sub-interval
        placeUnit(childUnit, childCursorX, curLvl + 1);
        childCursorX += childW + SIBLING_GAP;
      });
    }
  }

  let rootCursorX = 60;
  roots.forEach((rootUnit) => {
    placeUnit(rootUnit, rootCursorX, rootUnit.lvl);
    rootCursorX += unitWidthMap.get(rootUnit.id)! + ROOT_GAP;
  });

  // Re-center all bonds accurately between partners
  const updateBondPositions = () => {
    bonds.forEach((bondId) => {
      const parts = partnersOf.get(bondId) || [];
      const pts = parts.map((partId) => positions.get(partId)).filter(Boolean) as { x: number; y: number }[];
      if (pts.length >= 2) {
        const centers = pts.map((pt) => pt.x + NODE_W / 2);
        const minCenter = Math.min(...centers);
        const maxCenter = Math.max(...centers);
        const midCenter = (minCenter + maxCenter) / 2;
        const maxY = Math.max(...pts.map((pt) => pt.y));

        positions.set(bondId, {
          x: Math.round(midCenter - BOND_W / 2),
          y: maxY + BOND_DY,
        });
      } else if (pts.length === 1) {
        const pt = pts[0];
        positions.set(bondId, {
          x: Math.round(pt.x + NODE_W / 2 - BOND_W / 2),
          y: pt.y + BOND_DY,
        });
      }
    });
  };

  updateBondPositions();

  // ── 5. Sweep-Line Safety Net (Row-by-Row Collision Guard) ───────────
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);
  sortedLevels.forEach((lvl) => {
    const personsOnLevel = (byLevel.get(lvl) || []).filter((pId) => positions.has(pId));
    if (personsOnLevel.length < 2) return;

    personsOnLevel.sort((a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0));

    for (let i = 1; i < personsOnLevel.length; i++) {
      const prevId = personsOnLevel[i - 1];
      const currId = personsOnLevel[i];
      const prevX = positions.get(prevId)!.x;
      const currX = positions.get(currId)!.x;

      const sharedBond = (bondsOfPerson.get(prevId) || []).find((bId) =>
        (partnersOf.get(bId) || []).includes(currId),
      );

      const requiredGap = sharedBond ? BOND_PADDING * 2 + BOND_W : SIBLING_GAP;
      const minRequiredX = prevX + NODE_W + requiredGap;

      if (currX < minRequiredX) {
        const shift = minRequiredX - currX;
        for (let j = i; j < personsOnLevel.length; j++) {
          const shiftId = personsOnLevel[j];
          const curPos = positions.get(shiftId)!;
          positions.set(shiftId, { x: curPos.x + shift, y: curPos.y });

          const shiftDescendants = (rootP: string) => {
            const myBonds = bondsOfPerson.get(rootP) || [];
            myBonds.forEach((bId) => {
              (partnersOf.get(bId) || []).forEach((partId) => {
                if (partId !== rootP && (level.get(partId) ?? 0) === (level.get(rootP) ?? 0)) {
                  const partPos = positions.get(partId);
                  if (partPos) {
                    positions.set(partId, { x: partPos.x + shift, y: partPos.y });
                  }
                }
              });
              (childrenOfBond.get(bId) || []).forEach((cId) => {
                const cPos = positions.get(cId);
                if (cPos) {
                  positions.set(cId, { x: cPos.x + shift, y: cPos.y });
                  shiftDescendants(cId);
                }
              });
            });
            (directChildrenOf.get(rootP) || []).forEach((cId) => {
              const cPos = positions.get(cId);
              if (cPos) {
                positions.set(cId, { x: cPos.x + shift, y: cPos.y });
                shiftDescendants(cId);
              }
            });
          };
          shiftDescendants(shiftId);
        }
      }
    }
  });

  updateBondPositions();

  // ── 6. Normalize Coordinates to Comfortable Margins ─────────────────
  const allPos = [...positions.values()];
  const minX = allPos.length ? Math.min(...allPos.map((p) => p.x)) : 0;
  const minY = allPos.length ? Math.min(...allPos.map((p) => p.y)) : 0;

  const targetMarginX = 60;
  const targetMarginY = 60;
  const deltaX = targetMarginX - minX;
  const deltaY = targetMarginY - minY;

  nodes.forEach((node) => {
    if (positions.has(node.id)) {
      const p = positions.get(node.id)!;
      positions.set(node.id, { x: p.x + deltaX, y: p.y + deltaY });
    } else {
      positions.set(node.id, { x: targetMarginX, y: targetMarginY });
    }
  });

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id)!,
  }));
}
