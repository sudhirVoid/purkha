import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import type { FamilyNode, FamilyNodeData } from "../types";
import { useActions } from "../ActionsContext";
import { formatDate } from "../utils";
import { Handles } from "./Handles";
import { ToolbarBtn } from "./ToolbarBtn";

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

export function BondNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
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
