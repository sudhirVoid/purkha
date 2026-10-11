import React, { useState, useMemo } from "react";
import { Calendar, User, ArrowRight, ChevronDown, ChevronRight, MapPin, FileText } from "lucide-react";
import type { FamilyNode } from "../types";
import type { Edge } from "@xyflow/react";
import { toneFor, generationLabel } from "../generations";
import { genderIcon } from "../constants";

type TreeViewProps = {
  nodes: FamilyNode[];
  edges: Edge[];
};

type TreeContext = {
  nodeMap: Map<string, FamilyNode>;
  personToBonds: Map<string, string[]>;
  bondToPartners: Map<string, string[]>;
  bondToChildren: Map<string, string[]>;
};

export function TreeView({ nodes, edges }: TreeViewProps) {
  const { roots, context } = useMemo(() => {
    const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    const personToBonds = new Map<string, string[]>();
    const bondToPartners = new Map<string, string[]>();
    const bondToChildren = new Map<string, string[]>();
    const hasParents = new Set<string>();
    const marriedToSomeoneWithParents = new Set<string>();

    edges.forEach((edge) => {
      if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
        personToBonds.set(edge.source, [...(personToBonds.get(edge.source) || []), edge.target]);
        bondToPartners.set(edge.target, [...(bondToPartners.get(edge.target) || []), edge.source]);
      }
      if (kindOf.get(edge.source) === "bond" && kindOf.get(edge.target) === "person") {
        bondToChildren.set(edge.source, [...(bondToChildren.get(edge.source) || []), edge.target]);
        hasParents.add(edge.target);
      }
    });

    edges.forEach((edge) => {
      if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
        const partners = bondToPartners.get(edge.target) || [];
        const anyPartnerHasParents = partners.some((p) => hasParents.has(p));
        if (anyPartnerHasParents) {
          partners.forEach((p) => marriedToSomeoneWithParents.add(p));
        }
      }
    });

    const potentialRoots = nodes.filter(
      (n) => n.data.kind === "person" && !hasParents.has(n.id) && !marriedToSomeoneWithParents.has(n.id)
    );
    const finalRoots: FamilyNode[] = [];
    const seenAsSpouse = new Set<string>();

    for (const p of potentialRoots) {
      if (seenAsSpouse.has(p.id)) continue;
      finalRoots.push(p);
      const bonds = personToBonds.get(p.id) || [];
      for (const b of bonds) {
        const partners = bondToPartners.get(b) || [];
        for (const partner of partners) {
          if (partner !== p.id) seenAsSpouse.add(partner);
        }
      }
    }

    return {
      roots: finalRoots,
      context: { nodeMap, personToBonds, bondToPartners, bondToChildren },
    };
  }, [nodes, edges]);

  return (
    <div className="p-6 md:p-10 mx-auto bg-transparent h-full w-full overflow-y-auto pb-32 max-w-6xl">
      <div className="mb-8">
        <span className="font-devanagari text-sindoor font-bold text-sm">परम्परागत पुर्खा विवरण</span>
        <h2 className="text-3xl font-headline font-bold text-himal mt-0.5">Family Lineage Hierarchy</h2>
        <p className="text-xs font-body text-on-surface-variant mt-1">
          Structured genealogical records organised generation by generation from root ancestors.
        </p>
      </div>
      <div className="space-y-6">
        {roots.map((root) => (
          <FamilyUnit key={root.id} primaryNode={root} ctx={context} level={0} />
        ))}
      </div>
    </div>
  );
}

