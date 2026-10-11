import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import {
  SlidersHorizontal,
  Sparkles,
  Maximize2,
  Save,
  Download,
  Crown,
  Plus,
  ChevronDown,
  ChevronRight,
  FolderDown,
  Upload,
  Trash2,
} from "lucide-react";

import type { FamilyNode, FamilyNodeData, Gender, Actions, MediaItem, BondStatus, ChildRelation } from "./types";
import { ActionsContext } from "./ActionsContext";
import { autoLayout } from "./auto-layout";
import { reconcile } from "./reconcile";
import { edgeBase, personNode, bondNode, mkEdge, nextId } from "./factories";
import { initialNodes, initialEdges, nepalNodes, nepalEdges } from "./demo-data";
import { mediaKindOf } from "./utils";
import { PersonNodeView } from "./nodes/PersonNode";
import { BondNodeView } from "./nodes/BondNode";
import { FamilyEdge } from "./edges/FamilyEdge";
import { TreeView } from "./tree-view/TreeView";
import { BuilderSidebar } from "./BuilderSidebar";
import { computeGenerations, toneFor, generationLabel } from "./generations";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

const nodeTypes = { family: PersonNodeView, bond: BondNodeView };
const edgeTypes = { familyEdge: FamilyEdge };

export default function FamilyFlowInner({
  initialNodes: propNodes,
  initialEdges: propEdges,
  treeId,
  treeName,
}: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNode>(propNodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(propEdges || initialEdges);
  const wrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView, setCenter } = useReactFlow();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [flowName, setFlowName] = useState(treeName || "हाम्रो पुर्खा वंशावली");
  const [isSavingFlow, setIsSavingFlow] = useState(false);
  const [currentTreeId, setCurrentTreeId] = useState<string | null>(treeId || null);
  const [activeSpouses, setActiveSpouses] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"graph" | "tree">("graph");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    if (propNodes && propEdges) {
      setNodes(propNodes);
      setEdges(propEdges);
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    }
  }, [propNodes, propEdges, setNodes, setEdges, fitView]);

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
      setNodes((currentNodes) =>
        currentNodes.map((node) => (node.id === id ? { ...node, data: fn(node.data) } : node)),
      ),
    [setNodes],
  );

  const actions: Actions = useMemo(
    () => ({
      hasPartner: (id) => !!queries.partnerBondOf(id),
      hasParent: (id) => !!queries.parentBondOf(id) || queries.directParentsOf(id).length > 0,
      updateNodeData: (id, data) => patch(id, (nodeData) => ({ ...nodeData, ...data })),
      toggleCollapse: (id) =>
        patch(id, (nodeData) => ({ ...nodeData, isCollapsed: !nodeData.isCollapsed })),
      canCollapse: (id) => {
        const node = nodes.find((n) => n.id === id);
        if (!node) return false;
        if (node.data.kind === "bond") {
          return edges.some((e) => e.source === id && queries.kindOf.get(e.target) === "person");
        }
        const myBonds = edges
          .filter((e) => e.source === id && queries.kindOf.get(e.target) === "bond")
          .map((e) => e.target);
        const hasBondKids = edges.some(
          (e) => myBonds.includes(e.source) && queries.kindOf.get(e.target) === "person",
        );
        const hasDirectKids = edges.some(
          (e) => e.source === id && queries.kindOf.get(e.target) === "person",
        );
        return hasBondKids || hasDirectKids;
      },
      getParentInfo: (id) => ({
        hasBondParent: !!queries.parentBondOf(id),
        directParents: queries.directParentsOf(id),
      }),
      getNode: (id) => nodes.find((node) => node.id === id),
      setActiveSpouse: (personId, bondId) => setActiveSpouses((prev) => ({ ...prev, [personId]: bondId })),
      getSpouses: (personId) => {
        const bondIds = edges
          .filter((e) => e.source === personId && queries.kindOf.get(e.target) === "bond")
          .map((e) => e.target);
        return bondIds
          .map((bondId) => {
            const spouseId = edges.find((e) => e.target === bondId && e.source !== personId)?.source;
            return { bondId, spouseNode: spouseId ? nodes.find((n) => n.id === spouseId)! : undefined! };
          })
          .filter((s) => s.spouseNode);
      },
      getActiveSpouse: (personId) => {
        const spouses = edges
          .filter((e) => e.source === personId && queries.kindOf.get(e.target) === "bond")
          .map((e) => e.target);
        if (spouses.length === 0) return undefined;
        return activeSpouses[personId] && spouses.includes(activeSpouses[personId])
          ? activeSpouses[personId]
          : spouses[0];
      },
      rename: (id, label) => patch(id, (nodeData) => ({ ...nodeData, label })),
      setGender: (id, gender) => patch(id, (nodeData) => ({ ...nodeData, gender })),
      setProfileImage: (id, url) => patch(id, (nodeData) => ({ ...nodeData, profileImage: url })),
      setMarriageDate: (id, marriageDate) => patch(id, (nodeData) => ({ ...nodeData, marriageDate })),
      setDivorceDate: (id, divorceDate) => patch(id, (nodeData) => ({ ...nodeData, divorceDate })),
      setBondStatus: (id, bondStatus) => patch(id, (nodeData) => ({ ...nodeData, bondStatus })),
      setChildRelation: (edgeId, relation) => {
        setEdges((currentEdges) =>
          currentEdges.map((edge) =>
            edge.id === edgeId ? { ...edge, data: { ...edge.data, childRelation: relation } } : edge,
          ),
        );
      },
      getChildRelation: (edgeId) => {
        const edge = edges.find((e) => e.id === edgeId);
        return ((edge?.data as any)?.childRelation as ChildRelation) || "biological";
      },
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
        patch(id, (nodeData) => ({
          ...nodeData,
          media: (nodeData.media ?? []).filter((mediaItem) => mediaItem.id !== mediaId),
        })),
      remove: (id) =>
        commit((currentNodes, currentEdges) => ({
          nodes: currentNodes.filter((node) => node.id !== id),
          edges: currentEdges.filter((edge) => edge.source !== id && edge.target !== id),
        })),
      addChild: (fromId, relation) => {
        const from = nodes.find((node) => node.id === fromId);
        if (!from) return;
        const bondId = from.data.kind === "person" ? queries.partnerBondOf(fromId) : fromId;
        const anchor = bondId ? nodes.find((node) => node.id === bondId)! : from;
        const childId = nextId();
        const child = personNode(
          childId,
          anchor.position.x + (Math.random() * 200 - 100),
          anchor.position.y + 280,
          relation && relation !== "biological"
            ? `${relation.charAt(0).toUpperCase() + relation.slice(1)} Child`
            : "Child (सन्तान)",
        );
        commit((currentNodes, currentEdges) => ({
          nodes: [...currentNodes, child],
          edges: [...currentEdges, mkEdge(bondId ?? fromId, childId, relation)],
        }));
      },
      addSpouse: (personId) => {
        const person = nodes.find((node) => node.id === personId)!;
        const spouseId = nextId();
        const bId = nextId();
        const spouseGender: Gender =
          person.data.gender === "male" ? "female" : person.data.gender === "female" ? "male" : "other";
        const newNodes = [
          personNode(spouseId, person.position.x + 360, person.position.y, "Spouse (दम्पती)", spouseGender),
          bondNode(bId, person.position.x + 180, person.position.y + 90),
        ];
        commit((currentNodes, currentEdges) => ({
          nodes: [...currentNodes, ...newNodes],
          edges: [...currentEdges, mkEdge(personId, bId), mkEdge(spouseId, bId)],
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
          person.position.y - 280,
          label === "Father" ? "Father (बुवा)" : "Mother (आमा)",
          label === "Father" ? "male" : "female",
        );

        if (parentBond) {
          commit((currentNodes, currentEdges) => ({
            nodes: [...currentNodes, parent],
            edges: [...currentEdges, mkEdge(newParentId, parentBond)],
          }));
          return;
        }

        const directParents = queries.directParentsOf(personId);
        if (directParents.length === 1) {
          const existingParent = directParents[0];
          const existing = nodes.find((node) => node.id === existingParent)!;
          const bId = nextId();
          const bond = bondNode(
            bId,
            (existing.position.x + parent.position.x) / 2 + 40,
            existing.position.y + 90,
          );
          commit((currentNodes, currentEdges) => {
            const filtered = currentEdges.filter(
              (edge) => !(edge.source === existingParent && edge.target === personId),
            );
            return {
              nodes: [...currentNodes, parent, bond],
              edges: [
                ...filtered,
                mkEdge(existingParent, bId),
                mkEdge(newParentId, bId),
                mkEdge(bId, personId),
              ],
            };
          });
          return;
        }

        commit((currentNodes, currentEdges) => ({
          nodes: [...currentNodes, parent],
          edges: [...currentEdges, mkEdge(newParentId, personId)],
        }));
      },
      addSibling: (personId) => {
        const parentBond = queries.parentBondOf(personId);
        const directParents = queries.directParentsOf(personId);
        const person = nodes.find((node) => node.id === personId)!;
        const source = parentBond ?? directParents[0];
        if (!source) return;
        const sibId = nextId();
        const sib = personNode(sibId, person.position.x + 260, person.position.y, "Sibling (दाजुभाइ/दिदीबहिनी)");
        commit((currentNodes, currentEdges) => ({
          nodes: [...currentNodes, sib],
          edges: [...currentEdges, mkEdge(source, sibId)],
        }));
      },
    }),
    [nodes, edges, queries, commit, patch],
  );

  const clearAll = () => {
    setNodes([]);
    setEdges([]);
  };

  const loadNepalKings = () => {
    setNodes(nepalNodes);
    setEdges(nepalEdges);
    setTimeout(() => {
      setNodes((cur) => autoLayout(cur, nepalEdges));
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    }, 60);
    toast.success("Loaded Royal Shah Dynasty Lineage");
  };

  const runAutoLayout = () => {
    setNodes((currentNodes) => autoLayout(currentNodes, edges));
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    toast.success("Vamshavali laid out hierarchically");
  };

  const expandAll = () => {
    setNodes((cur) => cur.map((n) => ({ ...n, data: { ...n.data, isCollapsed: false } })));
    setTimeout(() => {
      setNodes((cur) => autoLayout(cur, edges));
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    }, 60);
    toast.success("Expanded all generations");
  };

  const collapseAll = () => {
    const kindOf = new Map(nodes.map((n) => [n.id, n.data.kind]));
    const hasKids = new Set<string>();
    edges.forEach((e) => {
      if (kindOf.get(e.target) === "person") {
        hasKids.add(e.source);
      }
    });
    setNodes((cur) =>
      cur.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isCollapsed: hasKids.has(n.id) || n.data.kind === "bond",
        },
      })),
    );
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 80);
    toast.success("Collapsed branches to root generation");
  };

  const addStandalonePerson = () =>
    setNodes((currentNodes) => [
      ...currentNodes,
      personNode(nextId(), 100 + Math.random() * 200, 60, "Root Ancestor (मुल पुरुष/महिला)"),
    ]);

  const onCenterNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setCenter(node.position.x + 120, node.position.y + 60, { zoom: 1.15, duration: 400 });
    }
  };

  const exportImage = useCallback(() => {
    fitView({ padding: 0.2, duration: 100 });
    setTimeout(() => {
      const el =
        (document.querySelector(".react-flow__viewport") as HTMLElement) ||
        (document.querySelector(".react-flow") as HTMLElement);
      if (!el) return;
      toPng(el, { backgroundColor: "#FFFAF2" })
        .then((dataUrl) => {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `${flowName.replace(/\s+/g, "-")}-purkha.png`;
          link.click();
          toast.success("Exported lineage image");
        })
        .catch(console.error);
    }, 250);
  }, [fitView, flowName]);

  const exportBackup = useCallback(() => {
    const data = JSON.stringify({ nodes, edges, name: flowName }, null, 2);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    a.download = `${flowName.replace(/\s+/g, "-")}.purkha.json`;
    a.click();
    toast.success("Downloaded local JSON backup");
  }, [nodes, edges, flowName]);

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
            if (data.name) setFlowName(data.name);
            setTimeout(() => setNodes((currentNodes) => autoLayout(currentNodes, data.edges)), 50);
            toast.success("Loaded backup successfully");
          }
        } catch (err) {
          console.error("Failed to parse backup file", err);
          toast.error("Invalid backup file");
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [setNodes, setEdges],
  );

  const saveFlowToCloud = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to save.");
      return;
    }
    if (!flowName.trim()) {
      toast.error("Please enter a name for the vamshavali.");
      return;
    }

    setIsSavingFlow(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        id: currentTreeId,
        name: flowName.trim(),
        data: { nodes, edges },
      };

      const res = await fetch("/api/trees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save flow");
      const data = await res.json();
      setCurrentTreeId(data.id);
      setIsSaveModalOpen(false);
      toast.success("Vamshavali saved to PURKHA cloud!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save flow");
    } finally {
      setIsSavingFlow(false);
    }
  };

  const selectedNode = useMemo(
    () => (selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [nodes, selectedNodeId],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <div className="w-full h-full flex flex-col bg-surface relative overflow-hidden">
        {/* ── Studio Top Toolbar ────────────────────────────────────────── */}
        <header className="h-14 border-b border-lokta-border bg-surface-bright/95 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 gap-3">
          {/* Left: Title & Mode Switcher */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="material-symbols-outlined text-sindoor text-xl shrink-0">account_tree</span>
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="font-headline font-bold text-sm md:text-base text-himal bg-transparent border-b border-transparent hover:border-outline focus:border-sindoor focus:outline-none px-1 py-0.5 truncate max-w-[180px] md:max-w-[260px]"
                title="Click to rename Vamshavali"
              />
            </div>

            <div className="hidden sm:flex items-center p-0.5 bg-surface-container-low rounded-lg border border-outline-variant">
              <button
                onClick={() => setViewMode("graph")}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold tracking-wider transition-colors uppercase ${
                  viewMode === "graph"
                    ? "bg-himal text-lokta-light shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Canvas
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-2.5 py-1 text-xs rounded-md font-semibold tracking-wider transition-colors uppercase ${
                  viewMode === "tree"
                    ? "bg-himal text-lokta-light shadow-xs"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Lineage
              </button>
            </div>
          </div>

          {/* Right: Studio Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {nodes.length === 0 && (
              <button
                onClick={addStandalonePerson}
                className="px-3 py-1.5 rounded-lg bg-sindoor hover:bg-sindoor-deep text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Root</span>
              </button>
            )}

            <button
              onClick={runAutoLayout}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface transition-colors uppercase tracking-wider"
              title="Organise nodes hierarchically by generation"
            >
              <Sparkles className="w-3.5 h-3.5 text-sayapatri" />
              <span>Layout</span>
            </button>

            <button
              onClick={expandAll}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface transition-colors"
              title="Expand all branches"
            >
              <ChevronDown className="w-3.5 h-3.5 text-sindoor" />
              <span>Expand All</span>
            </button>

            <button
              onClick={collapseAll}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface transition-colors"
              title="Collapse branches to roots"
            >
              <ChevronRight className="w-3.5 h-3.5 text-himal" />
              <span>Collapse Roots</span>
            </button>

            <button
              onClick={() => fitView({ padding: 0.2, duration: 400 })}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors border border-outline-variant/60"
              title="Fit View on Canvas"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-himal hover:bg-himal-light text-lokta-light text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={exportImage}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface transition-colors"
              title="Export high-resolution PNG image"
            >
              <FolderDown className="w-3.5 h-3.5 text-himal" />
              <span className="hidden md:inline">Export</span>
            </button>

            {/* Studio Sidebar Inspector Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all uppercase tracking-wider ${
                isSidebarOpen
                  ? "bg-sindoor text-white border-sindoor shadow-xs"
                  : "bg-surface-container-low hover:bg-surface-container border-outline-variant text-himal"
              }`}
              title="Toggle Vamshavali Studio Inspector"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isSidebarOpen ? "Close Panel" : "Studio"}</span>
            </button>
          </div>
        </header>

        {/* ── Main Canvas + Collapsible Inspector Area ────────────────── */}
        <div className="flex-1 flex overflow-hidden relative">
          <div ref={wrapper} className="flex-1 relative lokta-texture overflow-hidden">
            {(() => {
              const kindOf = new Map(nodes.map((node) => [node.id, node.data.kind]));
              const generationMap = computeGenerations(nodes, edges);

              const personToBonds = new Map<string, string[]>();
              const bondToPartners = new Map<string, string[]>();
              const adjacency = new Map<string, string[]>();

              edges.forEach((edge) => {
                adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge.target]);
                if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
                  personToBonds.set(edge.source, [...(personToBonds.get(edge.source) || []), edge.target]);
                  bondToPartners.set(edge.target, [...(bondToPartners.get(edge.target) || []), edge.source]);
                }
              });

              // Compute children count for every node
              const childrenCountMap = new Map<string, number>();
              nodes.forEach((n) => {
                if (n.data.kind === "bond") {
                  const count = edges.filter((e) => e.source === n.id && kindOf.get(e.target) === "person").length;
                  childrenCountMap.set(n.id, count);
                } else {
                  const myBonds = personToBonds.get(n.id) || [];
                  const bondKids = edges
                    .filter((e) => myBonds.includes(e.source) && kindOf.get(e.target) === "person")
                    .map((e) => e.target);
                  const directKids = edges
                    .filter((e) => e.source === n.id && kindOf.get(e.target) === "person")
                    .map((e) => e.target);
                  childrenCountMap.set(n.id, new Set([...bondKids, ...directKids]).size);
                }
              });

              // ── Collapsible Descendant Filtering ──────────────────────────
              const hiddenNodeIds = new Set<string>();
              const collapsed = nodes.filter((node) => node.data.isCollapsed).map((node) => node.id);

              const seedIds: string[] = [];
              collapsed.forEach((collapsedId) => {
                const kind = kindOf.get(collapsedId);
                if (kind === "person") {
                  // Only hide children descending from this person! Spouses and bonds remain visible!
                  const myBonds = personToBonds.get(collapsedId) || [];
                  myBonds.forEach((bondId) => {
                    (adjacency.get(bondId) || []).forEach((childId) => {
                      seedIds.push(childId);
                    });
                  });
                  (adjacency.get(collapsedId) || []).forEach((targetId) => {
                    if (kindOf.get(targetId) === "person") {
                      seedIds.push(targetId);
                    }
                  });
                } else if (kind === "bond") {
                  // Hide children of this bond. Both married partners remain visible!
                  (adjacency.get(collapsedId) || []).forEach((childId) => {
                    seedIds.push(childId);
                  });
                }
              });

              seedIds.forEach((id) => hiddenNodeIds.add(id));

              // Queue to recursively hide children's downstream subtrees
              const queue = [...seedIds];
              while (queue.length > 0) {
                const curr = queue.shift()!;
                (adjacency.get(curr) || []).forEach((targetId) => {
                  if (!hiddenNodeIds.has(targetId)) {
                    hiddenNodeIds.add(targetId);
                    queue.push(targetId);
                  }
                });
                if (kindOf.get(curr) === "person") {
                  (personToBonds.get(curr) || []).forEach((bondId) => {
                    if (!hiddenNodeIds.has(bondId)) {
                      hiddenNodeIds.add(bondId);
                      queue.push(bondId);
                    }
                    (bondToPartners.get(bondId) || []).forEach((partner) => {
                      if (partner !== curr && !hiddenNodeIds.has(partner)) {
                        hiddenNodeIds.add(partner);
                        queue.push(partner);
                      }
                    });
                  });
                }
              }

              // Active spouse filtering (for poly-marriage view)
              personToBonds.forEach((bondIds, personId) => {
                if (bondIds.length > 1) {
                  let activeBond = activeSpouses[personId];
                  if (!activeBond || !bondIds.includes(activeBond)) {
                    activeBond = bondIds[0];
                  }
                  bondIds.forEach((bId) => {
                    if (bId !== activeBond) {
                      hiddenNodeIds.add(bId);
                      (bondToPartners.get(bId) || []).forEach((partner) => {
                        if (partner !== personId) {
                          hiddenNodeIds.add(partner);
                        }
                      });
                      (adjacency.get(bId) || []).forEach((kidId) => {
                        hiddenNodeIds.add(kidId);
                      });
                    }
                  });
                }
              });

              const nodeToParentBond = new Map<string, string>();
              const nodeToChildRelation = new Map<string, ChildRelation>();
              edges.forEach((edge) => {
                if (kindOf.get(edge.source) === "bond" && kindOf.get(edge.target) === "person") {
                  nodeToParentBond.set(edge.target, edge.source);
                  nodeToChildRelation.set(
                    edge.target,
                    ((edge.data as any)?.childRelation as ChildRelation) || "biological",
                  );
                }
              });

              const renderNodes = nodes.map((node) => ({
                ...node,
                data: {
                  ...node.data,
                  generation: generationMap.get(node.id) ?? 0,
                  childrenCount: childrenCountMap.get(node.id) ?? 0,
                  parentBond: nodeToParentBond.get(node.id),
                  childRelation: nodeToChildRelation.get(node.id) || "biological",
                },
                hidden: hiddenNodeIds.has(node.id),
              }));

              const renderEdges = edges.map((edge) => ({
                ...edge,
                hidden: hiddenNodeIds.has(edge.source) || hiddenNodeIds.has(edge.target),
              }));

              if (viewMode === "tree") {
                return (
                  <div className="absolute inset-0 bg-surface">
                    <TreeView nodes={renderNodes as any} edges={renderEdges as any} />
                  </div>
                );
              }

              return (
                <ReactFlow
                  nodes={renderNodes}
                  edges={renderEdges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={(changes) => {
                    onEdgesChange(changes);
                    queueMicrotask(() => setEdges((currentEdges) => reconcile(nodes, currentEdges)));
                  }}
                  onNodeClick={(_, node) => setSelectedNodeId(node.id)}
                  onPaneClick={() => setSelectedNodeId(null)}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  panOnDrag={true}
                  panOnScroll={true}
                  zoomOnScroll={false}
                  zoomOnPinch={true}
                  zoomOnDoubleClick={false}
                  minZoom={0.15}
                  maxZoom={2.5}
                  deleteKeyCode={["Delete", "Backspace"]}
                  proOptions={{ hideAttribution: true }}
                  className="z-10"
                >
                  {/* Canvas Zoom & Pan Controls */}
                  <Controls
                    position="bottom-left"
                    showInteractive={false}
                    className="floating-ui border border-outline-variant/60 bg-surface-bright/95 backdrop-blur-md rounded-xl shadow-lg p-1"
                  />

                  {/* Canvas MiniMap with Lokta / Heritage Colors */}
                  <MiniMap
                    position="bottom-right"
                    nodeStrokeWidth={3}
                    nodeColor={(n: any) => {
                      if (n.data?.kind === "bond") return "#D48F0B";
                      return toneFor(n.data?.generation).base;
                    }}
                    nodeStrokeColor={(n: any) => {
                      if (n.data?.kind === "bond") return "#8A5A00";
                      return toneFor(n.data?.generation).deep;
                    }}
                    maskColor="rgba(247, 238, 221, 0.7)"
                    className="border border-lokta-border rounded-xl shadow-lg bg-surface-container-low hidden sm:block"
                    zoomable
                    pannable
                  />
                </ReactFlow>
              );
            })()}
          </div>

          {/* ── Collapsible Studio Sidebar Inspector ──────────────────── */}
          <BuilderSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={(id) => setSelectedNodeId(id)}
            onCenterNode={onCenterNode}
            onAutoLayout={runAutoLayout}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
            onSaveFlow={() => setIsSaveModalOpen(true)}
            onExportImage={exportImage}
            onLoadNepalKings={loadNepalKings}
            onAddRoot={addStandalonePerson}
          />
        </div>

        {/* ── Cloud Save Modal ────────────────────────────────────────── */}
        {isSaveModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface-bright rounded-2xl p-6 shadow-2xl w-full max-w-md border border-lokta-border">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-devanagari text-sindoor font-bold text-sm">पुर्खा वंशावली भण्डारण</span>
              </div>
              <h2 className="font-headline text-2xl text-himal font-bold mb-2">Save Vamshavali</h2>
              <p className="font-body text-xs text-on-surface-variant mb-5 leading-relaxed">
                Save your visual family lineage securely to your account so you can continue building on any device.
              </p>
              <div className="space-y-1.5 mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-himal font-label-sm">
                  Vamshavali Name (वंशावली नाम)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bhandari Vamshavali, Royal Lineage"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant py-2.5 px-3.5 rounded-xl text-sm font-medium focus:outline-none focus:border-sindoor"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSaveModalOpen(false)}
                  disabled={isSavingFlow}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveFlowToCloud}
                  disabled={isSavingFlow}
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-sindoor hover:bg-sindoor-deep text-white shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSavingFlow ? "Saving to Cloud..." : "Save Vamshavali"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ActionsContext.Provider>
  );
}
