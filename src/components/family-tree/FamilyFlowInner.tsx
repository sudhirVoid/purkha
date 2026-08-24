import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Edge,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";

import type { FamilyNode, FamilyNodeData, Gender, Actions, MediaItem } from "./types";
import { ActionsContext } from "./ActionsContext";
import { autoLayout } from "./auto-layout";
import { reconcile } from "./reconcile";
import { edgeBase, personNode, bondNode, mkEdge, nextId } from "./factories";
import { initialNodes, initialEdges, nepalNodes, nepalEdges } from "./demo-data";
import { mediaKindOf } from "./utils";
import { PersonNodeView } from "./nodes/PersonNode";
import { BondNodeView } from "./nodes/BondNode";
import { FamilyEdge } from "./edges/FamilyEdge";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

const nodeTypes = { family: PersonNodeView, bond: BondNodeView };
const edgeTypes = { familyEdge: FamilyEdge };

export default function FamilyFlowInner({ initialNodes: propNodes, initialEdges: propEdges, treeId, treeName }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FamilyNode>(propNodes || initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(propEdges || initialEdges);
  const wrapper = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [flowName, setFlowName] = useState(treeName || "");
  const [isSavingFlow, setIsSavingFlow] = useState(false);
  const [currentTreeId, setCurrentTreeId] = useState<string | null>(treeId || null);

  useEffect(() => {
    if (propNodes && propEdges) {
      setNodes(propNodes);
      setEdges(propEdges);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
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
        const bId = nextId();
        const spouseGender: Gender =
          person.data.gender === "male" ? "female" : person.data.gender === "female" ? "male" : "other";
        const newNodes = [
          personNode(spouseId, person.position.x + 340, person.position.y, "Spouse", spouseGender),
          bondNode(bId, person.position.x + 180, person.position.y + 130),
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
          const bId = nextId();
          const bond = bondNode(
            bId,
            (existing.position.x + parent.position.x) / 2 + 40,
            existing.position.y + 130,
          );
          commit((currentNodes, currentEdges) => {
            const filtered = currentEdges.filter((edge) => !(edge.source === existingParent && edge.target === personId));
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

  const loadNepalKings = () => {
    setNodes(nepalNodes);
    setEdges(nepalEdges);
    setTimeout(() => {
      setNodes((cur) => autoLayout(cur, nepalEdges));
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
    }, 50);
  };

  const runAutoLayout = () => {
    setNodes((currentNodes) => autoLayout(currentNodes, edges));
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  };

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
    [setNodes, setEdges],
  );

  const saveFlowToCloud = async () => {
    if (!auth.currentUser) {
      toast.error("You must be logged in to save.");
      return;
    }
    if (!flowName.trim()) {
      toast.error("Please enter a name for the flow.");
      return;
    }

    setIsSavingFlow(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        id: currentTreeId,
        name: flowName.trim(),
        data: { nodes, edges }
      };

      const res = await fetch("/api/trees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save flow");
      const data = await res.json();
      setCurrentTreeId(data.id);
      setIsSaveModalOpen(false);
      toast.success("Flow saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save flow");
    } finally {
      setIsSavingFlow(false);
    }
  };

  return (
    <ActionsContext.Provider value={actions}>
      <div className="w-full h-full flex flex-col bg-transparent relative">
        {/* Central Add Action */}
        <div className="absolute top-8 right-8 z-30 flex space-x-2">
          {nodes.length === 0 && (
            <button onClick={addStandalonePerson} className="terracotta-btn px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
              <span className="material-symbols-outlined">account_tree</span>
              <span className="font-label-sm uppercase tracking-wider">Add Root Ancestor</span>
            </button>
          )}

          {/* Utility buttons */}
          <div className="floating-ui bg-surface-bright/90 rounded-full flex p-1 border border-outline-variant ml-4">
            <button onClick={runAutoLayout} className="px-3 py-1 text-xs rounded-full hover:bg-surface-container-high transition-colors font-label-sm uppercase">Auto Layout</button>
            <button onClick={loadNepalKings} className="px-3 py-1 text-xs rounded-full hover:bg-surface-container-high transition-colors font-label-sm uppercase">King Of Nepal</button>
            <button onClick={exportImage} className="px-3 py-1 text-xs rounded-full hover:bg-surface-container-high transition-colors font-label-sm uppercase">Export Image</button>
            <button onClick={() => setIsSaveModalOpen(true)} className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-label-sm uppercase font-bold">Save Flow</button>
            <button onClick={exportBackup} className="px-3 py-1 text-xs rounded-full hover:bg-surface-container-high transition-colors font-label-sm uppercase">Local Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1 text-xs rounded-full hover:bg-surface-container-high transition-colors font-label-sm uppercase">Load</button>
            <button onClick={clearAll} className="px-3 py-1 text-xs rounded-full hover:bg-error-container text-error transition-colors font-label-sm uppercase">Clear</button>
            <input type="file" accept="application/json" className="hidden" ref={fileInputRef} onChange={importBackup} />
          </div>
        </div>

        <div ref={wrapper} className="flex-1 relative lokta-texture">
          {(() => {
            const hiddenNodeIds = new Set<string>();
            const collapsed = nodes.filter(node => node.data.isCollapsed).map(node => node.id);

            const adjacency = new Map<string, string[]>();
            edges.forEach(edge => {
              adjacency.set(edge.source, [...(adjacency.get(edge.source) || []), edge.target]);
            });

            const kindOf = new Map(nodes.map(node => [node.id, node.data.kind]));
            const personToBonds = new Map<string, string[]>();
            const bondToPartners = new Map<string, string[]>();
            edges.forEach(edge => {
              if (kindOf.get(edge.source) === "person" && kindOf.get(edge.target) === "bond") {
                personToBonds.set(edge.source, [...(personToBonds.get(edge.source) || []), edge.target]);
                bondToPartners.set(edge.target, [...(bondToPartners.get(edge.target) || []), edge.source]);
              }
            });

            const collapsedSet = new Set(collapsed);
            const seedIds: string[] = [];
            collapsed.forEach(collapsedId => {
              const kind = kindOf.get(collapsedId);
              if (kind === "person") {
                const myBonds = personToBonds.get(collapsedId) || [];
                myBonds.forEach(bondId => {
                  seedIds.push(bondId);
                  (bondToPartners.get(bondId) || []).forEach(partner => {
                    if (partner !== collapsedId) seedIds.push(partner);
                  });
                  (adjacency.get(bondId) || []).forEach(childId => {
                    seedIds.push(childId);
                  });
                });
                (adjacency.get(collapsedId) || []).forEach(targetId => {
                  if (kindOf.get(targetId) === "person") {
                    seedIds.push(targetId);
                  }
                });
              } else if (kind === "bond") {
                (adjacency.get(collapsedId) || []).forEach(childId => {
                  seedIds.push(childId);
                });
              }
            });

            seedIds.forEach(id => {
              if (!collapsedSet.has(id)) hiddenNodeIds.add(id);
            });

            const queue = seedIds.filter(id => hiddenNodeIds.has(id));
            while (queue.length > 0) {
              const curr = queue.shift()!;
              (adjacency.get(curr) || []).forEach(targetId => {
                if (!hiddenNodeIds.has(targetId) && !collapsedSet.has(targetId)) {
                  hiddenNodeIds.add(targetId);
                  queue.push(targetId);
                }
              });
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
                edgeTypes={edgeTypes}
                fitView
                deleteKeyCode={["Delete"]}
                proOptions={{ hideAttribution: true }}
                className="z-10"
              >
                <Controls position="bottom-right" className="floating-ui border border-outline-variant bg-surface-bright/90" showInteractive={false} />
              </ReactFlow>
            );
          })()}
        </div>

        {isSaveModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-scrim/50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl p-6 shadow-xl w-full max-w-sm border border-outline-variant">
              <h2 className="font-title-lg text-on-surface mb-4">Save Family Flow</h2>
              <input
                type="text"
                placeholder="Name your family tree (e.g., Royal Lineage)"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline py-2 px-4 rounded-lg focus:outline-none focus:border-primary mb-6"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsSaveModalOpen(false)}
                  disabled={isSavingFlow}
                  className="px-4 py-2 rounded-full font-label-sm hover:bg-surface-container-highest text-on-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveFlowToCloud}
                  disabled={isSavingFlow}
                  className="px-6 py-2 rounded-full font-label-sm bg-primary text-on-primary hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSavingFlow ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ActionsContext.Provider>
  );
}
