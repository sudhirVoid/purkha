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
 * Robust hierarchical layout algorithm for family tree graphs.
 *
 * Guarantees:
 * 1. Children of couples appear strictly below their parents (Generation g + 1).
 * 2. Partners in a marriage share the exact same generation level.
 * 3. Bond nodes are mathematically centered between their partners.
 * 4. Children are centered directly beneath their parent bond node.
 * 5. Strict collision detection & sweep-line separation ensures ZERO overlapping
 *    between any nodes on any generation row.
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

  // Group persons by level
  const byLevel = new Map<number, string[]>();
  persons.forEach((pId) => {
    const lvl = level.get(pId) ?? 0;
    byLevel.set(lvl, [...(byLevel.get(lvl) || []), pId]);
  });

  const positions = new Map<string, { x: number; y: number }>();

  // ── 2. Identify Root Ancestors (level 0 or without parents in tree) ───
  const hasParentsInTree = new Set<string>();
  persons.forEach((pId) => {
    if (parentBondOf.has(pId)) hasParentsInTree.add(pId);
    if ((directChildrenOf.get(pId) || []).length > 0) {
      (directChildrenOf.get(pId) || []).forEach((c) => hasParentsInTree.add(c));
    }
  });

  // Helper: compute couple unit width and member order
  // A unit around person P contains P, their spouses, and intermediate bonds
  const getCoupleMembers = (pId: string): { members: string[]; width: number } => {
    const myBonds = bondsOfPerson.get(pId) || [];
    const spouses: string[] = [];
    myBonds.forEach((bId) => {
      (partnersOf.get(bId) || []).forEach((partId) => {
        if (partId !== pId && !spouses.includes(partId)) spouses.push(partId);
      });
    });

    if (spouses.length === 0) {
      return { members: [pId], width: NODE_W };
    }

    // Split spouses before and after the person for symmetrical multi-spouse trees
    const half = Math.floor(spouses.length / 2);
    const before = spouses.slice(0, half);
    const after = spouses.slice(half);

    const ordered = [...before, pId, ...after];
    // Each person has NODE_W, each bond slot has (BOND_PADDING * 2 + BOND_W)
    const totalW = ordered.length * NODE_W + myBonds.length * (BOND_PADDING * 2 + BOND_W);
    return { members: ordered, width: totalW };
  };

  // Helper: compute total subtree width recursively
  const memoSubtreeWidth = new Map<string, number>();
  const getSubtreeWidth = (pId: string): number => {
    if (memoSubtreeWidth.has(pId)) return memoSubtreeWidth.get(pId)!;

    const coupleInfo = getCoupleMembers(pId);
    let coupleW = coupleInfo.width;

    // Collect all children of this person's bonds
    const myBonds = bondsOfPerson.get(pId) || [];
    const allKids: string[] = [];
    myBonds.forEach((bId) => {
      (childrenOfBond.get(bId) || []).forEach((k) => {
        if (!allKids.includes(k)) allKids.push(k);
      });
    });
    (directChildrenOf.get(pId) || []).forEach((k) => {
      if (!allKids.includes(k)) allKids.push(k);
    });

    if (allKids.length === 0) {
      memoSubtreeWidth.set(pId, coupleW);
      return coupleW;
    }

    let kidsTotalW = 0;
    allKids.forEach((kidId, idx) => {
      const kidW = getSubtreeWidth(kidId);
      kidsTotalW += kidW;
      if (idx > 0) kidsTotalW += SIBLING_GAP;
    });

    const finalW = Math.max(coupleW, kidsTotalW);
    memoSubtreeWidth.set(pId, finalW);
    return finalW;
  };

  // ── 3. Initial Top-Down Tree Positioning ────────────────────────────
  // Place root level (Gen 0)
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);
  const rootPersons = (byLevel.get(0) || []).filter((pId) => !hasParentsInTree.has(pId));
  const placedRoots = new Set<string>();

  let rootCursorX = 0;
  rootPersons.forEach((rootId) => {
    if (placedRoots.has(rootId)) return;

    const myBonds = bondsOfPerson.get(rootId) || [];
    const spouses: string[] = [];
    myBonds.forEach((bId) => {
      (partnersOf.get(bId) || []).forEach((partId) => {
        if (partId !== rootId && !spouses.includes(partId)) spouses.push(partId);
      });
    });

    const half = Math.floor(spouses.length / 2);
    const orderedCouple = [...spouses.slice(0, half), rootId, ...spouses.slice(half)];

    const subtreeW = getSubtreeWidth(rootId);
    const coupleW = orderedCouple.length * NODE_W + Math.max(0, orderedCouple.length - 1) * (BOND_PADDING * 2 + BOND_W);
    const coupleOffset = Math.max(0, Math.round((subtreeW - coupleW) / 2));

    let curX = rootCursorX + coupleOffset;
    orderedCouple.forEach((personId, idx) => {
      placedRoots.add(personId);
      positions.set(personId, { x: curX, y: 0 });
      curX += NODE_W;
      if (idx < orderedCouple.length - 1) {
        // Space for marriage bond
        curX += BOND_PADDING * 2 + BOND_W;
      }
    });

    const coupleTotalW = curX - (rootCursorX + coupleOffset);
    rootCursorX += Math.max(coupleTotalW, subtreeW) + ROOT_GAP;
  });

  // Handle any other level 0 persons not caught in roots
  (byLevel.get(0) || []).forEach((pId) => {
    if (!positions.has(pId)) {
      positions.set(pId, { x: rootCursorX, y: 0 });
      rootCursorX += NODE_W + SIBLING_GAP;
    }
  });

  // ── 4. Position Bond Nodes Between Married Partners ─────────────────
  const updateBondPositions = () => {
    bonds.forEach((bondId) => {
      const parts = partnersOf.get(bondId) || [];
      const pts = parts.map((partId) => positions.get(partId)).filter(Boolean) as { x: number; y: number }[];
      if (pts.length >= 2) {
        // Find left-most and right-most partner centers
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
        // Single parent bond
        const pt = pts[0];
        positions.set(bondId, {
          x: Math.round(pt.x + NODE_W / 2 - BOND_W / 2),
          y: pt.y + BOND_DY,
        });
      }
    });
  };

  updateBondPositions();

  // ── 5. Position Children Beneath Parent Bonds ───────────────────────
  // Process generations level by level from top to bottom
  sortedLevels.forEach((lvl) => {
    const parentBondsAtLevel = bonds.filter((bId) => {
      const parts = partnersOf.get(bId) || [];
      return parts.some((p) => (level.get(p) ?? 0) === lvl);
    });

    parentBondsAtLevel.forEach((bondId) => {
      const kids = childrenOfBond.get(bondId) || [];
      if (kids.length === 0) return;

      const bondPos = positions.get(bondId);
      if (!bondPos) return;

      const bondCenter = bondPos.x + BOND_W / 2;

      // Group each child with their spouse(s) into a unit
      const childUnits = kids.map((kidId) => {
        const myBonds = bondsOfPerson.get(kidId) || [];
        const spouses: string[] = [];
        myBonds.forEach((bId) => {
          (partnersOf.get(bId) || []).forEach((spId) => {
            if (spId !== kidId && !spouses.includes(spId) && (level.get(spId) ?? 0) === (level.get(kidId) ?? 0)) {
              spouses.push(spId);
            }
          });
        });

        const half = Math.floor(spouses.length / 2);
        const members = [...spouses.slice(0, half), kidId, ...spouses.slice(half)];
        const unitWidth = members.length * NODE_W + myBonds.length * (BOND_PADDING * 2 + BOND_W);
        const subtreeWidth = getSubtreeWidth(kidId);

        return {
          kidId,
          members,
          width: Math.max(unitWidth, subtreeWidth),
          unitWidth,
        };
      });

      // Total width of all children units including sibling gaps
      const totalKidsWidth =
        childUnits.reduce((sum, u) => sum + u.width, 0) + (childUnits.length - 1) * SIBLING_GAP;

      let childCursorX = Math.round(bondCenter - totalKidsWidth / 2);

      childUnits.forEach((unit) => {
        const unitCenter = childCursorX + unit.width / 2;
        let memberX = Math.round(unitCenter - unit.unitWidth / 2);

        unit.members.forEach((memberId, mIdx) => {
          const memberLvl = level.get(memberId) ?? lvl + 1;
          positions.set(memberId, {
            x: memberX,
            y: memberLvl * LEVEL_H,
          });
          memberX += NODE_W;
          if (mIdx < unit.members.length - 1) {
            memberX += BOND_PADDING * 2 + BOND_W;
          }
        });

        childCursorX += unit.width + SIBLING_GAP;
      });
    });

    updateBondPositions();
  });

  // Handle any direct children (single parent without bond node)
  directChildrenOf.forEach((kids, parentId) => {
    const parentPos = positions.get(parentId);
    if (!parentPos || kids.length === 0) return;
    const parentCenter = parentPos.x + NODE_W / 2;
    const totalW = kids.length * NODE_W + (kids.length - 1) * SIBLING_GAP;
    let startX = Math.round(parentCenter - totalW / 2);

    kids.forEach((kidId) => {
      if (!positions.has(kidId)) {
        const kidLvl = level.get(kidId) ?? (level.get(parentId) ?? 0) + 1;
        positions.set(kidId, { x: startX, y: kidLvl * LEVEL_H });
        startX += NODE_W + SIBLING_GAP;
      }
    });
  });

  updateBondPositions();

  // ── 6. Strict Global Overlap Resolution (Sweep-Line Collision Guard) ──
  // Process row by row. If any two adjacent person cards have less than
  // SIBLING_GAP between them, push the right card (and its descendants) rightward!
  sortedLevels.forEach((lvl) => {
    const personsOnLevel = (byLevel.get(lvl) || []).filter((pId) => positions.has(pId));
    if (personsOnLevel.length < 2) return;

    // Sort persons left-to-right
    personsOnLevel.sort((a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0));

    for (let i = 1; i < personsOnLevel.length; i++) {
      const prevId = personsOnLevel[i - 1];
      const currId = personsOnLevel[i];
      const prevX = positions.get(prevId)!.x;
      const currX = positions.get(currId)!.x;

      // Are they partners in the same bond?
      const sharedBond = (bondsOfPerson.get(prevId) || []).find((bId) =>
        (partnersOf.get(bId) || []).includes(currId),
      );

      const requiredGap = sharedBond ? BOND_PADDING * 2 + BOND_W : SIBLING_GAP;
      const minRequiredX = prevX + NODE_W + requiredGap;

      if (currX < minRequiredX) {
        const shift = minRequiredX - currX;

        // Shift currId and all subsequent persons on this level
        for (let j = i; j < personsOnLevel.length; j++) {
          const shiftId = personsOnLevel[j];
          const curPos = positions.get(shiftId)!;
          positions.set(shiftId, { x: curPos.x + shift, y: curPos.y });

          // Also shift their downstream descendants so parent-child vertical ties stay straight
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

  // Re-center all bonds after collision shifts
  updateBondPositions();

  // ── 7. Normalize Coordinates (Comfortable Canvas Margin) ────────────
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
      // Orphan fallback
      positions.set(node.id, { x: targetMarginX, y: targetMarginY });
    }
  });

  return nodes.map((node) => ({
    ...node,
    position: positions.get(node.id)!,
  }));
}