function PersonCard({ person }: { person: FamilyNode | null }) {
  if (!person) return <div className="p-3 border rounded-xl bg-surface text-on-surface-variant italic text-xs">Unknown</div>;

  const dobYear = person.data.dob ? new Date(person.data.dob).getFullYear() : null;
  const deathYear = person.data.deathDate ? new Date(person.data.deathDate).getFullYear() : null;
  const dateString = dobYear && deathYear ? `${dobYear} — ${deathYear}` : dobYear ? `b. ${dobYear}` : "";
  const tone = toneFor(person.data.generation);

  return (
    <div
      className="flex items-center gap-3 p-3 border-2 rounded-xl bg-surface-bright shadow-xs min-w-[220px] max-w-[280px]"
      style={{ borderColor: tone.base }}
    >
      <div
        className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-outline-variant/60"
        style={{ backgroundColor: tone.soft }}
      >
        {person.data.profileImage ? (
          <img src={person.data.profileImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="font-serif font-bold text-base" style={{ color: tone.deep }}>
            {person.data.label ? person.data.label.charAt(0).toUpperCase() : genderIcon[person.data.gender ?? "other"]}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-serif font-bold text-sm text-himal truncate">{person.data.label || "Unnamed"}</div>
        {dateString && (
          <div className="flex items-center text-[10px] text-on-surface-variant gap-1 mt-0.5 font-mono">
            <Calendar size={10} className="opacity-70" />
            <span>{dateString}</span>
          </div>
        )}
        {person.data.birthPlace && (
          <div className="flex items-center text-[10px] text-on-surface-variant gap-1 mt-0.5 truncate">
            <MapPin size={10} className="text-sindoor opacity-70 shrink-0" />
            <span className="truncate">{person.data.birthPlace}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FamilyUnit({ primaryNode, ctx, level = 0 }: { primaryNode: FamilyNode; ctx: TreeContext; level?: number }) {
  const tone = toneFor(level);

  const bonds = ctx.personToBonds.get(primaryNode.id) || [];
  const spouses = bonds.map((bId) => {
    const partners = ctx.bondToPartners.get(bId) || [];
    const spId = partners.find((p) => p !== primaryNode.id);
    return { bondId: bId, spouse: spId ? ctx.nodeMap.get(spId) : null, bondNode: ctx.nodeMap.get(bId)! };
  });

  const [activeBondId, setActiveBondId] = useState<string | undefined>(bonds[0]);
  const [isExpanded, setIsExpanded] = useState(true);

  const activeSpouseData = spouses.find((s) => s.bondId === activeBondId);
  const activeSpouse = activeSpouseData?.spouse || null;
  const activeBond = activeSpouseData?.bondNode;

  const childrenIds = activeBondId ? ctx.bondToChildren.get(activeBondId) || [] : [];
  const children = childrenIds.map((id) => ctx.nodeMap.get(id)).filter(Boolean) as FamilyNode[];

  return (
    <div
      className="border-2 rounded-2xl p-5 max-w-5xl shadow-xs transition-colors"
      style={{
        backgroundColor: tone.soft + "40",
        borderColor: tone.base,
      }}
    >
      {/* Couple Header */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Primary Person */}
        <div className="relative">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1 px-1">
            {generationLabel(level)}
          </div>
          <PersonCard person={primaryNode} />
        </div>

        {spouses.length > 0 && (
          <>
            <ArrowRight className="text-outline mt-5" />

            {/* Active Spouse / Spouse Selector */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Partner (दम्पती)</span>
                {spouses.length > 1 && (
                  <select
                    value={activeBondId}
                    onChange={(e) => setActiveBondId(e.target.value)}
                    className="text-[10px] bg-surface-bright border border-outline-variant rounded px-1.5 py-0.5 ml-2 cursor-pointer font-medium"
                  >
                    {spouses.map((s) => (
                      <option key={s.bondId} value={s.bondId}>
                        {s.spouse ? s.spouse.data.label : "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <PersonCard person={activeSpouse} />
              {activeBond && activeBond.data.bondStatus && activeBond.data.bondStatus !== "married" && (
                <div className="absolute -bottom-2 right-2 bg-surface-bright border border-outline-variant text-[9px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider text-error">
                  {activeBond.data.bondStatus}
                </div>
              )}
            </div>
          </>
        )}

        {/* Expand/Collapse Toggle */}
        {children.length > 0 && (
          <div className="ml-auto flex items-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-bright hover:bg-surface-container transition-colors text-on-surface font-label-sm text-xs font-semibold uppercase tracking-wider border border-outline-variant shadow-xs"
            >
              {isExpanded ? (
                <>
                  <span>Collapse</span>
                  <ChevronDown size={14} />
                </>
              ) : (
                <>
                  <span>Expand ({children.length})</span>
                  <ChevronRight size={14} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Offspring */}
      {isExpanded && children.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="text-xs uppercase font-bold tracking-widest px-3 py-0.5 rounded-full border shadow-xs"
              style={{
                backgroundColor: toneFor(level + 1).base,
                color: toneFor(level + 1).ink,
                borderColor: toneFor(level + 1).deep,
              }}
            >
              {generationLabel(level + 1)} ({children.length} {children.length === 1 ? "child" : "children"})
            </div>
            <div className="flex-1 h-px border-b border-dashed opacity-40" style={{ borderColor: tone.base }} />
          </div>
          <div className="pl-6 md:pl-10 border-l-2 space-y-5" style={{ borderColor: tone.base }}>
            {children.map((child) => (
              <FamilyUnit key={child.id} primaryNode={child} ctx={ctx} level={level + 1} />
            ))}
          </div>
        </div>
      )}

      {isExpanded && spouses.length > 0 && children.length === 0 && (
        <div className="mt-4 pt-3 border-t border-outline-variant/30 text-xs italic text-on-surface-variant">
          No children recorded for this partnership.
        </div>
      )}
    </div>
  );
}
