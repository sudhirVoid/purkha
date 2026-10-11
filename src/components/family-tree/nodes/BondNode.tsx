import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import { Heart, HeartCrack, Flame, Bird, Calendar, Plus, Trash2 } from "lucide-react";
import type { FamilyNode, FamilyNodeData, BondStatus } from "../types";
import { useActions } from "../ActionsContext";
import { formatDate, getLoveColor } from "../utils";
import { Handles } from "./Handles";
import { ToolbarBtn } from "./ToolbarBtn";
import { CollapseBtn } from "./CollapseBtn";
import { toneFor } from "../generations";

const STATUS_CONFIG: Record<BondStatus, { label: string; nepali: string; icon: string; badgeCls: string }> = {
  married: {
    label: "Married",
    nepali: "विवाह",
    icon: "💍",
    badgeCls: "bg-sayapatri/15 text-sayapatri-deep border-sayapatri/40",
  },
  divorced: {
    label: "Divorced",
    nepali: "सम्बन्धविच्छेद",
    icon: "💔",
    badgeCls: "bg-error-container text-error border-error/30",
  },
  separated: {
    label: "Separated",
    nepali: "अलग",
    icon: "⚡",
    badgeCls: "bg-amber-100 text-amber-900 border-amber-300",
  },
  widowed: {
    label: "Widowed",
    nepali: "एकल",
    icon: "🕊️",
    badgeCls: "bg-surface-container-high text-on-surface-variant border-outline-variant",
  },
};

function BondToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const actions = useActions();
  const status = data.bondStatus ?? "married";

  return (
    <div className="rounded-2xl border border-lokta-border bg-surface-bright/95 backdrop-blur-md shadow-2xl p-3 space-y-2.5 w-[250px] text-on-surface">
      <div>
        <label className="block text-[10px] uppercase font-bold tracking-wider text-himal mb-1">
          Union Status (सम्बन्ध स्थिति)
        </label>
        <div className="grid grid-cols-2 gap-1">
          {(["married", "divorced", "separated", "widowed"] as BondStatus[]).map((s) => {
            const isSelected = status === s;
            const cfg = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => actions.setBondStatus(id, s)}
                className={`px-2 py-1 text-[11px] rounded-lg border font-medium transition-colors flex items-center justify-center gap-1 ${
                  isSelected
                    ? "bg-himal text-lokta-light border-himal shadow-xs"
                    : "bg-surface-container-low border-outline-variant hover:bg-surface-container text-on-surface"
                }`}
              >
                <span>{cfg.icon}</span>
                <span>{cfg.nepali}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase font-bold tracking-wider text-himal">
          Marriage Date (विवाह मिति)
        </label>
        <input
          type="date"
          value={data.marriageDate ?? ""}
          onChange={(event) => actions.setMarriageDate(id, event.target.value)}
          className="w-full px-2.5 py-1 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:border-sindoor font-mono"
        />
      </div>

      {(status === "divorced" || status === "separated") && (
        <div className="space-y-1">
          <label className="block text-[10px] uppercase font-bold tracking-wider text-himal">
            {status === "divorced" ? "Divorce Date" : "Separation Date"}
          </label>
          <input
            type="date"
            value={data.divorceDate ?? ""}
            onChange={(event) => actions.setDivorceDate(id, event.target.value)}
            className="w-full px-2.5 py-1 text-xs rounded-lg border border-outline-variant bg-surface-container-low focus:outline-none focus:border-sindoor font-mono"
          />
        </div>
      )}

      <div className="pt-1 border-t border-outline-variant/50">
        <label className="block text-[10px] uppercase font-bold tracking-wider text-himal mb-1">
          Add Children (सन्तान थप्नुहोस्)
        </label>
        <div className="grid grid-cols-2 gap-1">
          <ToolbarBtn onClick={() => actions.addChild(id)}>+ Child (सन्तान)</ToolbarBtn>
          <ToolbarBtn onClick={() => actions.addChild(id, "adopted")}>+ Adopted (धर्मपुत्र)</ToolbarBtn>
          <ToolbarBtn onClick={() => actions.addChild(id, "foster")}>+ Foster</ToolbarBtn>
          <ToolbarBtn onClick={() => actions.addChild(id, "step")}>+ Step-child</ToolbarBtn>
        </div>
      </div>

      <button
        type="button"
        onClick={() => actions.remove(id)}
        className="w-full py-1 text-xs rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors flex items-center justify-center gap-1 font-medium pt-1"
      >
        <Trash2 className="w-3 h-3" /> Dissolve Union
      </button>
    </div>
  );
}

export function BondNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const prettyMarriage = formatDate(data.marriageDate);
  const prettyDivorce = formatDate(data.divorceDate);
  const status = data.bondStatus ?? "married";
  const cfg = STATUS_CONFIG[status];
  const color = getLoveColor(id);
  const generation = data.generation ?? 0;
  const tone = toneFor(generation);

  return (
    <div className="relative flex flex-col items-center select-none group pb-3">
      <NodeToolbar isVisible={selected} position={Position.Right}>
        <BondToolbar id={id} data={data} />
      </NodeToolbar>
      <Handles />

      {/* Heritage Sacred Knot / Union Seal */}
      <div
        className={`relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all duration-300 shadow-md ${
          selected
            ? "scale-110 ring-3 ring-sindoor shadow-xl border-sindoor"
            : "hover:scale-105 hover:shadow-lg"
        }`}
        style={{
          background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${color.grad1}15 60%, ${color.grad2}25 100%)`,
          borderColor: color.connector,
        }}
      >
        {/* Sacred union emblem */}
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-xl leading-none filter drop-shadow-xs">{cfg.icon}</span>
        </div>

        {/* Small dhaka-inspired ring dots */}
        <div
          className="absolute inset-0 rounded-full border border-dashed opacity-40 pointer-events-none"
          style={{ borderColor: color.connector }}
        />
      </div>

      {/* Union Badge & Date */}
      <div
        className={`-mt-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold tracking-wider uppercase shadow-xs flex items-center gap-1 backdrop-blur-xs ${cfg.badgeCls}`}
      >
        <span className="font-devanagari">{cfg.nepali}</span>
        {status === "divorced" && prettyDivorce ? (
          <span className="font-mono text-[9px] opacity-80">({prettyDivorce})</span>
        ) : prettyMarriage ? (
          <span className="font-mono text-[9px] opacity-80">({prettyMarriage.split(" ").pop()})</span>
        ) : null}
      </div>

      {/* Descendant Expand/Collapse Button */}
      <CollapseBtn
        id={id}
        isCollapsed={data.isCollapsed}
        childrenCount={data.childrenCount}
        tone={tone}
      />
    </div>
  );
}
