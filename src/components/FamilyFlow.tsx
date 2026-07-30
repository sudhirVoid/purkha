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
  useReactFlow,
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
import { toPng } from "html-to-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { ChevronDown, ChevronUp, Camera } from "lucide-react";

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
  address?: string;
  birthPlace?: string;
  dob?: string;
  deathDate?: string;
  otherDetails?: string;
  residingAt?: string;
  profileImage?: string;
  isCollapsed?: boolean;
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
  setProfileImage: (id: string, url: string | undefined) => void;
  setMarriageDate: (id: string, d: string) => void;
  addMedia: (id: string, files: FileList | null) => void;
  removeMedia: (id: string, mediaId: string) => void;
  hasPartner: (id: string) => boolean;
  hasParent: (id: string) => boolean;
  updateNodeData: (id: string, data: Partial<FamilyNodeData>) => void;
  toggleCollapse: (id: string) => void;
  canCollapse: (id: string) => boolean;
  getParentInfo: (id: string) => { hasBondParent: boolean; directParents: string[] };
  getNode: (id: string) => FamilyNode | undefined;
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
  const actions = useActions();
  if (!media.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5 justify-center max-w-[220px]">
      {media.map((mediaItem) => (
        <Dialog key={mediaItem.id}>
          <div className="relative group">
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                {mediaItem.kind === "image" && (
                  <img src={mediaItem.url} alt={mediaItem.name} className="h-10 w-10 rounded-md object-cover border" />
                )}
                {mediaItem.kind === "video" && (
                  <video src={mediaItem.url} className="h-10 w-10 rounded-md object-cover border" muted controls={false} />
                )}
                {mediaItem.kind === "audio" && (
                  <div className="h-10 w-10 rounded-md border grid place-items-center text-base bg-muted">♪</div>
                )}
              </div>
            </DialogTrigger>
            <button
              onClick={(event) => {
                event.stopPropagation();
                actions.removeMedia(nodeId, mediaItem.id);
              }}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-none opacity-0 group-hover:opacity-100 transition z-10"
              title="Remove"
            >
              ×
            </button>
          </div>
          <DialogContent className="max-w-3xl w-full max-h-[90vh] flex flex-col items-center justify-center bg-black/95 border-none p-4 sm:p-10">
            <DialogTitle className="sr-only">{mediaItem.name}</DialogTitle>
            <DialogDescription className="sr-only">Media viewer</DialogDescription>
            {mediaItem.kind === "image" && (
              <img src={mediaItem.url} alt={mediaItem.name} className="max-w-full max-h-[80vh] object-contain rounded-md" />
            )}
            {mediaItem.kind === "video" && (
              <video src={mediaItem.url} className="max-w-full max-h-[80vh] rounded-md" controls autoPlay />
            )}
            {mediaItem.kind === "audio" && (
              <audio src={mediaItem.url} controls className="w-full max-w-md mt-8" autoPlay />
            )}
          </DialogContent>
        </Dialog>
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
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const parentInfo = actions.getParentInfo(id);
  const canAddFather = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "male");
  const canAddMother = !parentInfo.hasBondParent && !parentInfo.directParents.some(pid => actions.getNode(pid)?.data.gender === "female");

  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[240px]">
      <input
        value={data.label}
        onChange={(event) => actions.rename(id, event.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
        placeholder="Name"
      />
      <div className="flex gap-1">
        {(["male", "female", "other"] as Gender[]).map((genderOption) => (
          <button
            key={genderOption}
            onClick={() => actions.setGender(id, genderOption)}
            className={`flex-1 px-2 py-1 text-xs rounded-md border capitalize transition ${
              (data.gender ?? "other") === genderOption ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
            }`}
          >
            {genderIcon[genderOption]} {genderOption}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1">
        <ToolbarBtn onClick={() => actions.addParent(id, "Father")} disabled={!canAddFather} title={!canAddFather ? "Father already exists" : ""}>+ Father</ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addParent(id, "Mother")} disabled={!canAddMother} title={!canAddMother ? "Mother already exists" : ""}>+ Mother</ToolbarBtn>
        <ToolbarBtn
          onClick={() => actions.addSpouse(id)}
          disabled={actions.hasPartner(id)}
          title={actions.hasPartner(id) ? "Already has a partner" : ""}
        >
          + Spouse
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => actions.addSibling(id)}
          disabled={!actions.hasParent(id)}
          title={!actions.hasParent(id) ? "Add a parent first" : ""}
        >
          + Sibling
        </ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id)}>+ Child</ToolbarBtn>
        <ToolbarBtn onClick={() => fileRef.current?.click()}>+ Media</ToolbarBtn>
        <Sheet>
          <SheetTrigger asChild>
            <div className="col-span-2">
              <ToolbarBtn onClick={() => {}} title="Edit details">Edit Details</ToolbarBtn>
            </div>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Details</SheetTitle>
              <SheetDescription>Update personal information for {data.label || "this member"}.</SheetDescription>
            </SheetHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor={`name-${id}`}>Name (Required)</Label>
                <Input id={`name-${id}`} value={data.label} onChange={(event) => actions.updateNodeData(id, { label: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`dob-${id}`}>Date of Birth</Label>
                <Input id={`dob-${id}`} type="date" value={data.dob || ""} onChange={(event) => actions.updateNodeData(id, { dob: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`birthPlace-${id}`}>Birth Place</Label>
                <Input id={`birthPlace-${id}`} value={data.birthPlace || ""} onChange={(event) => actions.updateNodeData(id, { birthPlace: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`deathDate-${id}`}>Death Date (if deceased)</Label>
                <Input id={`deathDate-${id}`} type="date" value={data.deathDate || ""} onChange={(event) => actions.updateNodeData(id, { deathDate: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`address-${id}`}>Address</Label>
                <Textarea id={`address-${id}`} value={data.address || ""} onChange={(event) => actions.updateNodeData(id, { address: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`residingAt-${id}`}>Currently Residing At</Label>
                <Input id={`residingAt-${id}`} value={data.residingAt || ""} onChange={(event) => actions.updateNodeData(id, { residingAt: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`otherDetails-${id}`}>Other Details</Label>
                <Textarea id={`otherDetails-${id}`} value={data.otherDetails || ""} onChange={(event) => actions.updateNodeData(id, { otherDetails: event.target.value })} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(event) => {
          actions.addMedia(id, event.target.files);
          event.target.value = "";
        }}
      />
      <button
        onClick={() => actions.remove(id)}
        className="w-full px-2 py-1 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

function BondToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const actions = useActions();
  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[220px]">
      <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">Marriage date</label>
      <input
        type="date"
        value={data.marriageDate ?? ""}
        onChange={(event) => actions.setMarriageDate(id, event.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
      />
      <ToolbarBtn onClick={() => actions.addChild(id)}>+ Child</ToolbarBtn>
      <button
        onClick={() => actions.remove(id)}
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

function formatDate(dateString?: string) {
  if (!dateString) return null;
  const dateObj = new Date(dateString + "T00:00:00");
  if (Number.isNaN(dateObj.getTime())) return dateString;
  return dateObj.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function CollapseBtn({ id, isCollapsed }: { id: string; isCollapsed?: boolean }) {
  const actions = useActions();
  if (!actions.canCollapse(id)) return null;
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        actions.toggleCollapse(id);
      }}
      className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background border rounded-full p-0.5 shadow-sm hover:bg-accent z-10 text-muted-foreground transition-transform hover:scale-110"
      title={isCollapsed ? "Expand hierarchy" : "Collapse hierarchy"}
    >
      {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
    </button>
  );
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
        className="-mt-1 px-2 py-0.5 rounded-full border bg-card text-[10px] font-medium shadow-sm whitespace-nowrap relative"
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
  const actions = useActions();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (fileEvent) => {
      actions.setProfileImage(id, fileEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileRef.current) fileRef.current.value = "";
  };

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
      
      <div className="flex items-center justify-center gap-2 relative">
        <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleProfileImageChange} />
        <div 
          className="w-8 h-8 rounded-full border bg-white flex items-center justify-center relative overflow-hidden shrink-0 group cursor-pointer"
          onClick={() => fileRef.current?.click()}
          title="Click to upload picture"
        >
          {data.profileImage ? (
            <img src={data.profileImage} alt={data.label} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm opacity-50">{genderIcon[gender]}</span>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <span>{data.label}</span>
      </div>
      <MediaStrip nodeId={id} media={data.media ?? []} />
      <CollapseBtn id={id} isCollapsed={data.isCollapsed} />
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
  // A spouse added to a child has no parent, so it defaults to level 0.
  // This pass corrects that by matching the partner's level.
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

  const LEVEL_H = 240;
  const NODE_GAP = 60;
  const NODE_W = 170;
  const BOND_DY = 100;

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

    const totalW = (ordered.length - 1) * (NODE_W + NODE_GAP);
    ordered.forEach((id, i) => {
      positions.set(id, { x: i * (NODE_W + NODE_GAP) - totalW / 2, y: lvl * LEVEL_H });
    });
  });

  bonds.forEach((bondId) => {
    const parts = partnersOf.get(bondId) || [];
    const pts = parts.map((partnerId) => positions.get(partnerId)).filter(Boolean) as { x: number; y: number }[];
    if (pts.length) {
      const avgX = pts.reduce((sum, pt) => sum + pt.x, 0) / pts.length;
      const maxY = Math.max(...pts.map((pt) => pt.y));
      positions.set(bondId, { x: avgX + 30, y: maxY + BOND_DY });
    }
  });

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
        (a, b) => (positions.get(a)?.x ?? 0) - (positions.get(b)?.x ?? 0)
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
      positions.set(bondId, { x: avgX + 30, y: maxY + BOND_DY });
    }
  });

  let orphanY = 0;
  nodes.forEach((node) => {
    if (!positions.has(node.id)) {
      positions.set(node.id, { x: -400, y: orphanY });
      orphanY += 120;
    }
  });

  return nodes.map((node) => ({ ...node, position: positions.get(node.id)! }));
}

let idCounter = 100;
const nextId = () => `n${++idCounter}`;

/** Rewrite edges so any person→person edge from a partnered person is rerouted through their bond. */
function reconcile(nodes: FamilyNode[], edges: Edge[]): Edge[] {
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

function FamilyFlowInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const wrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  const commit = useCallback(
    (mutator: (currentNodes: FamilyNode[], currentEdges: Edge[]) => { nodes: FamilyNode[]; edges: Edge[] }) => {
      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          const result = mutator(currentNodes, currentEdges);
          queueMicrotask(() => setNodes(result.nodes));
          return reconcile(result.nodes, result.edges);
        });
        return currentNodes;
      });
    },
    [setNodes, setEdges],
  );

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((currentEdges) => reconcile(nodes, addEdge({ ...params, ...edgeBase } as Edge, currentEdges))),
    [setEdges, nodes],
  );

  const queries = useMemo(() => {
    const kindOf = new Map(nodes.map((node) => [node.id, node.data.kind]));
    return {
      kindOf,
      partnerBondOf: (id: string) =>
        edges.find((edge) => edge.source === id && kindOf.get(edge.target) === "bond")?.target ?? null,
      parentBondOf: (id: string) =>
        edges.find((edge) => edge.target === id && kindOf.get(edge.source) === "bond")?.source ?? null,
      directParentsOf: (id: string) =>
        edges.filter((edge) => edge.target === id && kindOf.get(edge.source) === "person").map((edge) => edge.source),
    };
  }, [nodes, edges]);

  const patch = useCallback(
    (id: string, fn: (nodeData: FamilyNodeData) => FamilyNodeData) =>
      setNodes((currentNodes) => currentNodes.map((node) => (node.id === id ? { ...node, data: fn(node.data) } : node))),
    [setNodes],
  );

  const actions: Actions = useMemo(
    () => ({
      hasPartner: (id) => !!queries.partnerBondOf(id),
      hasParent: (id) => !!queries.parentBondOf(id) || queries.directParentsOf(id).length > 0,
      updateNodeData: (id, data) => patch(id, (nodeData) => ({ ...nodeData, ...data })),
      toggleCollapse: (id) => patch(id, (nodeData) => ({ ...nodeData, isCollapsed: !nodeData.isCollapsed })),
      canCollapse: (id) => {
        const node = nodes.find((n) => n.id === id);
        if (node?.data.kind === "bond") return false;
        
        // A node can only collapse if it has at least 2 connections (incoming + outgoing)
        const incoming = edges.filter((edge) => edge.target === id).length;
        const outgoing = edges.filter((edge) => edge.source === id).length;
        return incoming + outgoing >= 2;
      },
      getParentInfo: (id) => ({
        hasBondParent: !!queries.parentBondOf(id),
        directParents: queries.directParentsOf(id),
      }),
      getNode: (id) => nodes.find((node) => node.id === id),
      rename: (id, label) => patch(id, (nodeData) => ({ ...nodeData, label })),
      setGender: (id, gender) => patch(id, (nodeData) => ({ ...nodeData, gender })),
      setProfileImage: (id, url) => patch(id, (nodeData) => ({ ...nodeData, profileImage: url })),
      setMarriageDate: (id, marriageDate) => patch(id, (nodeData) => ({ ...nodeData, marriageDate })),
      addMedia: (id, files) => {
        if (!files) return;
        const items: MediaItem[] = Array.from(files).map((f) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: mediaKindOf(f),
          url: URL.createObjectURL(f),
          name: f.name,
        }));
        patch(id, (nodeData) => ({ ...nodeData, media: [...(nodeData.media ?? []), ...items] }));
      },
      removeMedia: (id, mediaId) =>
        patch(id, (nodeData) => ({ ...nodeData, media: (nodeData.media ?? []).filter((mediaItem) => mediaItem.id !== mediaId) })),
      remove: (id) =>
        commit((currentNodes, currentEdges) => ({
          nodes: currentNodes.filter((node) => node.id !== id),
          edges: currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
        })),
      addChild: (fromId) => {
        const from = nodes.find((node) => node.id === fromId);
        if (!from) return;
        const bondId = from.data.kind === "person" ? queries.partnerBondOf(fromId) : fromId;
        const anchor = bondId ? nodes.find((node) => node.id === bondId)! : from;
        const childId = nextId();
        const child = personNode(
          childId,
          anchor.position.x + (Math.random() * 200 - 100),
          anchor.position.y + 200,
          "Child",
        );
        commit((currentNodes, currentEdges) => ({ nodes: [...currentNodes, child], edges: [...currentEdges, mkEdge(bondId ?? fromId, childId)] }));
      },
      addSpouse: (personId) => {
        if (queries.partnerBondOf(personId)) return;
        const person = nodes.find((node) => node.id === personId)!;
        const spouseId = nextId();
        const bondId = nextId();
        const spouseGender: Gender =
          person.data.gender === "male" ? "female" : person.data.gender === "female" ? "male" : "other";
        const newNodes = [
          personNode(spouseId, person.position.x + 340, person.position.y, "Spouse", spouseGender),
          bondNode(bondId, person.position.x + 180, person.position.y + 130),
        ];
        commit((currentNodes, currentEdges) => ({
          nodes: [...currentNodes, ...newNodes],
          edges: [...currentEdges, mkEdge(personId, bondId), mkEdge(spouseId, bondId)],
        }));
      },
      addParent: (personId, label) => {
        const person = nodes.find((node) => node.id === personId)!;
        const parentBond = queries.parentBondOf(personId);
        const newParentId = nextId();
        const offsetX = label === "Father" ? -180 : 180;
        const parent = personNode(
          newParentId,
          person.position.x + offsetX,
          person.position.y - 240,
          label,
          label === "Father" ? "male" : "female",
        );

        if (parentBond) {
          commit((currentNodes, currentEdges) => ({ nodes: [...currentNodes, parent], edges: [...currentEdges, mkEdge(newParentId, parentBond)] }));
          return;
        }

        const directParents = queries.directParentsOf(personId);
        if (directParents.length === 1) {
          const existingParent = directParents[0];
          const existing = nodes.find((node) => node.id === existingParent)!;
          const bondId = nextId();
          const bond = bondNode(
            bondId,
            (existing.position.x + parent.position.x) / 2 + 40,
            existing.position.y + 130,
          );
          commit((currentNodes, currentEdges) => {
            const filtered = currentEdges.filter((edge) => !(edge.source === existingParent && edge.target === personId));
            return {
              nodes: [...currentNodes, parent, bond],
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

        commit((currentNodes, currentEdges) => ({ nodes: [...currentNodes, parent], edges: [...currentEdges, mkEdge(newParentId, personId)] }));
      },
      addSibling: (personId) => {
        const parentBond = queries.parentBondOf(personId);
        const directParents = queries.directParentsOf(personId);
        const person = nodes.find((node) => node.id === personId)!;
        const source = parentBond ?? directParents[0];
        if (!source) return;
        const sibId = nextId();
        const sib = personNode(sibId, person.position.x + 200, person.position.y, "Sibling");
        commit((currentNodes, currentEdges) => ({ nodes: [...currentNodes, sib], edges: [...currentEdges, mkEdge(source, sibId)] }));
      },
    }),
    [nodes, queries, commit, patch],
  );

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const runAutoLayout = () => setNodes((currentNodes) => autoLayout(currentNodes, edges));

  const addStandalonePerson = () =>
    setNodes((currentNodes) => [...currentNodes, personNode(nextId(), 100 + Math.random() * 300, 60, "Person")]);

  const exportImage = useCallback(() => {
    fitView({ padding: 0.2, duration: 100 });
    setTimeout(() => {
      const el = document.querySelector(".react-flow__viewport") as HTMLElement || document.querySelector(".react-flow") as HTMLElement;
      if (!el) return;
      toPng(el, { backgroundColor: "#ffffff" })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = "family-tree.png";
          link.click();
        })
        .catch(console.error);
    }, 250);
  }, [fitView]);

  const exportBackup = useCallback(() => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    a.download = "family-tree.purkha.json";
    a.click();
  }, [nodes, edges]);

  const importBackup = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (fileEvent) => {
        try {
          const data = JSON.parse(fileEvent.target?.result as string);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
            setTimeout(() => setNodes((currentNodes) => autoLayout(currentNodes, data.edges)), 50);
          }
        } catch (err) {
          console.error("Failed to parse backup file", err);
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [setNodes, setEdges]
  );

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
              onClick={exportImage}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition"
            >
              Export Image
            </button>
            <button
              onClick={exportBackup}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition"
            >
              Download Tree
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-sm rounded-md border bg-background hover:bg-accent transition"
            >
              Upload Tree
            </button>
            <input
              type="file"
              accept="application/json"
              className="hidden"
              ref={fileInputRef}
              onChange={importBackup}
            />
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-sm rounded-md border border-destructive text-destructive hover:bg-destructive/10 transition"
            >
              Clear
            </button>
          </div>
        </header>

        <div ref={wrapper} className="flex-1 relative">
          {(() => {
            const hiddenNodeIds = new Set<string>();
            const collapsed = nodes.filter(node => node.data.isCollapsed).map(node => node.id);
            
            // Build source→target adjacency for downward traversal
            const adjacency = new Map<string, string[]>();
            edges.forEach(edge => {
              adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge.target]);
            });

            // Build person→bond and bond→person[] maps for spouse lookup
            const kindOf = new Map(nodes.map(node => [node.id, node.data.kind]));
            const personToBonds = new Map<string, string[]>();
            const bondToPartners = new Map<string, string[]>();
            edges.forEach(edge => {
              if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
                personToBonds.set(edge.source, [...(personToBonds.get(edge.source) || []), edge.target]);
                bondToPartners.set(edge.target, [...(bondToPartners.get(edge.target) || []), edge.source]);
              }
            });

            // When a person is collapsed: hide spouse, bond, and all children below.
            // Only the collapsed node itself stays visible.
            // A node can only collapse if it has an incoming (top) edge.
            const collapsedSet = new Set(collapsed); // protect these from being hidden
            const seedIds: string[] = [];
            collapsed.forEach(collapsedId => {
              const kind = kindOf.get(collapsedId);
              if (kind === "person") {
                // Hide spouse(s) and bond(s) at the same level
                const myBonds = personToBonds.get(collapsedId) || [];
                myBonds.forEach(bondId => {
                  seedIds.push(bondId); // hide the bond
                  // hide the partner(s)
                  (bondToPartners.get(bondId) || []).forEach(partner => {
                    if (partner !== collapsedId) seedIds.push(partner);
                  });
                  // hide the bond's children
                  (adjacency.get(bondId) || []).forEach(childId => {
                    seedIds.push(childId);
                  });
                });
                // Also hide direct person→person children (no bond)
                (adjacency.get(collapsedId) || []).forEach(targetId => {
                  if (kindOf.get(targetId) === "person") {
                    seedIds.push(targetId);
                  }
                });
              } else if (kind === "bond") {
                // Collapsed bond: hide its children
                (adjacency.get(collapsedId) || []).forEach(childId => {
                  seedIds.push(childId);
                });
              }
            });

            // Add all seeds to hidden set (but never hide a collapsed node)
            seedIds.forEach(id => {
              if (!collapsedSet.has(id)) hiddenNodeIds.add(id);
            });

            // BFS from seeds: hide everything downstream + spouses of hidden nodes
            const queue = seedIds.filter(id => hiddenNodeIds.has(id));
            while (queue.length > 0) {
              const curr = queue.shift()!;
              // Follow all outgoing edges
              (adjacency.get(curr) || []).forEach(targetId => {
                if (!hiddenNodeIds.has(targetId) && !collapsedSet.has(targetId)) {
                  hiddenNodeIds.add(targetId);
                  queue.push(targetId);
                }
              });
              // If a hidden person, also hide their spouse(s) and bond(s)
              if (kindOf.get(curr) === "person") {
                (personToBonds.get(curr) || []).forEach(bondId => {
                  if (!hiddenNodeIds.has(bondId) && !collapsedSet.has(bondId)) {
                    hiddenNodeIds.add(bondId);
                    queue.push(bondId);
                  }
                  (bondToPartners.get(bondId) || []).forEach(partner => {
                    if (partner !== curr && !hiddenNodeIds.has(partner) && !collapsedSet.has(partner)) {
                      hiddenNodeIds.add(partner);
                      queue.push(partner);
                    }
                  });
                });
              }
            }

            const renderNodes = nodes.map(node => ({ ...node, hidden: hiddenNodeIds.has(node.id) }));
            const renderEdges = edges.map(edge => ({ ...edge, hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target) }));

            return (
              <ReactFlow
                nodes={renderNodes}
                edges={renderEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={(changes) => {
                  onEdgesChange(changes);
                  queueMicrotask(() => setEdges((currentEdges) => reconcile(nodes, currentEdges)));
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
            );
          })()}
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
