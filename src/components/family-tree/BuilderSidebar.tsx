import { useState, useMemo } from "react";
import {
  Users,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Maximize2,
  FolderDown,
  Save,
  Plus,
  UserPlus,
  Heart,
  Calendar,
  MapPin,
  X,
  SlidersHorizontal,
  Crown,
} from "lucide-react";
import type { FamilyNode } from "./types";
import { toneFor, generationLabel, GENERATION_TONES } from "./generations";
import { genderIcon, genderLabel } from "./constants";

type BuilderSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  nodes: FamilyNode[];
  selectedNode: FamilyNode | null;
  onSelectNode: (nodeId: string) => void;
  onCenterNode: (nodeId: string) => void;
  onAutoLayout: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onSaveFlow: () => void;
  onExportImage: () => void;
  onLoadNepalKings: () => void;
  onAddRoot: () => void;
};

export function BuilderSidebar({
  isOpen,
  onClose,
  nodes,
  selectedNode,
  onSelectNode,
  onCenterNode,
  onAutoLayout,
  onExpandAll,
  onCollapseAll,
  onSaveFlow,
  onExportImage,
  onLoadNepalKings,
  onAddRoot,
}: BuilderSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"inspector" | "generations" | "search">("inspector");

  const personNodes = useMemo(() => nodes.filter((n) => n.data.kind === "person"), [nodes]);
  const bondNodes = useMemo(() => nodes.filter((n) => n.data.kind === "bond"), [nodes]);

  // Generation counts
  const generationStats = useMemo(() => {
    const stats = new Map<number, number>();
    personNodes.forEach((n) => {
      const g = n.data.generation ?? 0;
      stats.set(g, (stats.get(g) ?? 0) + 1);
    });
    return Array.from(stats.entries())
      .sort(([a], [b]) => a - b)
      .map(([gen, count]) => ({
        generation: gen,
        count,
        tone: toneFor(gen),
        label: generationLabel(gen),
      }));
  }, [personNodes]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return personNodes.filter((p) => {
      const name = (p.data.label || "").toLowerCase();
      const place = (p.data.birthPlace || "").toLowerCase();
      const details = (p.data.otherDetails || "").toLowerCase();
      return name.includes(q) || place.includes(q) || details.includes(q);
    });
  }, [searchQuery, personNodes]);

  if (!isOpen) return null;

  const selectedTone = selectedNode ? toneFor(selectedNode.data.generation) : null;

  return (
    <aside className="w-80 md:w-88 h-full bg-surface-bright/95 backdrop-blur-md border-l border-lokta-border shadow-2xl flex flex-col z-30 shrink-0 text-on-surface animate-in slide-in-from-right duration-300">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-lokta-border flex items-center justify-between bg-surface-container-low/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-himal flex items-center justify-center text-lokta-light shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-headline text-base text-himal font-bold leading-tight">वंशावली Studio</h3>
            <p className="font-label-xs text-[10px] uppercase tracking-wider text-on-surface-variant">Lineage Inspector</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-3 gap-2 p-3 border-b border-lokta-border/60 bg-surface-container-lowest text-center">
        <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40">
          <div className="font-headline font-bold text-lg text-himal">{personNodes.length}</div>
          <div className="font-label-xs text-[9px] uppercase tracking-wider text-on-surface-variant">Ancestors</div>
        </div>
        <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40">
          <div className="font-headline font-bold text-lg text-sindoor">{generationStats.length}</div>
          <div className="font-label-xs text-[9px] uppercase tracking-wider text-on-surface-variant">Generations</div>
        </div>
        <div className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40">
          <div className="font-headline font-bold text-lg text-sayapatri-deep">{bondNodes.length}</div>
          <div className="font-label-xs text-[9px] uppercase tracking-wider text-on-surface-variant">Unions</div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-lokta-border px-3 pt-2 gap-1 bg-surface-container-low/40">
        <button
          onClick={() => setActiveTab("inspector")}
          className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "inspector"
              ? "border-sindoor text-sindoor font-bold"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Ancestor
        </button>
        <button
          onClick={() => setActiveTab("generations")}
          className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "generations"
              ? "border-sindoor text-sindoor font-bold"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          पुस्ता ({generationStats.length})
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 pb-2 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "search"
              ? "border-sindoor text-sindoor font-bold"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Search
        </button>
      </div>

      {/* Sidebar Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Selected Ancestor Inspector */}
        {activeTab === "inspector" && (
          <div>
            {selectedNode && selectedNode.data.kind === "person" ? (
              <div className="space-y-4">
                {/* Ancestor Card Header */}
                <div
                  className="p-4 rounded-2xl border shadow-sm relative overflow-hidden"
                  style={{
                    backgroundColor: selectedTone?.soft ?? "#F7EEDD",
                    borderColor: selectedTone?.base ?? "#B3173A",
                  }}
                >
                  <div
                    className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: selectedTone?.base,
                      color: selectedTone?.ink,
                    }}
                  >
                    {generationLabel(selectedNode.data.generation ?? 0)}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-white/60 bg-white/80 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                      {selectedNode.data.profileImage ? (
                        <img src={selectedNode.data.profileImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif font-bold text-xl" style={{ color: selectedTone?.deep }}>
                          {selectedNode.data.label ? selectedNode.data.label.charAt(0).toUpperCase() : "P"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-lg text-himal truncate">
                        {selectedNode.data.label || "Unnamed"}
                      </h4>
                      <p className="font-mono text-xs text-on-surface-variant mt-0.5">
                        {genderIcon[selectedNode.data.gender ?? "other"]} {genderLabel[selectedNode.data.gender ?? "other"]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vitals Summary */}
                <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-himal" /> Birth / Death:
                    </span>
                    <span className="font-mono font-medium">
                      {selectedNode.data.dob || "Unknown"} — {selectedNode.data.deathDate || "Present"}
                    </span>
                  </div>

                  {selectedNode.data.birthPlace && (
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sindoor" /> Birthplace:
                      </span>
                      <span className="font-medium truncate max-w-[150px]">{selectedNode.data.birthPlace}</span>
                    </div>
                  )}

                  {selectedNode.data.residingAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-on-surface-variant flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sayapatri" /> Residing:
                      </span>
                      <span className="font-medium truncate max-w-[150px]">{selectedNode.data.residingAt}</span>
                    </div>
                  )}
                </div>

                {/* Clan / Notes */}
                {selectedNode.data.otherDetails && (
                  <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/40 text-xs">
                    <span className="font-bold text-himal block mb-1">गोत्र, वृत्तान्त (Notes):</span>
                    <p className="text-on-surface-variant leading-relaxed line-clamp-4">{selectedNode.data.otherDetails}</p>
                  </div>
                )}

                {/* Center on Canvas */}
                <button
                  onClick={() => onCenterNode(selectedNode.id)}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-himal text-lokta-light hover:bg-himal-light transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Center on Canvas (केन्द्रित गर्नुहोस्)
                </button>
              </div>
            ) : (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-on-surface-variant">
                  <Users className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="font-headline text-base text-himal font-semibold">No Ancestor Selected</h4>
                <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Click on any ancestor card on the canvas to inspect their profile, bio, and family ties.
                </p>
                <button
                  onClick={onAddRoot}
                  className="mt-5 py-2 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-sindoor text-white hover:bg-sindoor-deep transition-colors inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Root Ancestor
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Generation Color Legend & Explorer */}
        {activeTab === "generations" && (
          <div className="space-y-3">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Every generation level is distinctly colour-coded to visually trace ancestry from top roots to newest branches.
            </p>
            <div className="space-y-2">
              {generationStats.map(({ generation, count, tone, label }) => (
                <div
                  key={generation}
                  className="p-3 rounded-xl border flex items-center justify-between shadow-xs transition-transform hover:scale-[1.01]"
                  style={{
                    backgroundColor: tone.soft,
                    borderColor: tone.base,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                      style={{ backgroundColor: tone.base }}
                    />
                    <div>
                      <div className="font-devanagari font-bold text-sm" style={{ color: tone.deep }}>
                        {label}
                      </div>
                      <div className="font-mono text-[10px] text-on-surface-variant uppercase">
                        {tone.name} Theme
                      </div>
                    </div>
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono"
                    style={{ backgroundColor: tone.base, color: tone.ink }}
                  >
                    {count} {count === 1 ? "purkha" : "purkhas"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Search Ancestors */}
        {activeTab === "search" && (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, place, gotra..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-sindoor font-medium"
              />
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-2.5" />
            </div>

            {searchQuery && (
              <div className="text-[11px] text-on-surface-variant px-1 font-mono">
                {searchResults.length} {searchResults.length === 1 ? "result" : "results"} found
              </div>
            )}

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
              {searchResults.map((p) => {
                const pTone = toneFor(p.data.generation);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectNode(p.id);
                      onCenterNode(p.id);
                      setActiveTab("inspector");
                    }}
                    className="w-full text-left p-2.5 rounded-xl border border-outline-variant/40 hover:border-sindoor hover:bg-surface-container transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-serif font-bold text-xs text-himal truncate group-hover:text-sindoor">
                        {p.data.label || "Unnamed"}
                      </div>
                      <div className="text-[10px] text-on-surface-variant truncate">
                        {generationLabel(p.data.generation ?? 0)} • {p.data.birthPlace || "No place"}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-outline group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </button>
                );
              })}

              {searchQuery && searchResults.length === 0 && (
                <div className="py-8 text-center text-xs text-on-surface-variant">
                  No ancestors found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Footer Controls */}
      <div className="p-3 border-t border-lokta-border bg-surface-container-low/80 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExpandAll}
            className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center justify-center gap-1"
          >
            <ChevronDown className="w-3 h-3 text-sindoor" /> Expand All
          </button>
          <button
            onClick={onCollapseAll}
            className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center justify-center gap-1"
          >
            <ChevronRight className="w-3 h-3 text-himal" /> Collapse Roots
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAutoLayout}
            className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center justify-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-sayapatri" /> Auto Layout
          </button>
          <button
            onClick={onExportImage}
            className="py-1.5 px-2 text-[11px] font-semibold rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors flex items-center justify-center gap-1"
          >
            <FolderDown className="w-3 h-3 text-himal" /> Export PNG
          </button>
        </div>

        <button
          onClick={onLoadNepalKings}
          className="w-full py-1.5 px-3 text-[11px] font-semibold rounded-lg bg-sayapatri/20 hover:bg-sayapatri/30 text-sayapatri-deep border border-sayapatri/40 transition-colors flex items-center justify-center gap-1.5"
        >
          <Crown className="w-3.5 h-3.5" /> Load Royal Nepal Lineage Demo
        </button>
      </div>
    </aside>
  );
}
