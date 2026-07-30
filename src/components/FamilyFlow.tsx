import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
  Handle,
  Position,
  NodeToolbar,
  type Node,
  type Edge,
  type Connection,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Kind = "person" | "bond";
type Gender = "male" | "female" | "other";
type MediaKind = "image" | "video" | "audio";
type MediaItem = { id: string; kind: MediaKind; url: string; name: string };

type FamilyNodeData = {
  label: string;
  kind: Kind;
  gender?: Gender;
  media?: MediaItem[];
  marriageDate?: string;
};
type FamilyNode = Node<FamilyNodeData>;

type Actions = {
  addParent: (id: string, label: "Father" | "Mother") => void;
  addSpouse: (id: string) => void;
  addSibling: (id: string) => void;
  addChild: (id: string) => void;
  remove: (id: string) => void;
  rename: (id: string, label: string) => void;
  setGender: (id: string, g: Gender) => void;
  setMarriageDate: (id: string, d: string) => void;
  addMedia: (id: string, files: FileList | null) => void;
  removeMedia: (id: string, mediaId: string) => void;
  hasPartner: (id: string) => boolean;
  hasParent: (id: string) => boolean;
};

const ActionsContext = createContext<Actions | null>(null);
const useActions = () => useContext(ActionsContext)!;

const genderStyles: Record<Gender, string> = {
  male: "bg-[hsl(210_90%_96%)] border-[hsl(210_80%_55%)] text-foreground",
  female: "bg-[hsl(330_90%_97%)] border-[hsl(330_70%_60%)] text-foreground",
  other: "bg-card border-foreground/70 text-foreground",
};

const genderIcon: Record<Gender, string> = { male: "♂", female: "♀", other: "⚧" };

function mediaKindOf(file: File): MediaKind {
  if (file.type.startsWith("video")) return "video";
  if (file.type.startsWith("audio")) return "audio";
  return "image";
}

