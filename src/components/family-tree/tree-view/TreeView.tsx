import React, { useState, useMemo } from "react";
import { Calendar, User, ArrowRight, ChevronDown, ChevronRight, MapPin, FileText } from "lucide-react";

const GENERATION_STYLES = [
  { border: "border-indigo-200", bg: "bg-indigo-50/40", badge: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  { border: "border-emerald-200", bg: "bg-emerald-50/40", badge: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  { border: "border-amber-200", bg: "bg-amber-50/40", badge: "bg-amber-100 text-amber-800 border-amber-200" },
  { border: "border-fuchsia-200", bg: "bg-fuchsia-50/40", badge: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
  { border: "border-rose-200", bg: "bg-rose-50/40", badge: "bg-rose-100 text-rose-800 border-rose-200" },
  { border: "border-sky-200", bg: "bg-sky-50/40", badge: "bg-sky-100 text-sky-800 border-sky-200" },
];
import type { FamilyNode } from "../types";
import type { Edge } from "@xyflow/react";

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
        const anyPartnerHasParents = partners.some(p => hasParents.has(p));
        if (anyPartnerHasParents) {
          partners.forEach(p => marriedToSomeoneWithParents.add(p));
        }
      }
    });

    const potentialRoots = nodes.filter((n) => 
      n.data.kind === "person" && 
      !hasParents.has(n.id) && 
      !marriedToSomeoneWithParents.has(n.id)
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
      context: { nodeMap, personToBonds, bondToPartners, bondToChildren } 
    };
  }, [nodes, edges]);

  return (
    <div className="p-8 mx-auto bg-transparent h-full w-full overflow-y-auto pb-32">
      <h2 className="text-3xl font-title-lg text-on-surface mb-8">Family Lineage View</h2>
      <div className="space-y-6">
        {roots.map((root) => (
          <FamilyUnit key={root.id} primaryNode={root} ctx={context} level={0} />
        ))}
      </div>
    </div>
  );
}

function PersonCard({ person }: { person: FamilyNode | null }) {
  if (!person) return <div className="p-3 border rounded-xl bg-surface text-on-surface-variant italic">Unknown</div>;
  
  const dobYear = person.data.dob ? new Date(person.data.dob).getFullYear() : "?";
  const deathYear = person.data.deathDate ? new Date(person.data.deathDate).getFullYear() : "";
  const dateString = person.data.dob || person.data.deathDate ? `${dobYear} - ${deathYear}` : "";

  return (
    <div className="flex items-center gap-3 p-3 border-2 border-outline-variant rounded-xl bg-surface shadow-sm min-w-[220px] max-w-[280px]">
      <div className="shrink-0">
        {person.data.profileImage ? (
          <img 
            src={person.data.profileImage} 
            alt={person.data.label} 
            className="w-12 h-12 rounded-full object-cover border border-outline"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <User size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-title-md text-on-surface text-sm font-bold truncate">
          {person.data.label}
        </div>
        {dateString && (
          <div className="flex items-center text-[10px] text-on-surface-variant/80 gap-1 mt-0.5 font-mono">
            <Calendar size={10} />
            <span>{dateString}</span>
          </div>
        )}
        
        {person.data.birthPlace && (
          <div className="flex items-center text-[10px] text-on-surface-variant/80 gap-1 mt-0.5 truncate">
            <MapPin size={10} />
            <span className="truncate">{person.data.birthPlace}</span>
          </div>
        )}

        {person.data.otherDetails && (
          <div className="flex items-start text-[10px] text-on-surface-variant/70 gap-1 mt-1 border-t border-outline-variant/30 pt-1">
            <FileText size={10} className="mt-0.5 shrink-0" />
            <span className="line-clamp-2 leading-tight">{person.data.otherDetails}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function FamilyUnit({ primaryNode, ctx, level = 0 }: { primaryNode: FamilyNode; ctx: TreeContext; level?: number }) {
  const style = GENERATION_STYLES[level % GENERATION_STYLES.length];
  
  const bonds = ctx.personToBonds.get(primaryNode.id) || [];
  const spouses = bonds.map(bId => {
    const partners = ctx.bondToPartners.get(bId) || [];
    const spId = partners.find(p => p !== primaryNode.id);
    return { bondId: bId, spouse: spId ? ctx.nodeMap.get(spId) : null, bondNode: ctx.nodeMap.get(bId)! };
  });

  const [activeBondId, setActiveBondId] = useState<string | undefined>(bonds[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const activeSpouseData = spouses.find(s => s.bondId === activeBondId);
  const activeSpouse = activeSpouseData?.spouse || null;
  const activeBond = activeSpouseData?.bondNode;

  const childrenIds = activeBondId ? (ctx.bondToChildren.get(activeBondId) || []) : [];
  const children = childrenIds.map(id => ctx.nodeMap.get(id)).filter(Boolean) as FamilyNode[];
  
  return (
    <div className={`border-2 rounded-2xl p-5 max-w-5xl shadow-sm transition-colors ${style.border} ${style.bg}`}>
      {/* Couple Header */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Primary Person */}
        <div className="relative">
          <div className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1 px-1">Primary</div>
          <PersonCard person={primaryNode} />
        </div>

        {spouses.length > 0 && (
          <>
            <ArrowRight className="text-outline mt-5" />
            
            {/* Active Spouse / Spouse Selector */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Partner</span>
                {spouses.length > 1 && (
                  <select 
                    value={activeBondId}
                    onChange={(e) => setActiveBondId(e.target.value)}
                    className="text-[10px] bg-surface border border-outline-variant rounded px-1 py-0.5 ml-2 cursor-pointer focus:outline-primary"
                  >
                    {spouses.map(s => (
                      <option key={s.bondId} value={s.bondId}>
                        {s.spouse ? s.spouse.data.label : "Unknown"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <PersonCard person={activeSpouse} />
              {activeBond && activeBond.data.bondStatus && activeBond.data.bondStatus !== 'married' && (
                <div className="absolute -bottom-2 right-2 bg-surface border border-outline-variant text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider text-error">
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant font-label-sm uppercase tracking-wider"
            >
              {isExpanded ? (
                <>Collapse <ChevronDown size={16} /></>
              ) : (
                <>Expand <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Offspring */}
      {isExpanded && children.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-xs uppercase font-bold tracking-widest px-2 py-0.5 rounded-full border ${style.badge}`}>
              Generation {level + 1} ({children.length} {children.length === 1 ? 'child' : 'children'})
            </div>
            <div className={`flex-1 h-px ${style.border} opacity-50`} />
          </div>
          <div className={`pl-6 md:pl-10 border-l-2 space-y-5 ${style.border}`}>
            {children.map(child => (
              <FamilyUnit key={child.id} primaryNode={child} ctx={ctx} level={level + 1} />
            ))}
          </div>
        </div>
      )}
      
      {isExpanded && spouses.length > 0 && children.length === 0 && (
        <div className="mt-5 pt-3 border-t border-outline-variant/20 text-xs italic text-on-surface-variant/70">
          No children recorded for this partnership.
        </div>
      )}
    </div>
  );
}