function MediaStrip({ nodeId, media }: { nodeId: string; media: MediaItem[] }) {
  const a = useActions();
  if (!media.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 justify-center max-w-[220px]">
      {media.map((m) => (
        <div key={m.id} className="relative group">
          {m.kind === "image" && (
            <img src={m.url} alt={m.name} className="h-10 w-10 rounded-md object-cover border" />
          )}
          {m.kind === "video" && (
            <video src={m.url} className="h-10 w-10 rounded-md object-cover border" muted controls={false} />
          )}
          {m.kind === "audio" && (
            <div className="h-10 w-10 rounded-md border grid place-items-center text-base bg-muted">♪</div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              a.removeMedia(nodeId, m.id);
            }}
            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-none opacity-0 group-hover:opacity-100 transition"
            title="Remove"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function ToolbarBtn({
  onClick,
  children,
  disabled,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="px-2 py-1 text-xs rounded-md border bg-background hover:bg-accent transition disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function PersonToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const a = useActions();
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[240px]">
      <input
        value={data.label}
        onChange={(e) => a.rename(id, e.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
        placeholder="Name"
      />
      <div className="flex gap-1">
        {(["male", "female", "other"] as Gender[]).map((g) => (
          <button
            key={g}
            onClick={() => a.setGender(id, g)}
            className={`flex-1 px-2 py-1 text-xs rounded-md border capitalize transition ${
              (data.gender ?? "other") === g ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
            }`}
          >
            {genderIcon[g]} {g}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ToolbarBtn onClick={() => a.addParent(id, "Father")}>+ Father</ToolbarBtn>
        <ToolbarBtn onClick={() => a.addParent(id, "Mother")}>+ Mother</ToolbarBtn>
        <ToolbarBtn
          onClick={() => a.addSpouse(id)}
          disabled={a.hasPartner(id)}
          title={a.hasPartner(id) ? "Already has a partner" : ""}
        >
          + Spouse
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => a.addSibling(id)}
          disabled={!a.hasParent(id)}
          title={!a.hasParent(id) ? "Add a parent first" : ""}
        >
          + Sibling
        </ToolbarBtn>
        <ToolbarBtn onClick={() => a.addChild(id)}>+ Child</ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()}>+ Media</ToolbarBtn>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(e) => {
          a.addMedia(id, e.target.files);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => a.remove(id)}
        className="w-full px-2 py-1 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

function BondToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const a = useActions();
  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[220px]">
      <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">Marriage date</label>
      <input
        type="date"
        value={data.marriageDate ?? ""}
        onChange={(e) => a.setMarriageDate(id, e.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
      />
      <ToolbarBtn onClick={() => a.addChild(id)}>+ Child</ToolbarBtn>
      <button
        onClick={() => a.remove(id)}
        className="w-full px-2 py-1 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

const handleCls = "!bg-foreground !w-2 !h-2";

function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className={handleCls} />
      <Handle type="source" position={Position.Bottom} className={handleCls} />
      <Handle type="target" position={Position.Left} id="l" className={handleCls} />
      <Handle type="source" position={Position.Right} id="r" className={handleCls} />
    </>
  );
}

function formatDate(d?: string) {
  if (!d) return null;
  const dt = new Date(d + "T00:00:00");
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function BondNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const pretty = formatDate(data.marriageDate);
  return (
    <div className="flex flex-col items-center">
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <BondToolbar id={id} data={data} />
      </NodeToolbar>
      <div
        className={`relative grid place-items-center h-[86px] w-[96px] transition ${
          selected ? "scale-105" : ""
        }`}
      >
        <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full drop-shadow-md">
          <defs>
            <linearGradient id="loveGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(345 90% 62%)" />
              <stop offset="100%" stopColor="hsl(325 75% 45%)" />
            </linearGradient>
          </defs>
          <path
            d="M50 88 C10 60 4 36 18 22 C30 10 46 14 50 28 C54 14 70 10 82 22 C96 36 90 60 50 88 Z"
            fill="url(#loveGrad)"
            stroke={selected ? "hsl(var(--ring))" : "hsl(345 60% 35%)"}
            strokeWidth={selected ? 3 : 2}
          />
        </svg>
        <div className="relative text-center leading-tight pb-2">
          <svg viewBox="0 0 24 14" className="mx-auto h-3 w-6 text-white/90" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="7" r="5" />
            <circle cx="15" cy="7" r="5" />
          </svg>
          <div
            className="text-[11px] font-bold text-white drop-shadow"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            Love
          </div>
        </div>
      </div>
      <div
        className="-mt-1 px-2 py-0.5 rounded-full border bg-card text-[10px] font-medium shadow-sm whitespace-nowrap"
        style={{ fontFamily: "'Kalam', cursive" }}
      >
        {pretty ?? "Set date"}
      </div>
      <Handles />
    </div>
  );
}

function PersonNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const gender = data.gender ?? "other";
  return (
    <div
      className={`rounded-2xl border-2 px-5 py-3 shadow-sm font-medium text-sm text-center transition ${
        genderStyles[gender]
      } min-w-[130px] ${selected ? "ring-2 ring-ring ring-offset-2 ring-offset-background" : ""}`}
      style={{ fontFamily: "'Kalam', 'Comic Sans MS', cursive" }}
    >
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <PersonToolbar id={id} data={data} />
      </NodeToolbar>
      <Handles />
      <div className="flex items-center justify-center gap-1.5">
        <span className="text-xs opacity-70">{genderIcon[gender]}</span>
        <span>{data.label}</span>
      </div>
      <MediaStrip nodeId={id} media={data.media ?? []} />
    </div>
  );
}

const nodeTypes = { family: PersonNodeView, bond: BondNodeView };

const edgeBase: Partial<Edge> = {
  type: "smoothstep",
  style: { stroke: "hsl(0 0% 10%)", strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(0 0% 10%)" },
};

const mkEdge = (source: string, target: string): Edge =>
  ({ id: `e-${source}-${target}-${Math.random().toString(36).slice(2, 6)}`, source, target, ...edgeBase }) as Edge;

const personNode = (
  id: string,
  x: number,
  y: number,
  label: string,
  gender: Gender = "other",
): FamilyNode => ({
  id,
  type: "family",
  position: { x, y },
  data: { label, kind: "person", gender, media: [] },
});

const bondNode = (id: string, x: number, y: number, marriageDate?: string): FamilyNode => ({
  id,
  type: "bond",
  position: { x, y },
  data: { label: "Love", kind: "bond", marriageDate },
});

const initialNodes: FamilyNode[] = [
  personNode("husband", 40, 40, "Husband", "male"),
  personNode("wife", 460, 40, "Wife", "female"),
  bondNode("love", 270, 200, "2005-06-12"),
  personNode("c1", 60, 380, "Child 1", "male"),
  personNode("c2", 260, 380, "Child 2", "female"),
  personNode("c3", 460, 380, "Child 3", "other"),
];

const initialEdges: Edge[] = [
  mkEdge("husband", "love"),
  mkEdge("wife", "love"),
  mkEdge("love", "c1"),
  mkEdge("love", "c2"),
  mkEdge("love", "c3"),
];

function autoLayout(nodes: FamilyNode[], edges: Edge[]): FamilyNode[] {
  const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
  const partnersOf = new Map<string, string[]>();
  const parentBondOf = new Map<string, string>();
  const childrenOfBond = new Map<string, string[]>();
  const directChildrenOf = new Map<string, string[]>();
  edges.forEach((e) => {
    const sk = kindOf.get(e.source);
    const tk = kindOf.get(e.target);
    if (sk === "person" && tk === "bond") {
      partnersOf.set(e.target, [...(partnersOf.get(e.target) || []), e.source]);
    } else if (sk === "bond" && tk === "person") {
      parentBondOf.set(e.target, e.source);
      childrenOfBond.set(e.source, [...(childrenOfBond.get(e.source) || []), e.target]);
    } else if (sk === "person" && tk === "person") {
      directChildrenOf.set(e.source, [...(directChildrenOf.get(e.source) || []), e.target]);
    }
  });

  const persons = nodes.filter((n) => n.data.kind === "person").map((n) => n.id);
  const bonds = nodes.filter((n) => n.data.kind === "bond").map((n) => n.id);

  const level = new Map<string, number>();
  const compute = (id: string, seen: Set<string>): number => {
    if (level.has(id)) return level.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    let lvl = 0;
    if (parentBondOf.has(id)) {
      const bond = parentBondOf.get(id)!;
      const parts = partnersOf.get(bond) || [];
      if (parts.length) lvl = Math.max(...parts.map((p) => compute(p, seen))) + 1;
    } else {
      const dp = persons.filter((p) => (directChildrenOf.get(p) || []).includes(id));
      if (dp.length) lvl = Math.max(...dp.map((p) => compute(p, seen))) + 1;
    }
    level.set(id, lvl);
    return lvl;
  };
  persons.forEach((p) => compute(p, new Set()));

  const LEVEL_H = 240;
  const NODE_GAP = 60;
  const NODE_W = 170;
  const BOND_DY = 100;

  const byLevel = new Map<number, string[]>();
  persons.forEach((p) => {
    const l = level.get(p) ?? 0;
    byLevel.set(l, [...(byLevel.get(l) || []), p]);
  });

  const positions = new Map<string, { x: number; y: number }>();
  const sortedLevels = [...byLevel.keys()].sort((a, b) => a - b);

  sortedLevels.forEach((l) => {
    const pool = byLevel.get(l)!;
    const parentX = (id: string) => {
      const b = parentBondOf.get(id);
      if (!b) return 0;
      const parts = partnersOf.get(b) || [];
      const px = parts.map((p) => positions.get(p)?.x ?? 0);
      return px.length ? px.reduce((a, b) => a + b, 0) / px.length : 0;
    };
    const sorted = [...pool].sort((a, b) => parentX(a) - parentX(b));

    const ordered: string[] = [];
    const placed = new Set<string>();
    sorted.forEach((p) => {
      if (placed.has(p)) return;
      ordered.push(p);
      placed.add(p);
      const partnerBonds = bonds.filter((b) => (partnersOf.get(b) || []).includes(p));
      partnerBonds.forEach((b) => {
        (partnersOf.get(b) || []).forEach((o) => {
          if (!placed.has(o) && level.get(o) === l) {
            ordered.push(o);
            placed.add(o);
          }
        });
      });
    });

    const totalW = (ordered.length - 1) * (NODE_W + NODE_GAP);
    ordered.forEach((id, i) => {
      positions.set(id, { x: i * (NODE_W + NODE_GAP) - totalW / 2, y: l * LEVEL_H });
    });
  });

  bonds.forEach((b) => {
    const parts = partnersOf.get(b) || [];
    const pts = parts.map((p) => positions.get(p)).filter(Boolean) as { x: number; y: number }[];
    if (pts.length) {
      const avgX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((p) => p.y));
      positions.set(b, { x: avgX + 30, y: maxY + BOND_DY });
    }
  });

  childrenOfBond.forEach((kids, bondId) => {
    const bp = positions.get(bondId);
    if (!bp) return;
    const sorted = [...kids].sort((a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0));
    const step = NODE_W + NODE_GAP;
    const total = (sorted.length - 1) * step;
    sorted.forEach((k, i) => {
      const cur = positions.get(k);
      positions.set(k, { x: bp.x - total / 2 + i * step, y: cur?.y ?? bp.y + LEVEL_H - BOND_DY });
    });
  });

  let orphanY = 0;
  nodes.forEach((n) => {
    if (!positions.has(n.id)) {
      positions.set(n.id, { x: -400, y: orphanY });
      orphanY += 120;
    }
  });

  return nodes.map((n) => ({ ...n, position: positions.get(n.id)! }));
}

let idCounter = 100;
const nextId = () => `n${++idCounter}`;

/** Rewrite edges so any person→person edge from a partnered person is rerouted through their bond. */
function reconcile(nodes: FamilyNode[], edges: Edge[]): Edge[] {
  const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
  const partnerBond = new Map<string, string>();
  edges.forEach((e) => {
    if (kindOf.get(e.source) === "person" && kindOf.get(e.target) === "bond") {
      partnerBond.set(e.source, e.target);
    }
  });
  const seen = new Set<string>();
  const out: Edge[] = [];
  for (const e of edges) {
    let src = e.source;
    const tgt = e.target;
    if (kindOf.get(src) === "person" && kindOf.get(tgt) === "person" && partnerBond.has(src)) {
      src = partnerBond.get(src)!;
    }
    const key = `${src}->${tgt}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(src === e.source ? e : { ...e, source: src });
  }
  return out;
}

function FamilyFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const wrapper = useRef<HTMLDivElement>(null);

  const commit = useCallback(
    (mutator: (n: FamilyNode[], e: Edge[]) => { nodes: FamilyNode[]; edges: Edge[] }) => {
      setNodes((ns) => {
        setEdges((es) => {
          const r = mutator(ns, es);
          queueMicrotask(() => setNodes(r.nodes));
          return reconcile(r.nodes, r.edges);
        });
        return ns;
      });
    },
    [setNodes, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((es) => reconcile(nodes, addEdge({ ...params, ...edgeBase } as Edge, es))),
    [setEdges, nodes],
  );

  const q = useMemo(() => {
    const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
    return {
      kindOf,
      partnerBondOf: (id: string) =>
        edges.find((e) => e.source === id && kindOf.get(e.target) === "bond")?.target ?? null,
      parentBondOf: (id: string) =>
        edges.find((e) => e.target === id && kindOf.get(e.source) === "bond")?.source ?? null,
      directParentsOf: (id: string) =>
        edges.filter((e) => e.target === id && kindOf.get(e.source) === "person").map((e) => e.source),
    };
  }, [nodes, edges]);

  const patch = useCallback(
    (id: string, fn: (d: FamilyNodeData) => FamilyNodeData) =>
      setNodes((ns) => ns.map((n) => (n.id === id ? { ...n, data: fn(n.data) } : n))),
    [setNodes],
  );

  const actions: Actions = useMemo(
    () => ({
      hasPartner: (id) => !!q.partnerBondOf(id),
      hasParent: (id) => !!q.parentBondOf(id) || q.directParentsOf(id).length > 0,
      rename: (id, label) => patch(id, (d) => ({ ...d, label })),
      setGender: (id, gender) => patch(id, (d) => ({ ...d, gender })),
      setMarriageDate: (id, marriageDate) => patch(id, (d) => ({ ...d, marriageDate })),
      addMedia: (id, files) => {
        if (!files) return;
        const items: MediaItem[] = Array.from(files).map((f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: mediaKindOf(f),
          url: URL.createObjectURL(f),
          name: f.name,
        }));
        patch(id, (d) => ({ ...d, media: [...(d.media ?? []), ...items] }));
      },
      removeMedia: (id, mediaId) =>
        patch(id, (d) => ({ ...d, media: (d.media ?? []).filter((m) => m.id !== mediaId) })),
      remove: (id) =>
        commit((ns, es) => ({
          nodes: ns.filter((n) => n.id !== id),
          edges: es.filter((e) => e.source !== id && e.target !== id),
        })),
      addChild: (fromId) => {
        const from = nodes.find((n) => n.id === fromId);
        if (!from) return;
        const bondId = from.data.kind === "person" ? q.partnerBondOf(fromId) : fromId;
        const anchor = bondId ? nodes.find((n) => n.id === bondId)! : from;
        const childId = nextId();
        const child = personNode(
          childId,
          anchor.position.x + (Math.random() * 200 - 100),
          anchor.position.y + 200,
          "Child",
        );
        commit((ns, es) => ({ nodes: [...ns, child], edges: [...es, mkEdge(bondId ?? fromId, childId)] }));
      },
      addSpouse: (personId) => {
        if (q.partnerBondOf(personId)) return;
        const p = nodes.find((n) => n.id === personId)!;
        const spouseId = nextId();
        const bondId = nextId();
        const spouseGender: Gender =
          p.data.gender === "male" ? "female" : p.data.gender === "female" ? "male" : "other";
        const newNodes = [
          personNode(spouseId, p.position.x + 340, p.position.y, "Spouse", spouseGender),
          bondNode(bondId, p.position.x + 180, p.position.y + 130),
        ];
        commit((ns, es) => ({
          nodes: [...ns, ...newNodes],
          edges: [...es, mkEdge(personId, bondId), mkEdge(spouseId, bondId)],
        }));
      },
      addParent: (personId, label) => {
        const p = nodes.find((n) => n.id === personId)!;
        const parentBond = q.parentBondOf(personId);
        const newParentId = nextId();
        const offsetX = label === "Father" ? -180 : 180;
        const parent = personNode(
          newParentId,
          p.position.x + offsetX,
          p.position.y - 240,
          label,
          label === "Father" ? "male" : "female",
        );

        if (parentBond) {
          commit((ns, es) => ({ nodes: [...ns, parent], edges: [...es, mkEdge(newParentId, parentBond)] }));
          return;
        }

        const directParents = q.directParentsOf(personId);
        if (directParents.length === 1) {
          const existingParent = directParents[0];
          const existing = nodes.find((n) => n.id === existingParent)!;
          const bondId = nextId();
          const bond = bondNode(
            bondId,
            (existing.position.x + parent.position.x) / 2 + 40,
            existing.position.y + 130,
          );
          commit((ns, es) => {
            const filtered = es.filter((e) => !(e.source === existingParent && e.target === personId));
            return {
              nodes: [...ns, parent, bond],
              edges: [
                ...filtered,
                mkEdge(existingParent, bondId),
                mkEdge(newParentId, bondId),
                mkEdge(bondId, personId),
              ],
            };
          });
          return;
        }

        commit((ns, es) => ({ nodes: [...ns, parent], edges: [...es, mkEdge(newParentId, personId)] }));
      },
      addSibling: (personId) => {
        const parentBond = q.parentBondOf(personId);
        const directParents = q.directParentsOf(personId);
        const p = nodes.find((n) => n.id === personId)!;
        const source = parentBond ?? directParents[0];
        if (!source) return;
        const sibId = nextId();
        const sib = personNode(sibId, p.position.x + 200, p.position.y, "Sibling");
        commit((ns, es) => ({ nodes: [...ns, sib], edges: [...es, mkEdge(source, sibId)] }));
      },
    }),
    [nodes, q, commit, patch],
  );

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const runAutoLayout = () => setNodes((ns) => autoLayout(ns, edges));

  const addStandalonePerson = () =>
    setNodes((ns) => [...ns, personNode(nextId(), 100 + Math.random() * 300, 60, "Person")]);

  return (
    <ActionsContext.Provider value={actions}>
      <div className="h-screen w-screen flex flex-col bg-background">
        <header className="flex items-center justify-between px-6 py-3 border-b bg-card">
          <div>
            <h1 className="text-lg font-semibold" style={{ fontFamily: "'Kalam', cursive" }}>
              Family Relationship Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Click a node → edit name, gender, media and relationships right on the node.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={addStandalonePerson}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition"
            >
              + Person
            </button>
            <button
              onClick={runAutoLayout}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition"
            >
              Auto layout
            </button>
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-sm rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition"
            >
              Clear
            </button>
          </div>
        </header>

        <div ref={wrapper} className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={(changes) => {
              onEdgesChange(changes);
              queueMicrotask(() => setEdges((es) => reconcile(nodes, es)));
            }}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            deleteKeyCode={["Delete"]}
          >
            <Background gap={20} size={1} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>
      </div>
    </ActionsContext.Provider>
  );
}

export default function FamilyFlow() {
  return (
    <ReactFlowProvider>
      <FamilyFlowInner />
    </ReactFlowProvider>
  );
}
