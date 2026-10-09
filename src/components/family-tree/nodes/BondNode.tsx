import { NodeToolbar, Position, type NodeProps } from "@xyflow/react";
import type { FamilyNode, FamilyNodeData, BondStatus } from "../types";
import { useActions } from "../ActionsContext";
import { formatDate, getLoveColor } from "../utils";
import { Handles } from "./Handles";
import { ToolbarBtn } from "./ToolbarBtn";

const STATUS_LABELS: Record<BondStatus, string> = {
  married: "Married",
  divorced: "Divorced",
  separated: "Separated",
  widowed: "Widowed",
};

function BondToolbar({ id, data }: { id: string; data: FamilyNodeData }) {
  const actions = useActions();
  const status = data.bondStatus ?? "married";
  return (
    <div className="rounded-xl border bg-card shadow-lg p-2 space-y-2 w-[240px]">
      {/* Status selector */}
      <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">Status</label>
      <div className="flex gap-1">
        {(["married", "divorced", "separated", "widowed"] as BondStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => actions.setBondStatus(id, s)}
            className={`flex-1 px-1.5 py-1 text-[10px] rounded-md border capitalize transition ${
              status === s ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-accent"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Marriage date */}
      <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">Marriage date</label>
      <input
        type="date"
        value={data.marriageDate ?? ""}
        onChange={(event) => actions.setMarriageDate(id, event.target.value)}
        className="w-full px-2 py-1 text-xs rounded-md border bg-background"
      />

      {/* Divorce date (only when divorced) */}
      {(status === "divorced" || status === "separated") && (
        <>
          <label className="block text-[10px] uppercase tracking-wide text-muted-foreground">
            {status === "divorced" ? "Divorce date" : "Separation date"}
          </label>
          <input
            type="date"
            value={data.divorceDate ?? ""}
            onChange={(event) => actions.setDivorceDate(id, event.target.value)}
            className="w-full px-2 py-1 text-xs rounded-md border bg-background"
          />
        </>
      )}

      {/* Children actions */}
      <div className="grid grid-cols-2 gap-1 pt-1">
        <ToolbarBtn onClick={() => actions.addChild(id)}>+ Child</ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id, "adopted")}>+ Adopted</ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id, "foster")}>+ Foster</ToolbarBtn>
        <ToolbarBtn onClick={() => actions.addChild(id, "step")}>+ Step-child</ToolbarBtn>
      </div>

      <button
        onClick={() => actions.remove(id)}
        className="w-full px-2 py-1 text-xs rounded-md border border-destructive text-destructive hover:bg-destructive/10"
      >
        Delete
      </button>
    </div>
  );
}

/** Heart SVG paths for each bond status */
function BondHeart({ status, gradId, strokeColor, selected }: { status: BondStatus; gradId: string; strokeColor: string; selected: boolean }) {
  const strokeW = selected ? 3 : 2;
  const stroke = selected ? "hsl(var(--ring))" : strokeColor;

  if (status === "divorced") {
    // Broken heart: two halves with a jagged split
    return (
      <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full drop-shadow-md">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(0 0% 55%)" />
            <stop offset="100%" stopColor="hsl(0 0% 35%)" />
          </linearGradient>
        </defs>
        {/* Left half */}
        <path
          d="M48 28 C46 14 30 10 18 22 C4 36 10 60 48 86 L52 70 L44 52 L52 36 Z"
          fill={`url(#${gradId})`}
          stroke={stroke}
          strokeWidth={strokeW}
        />
        {/* Right half — shifted right slightly */}
        <path
          d="M52 28 C54 14 70 10 82 22 C96 36 90 60 52 86 L48 70 L56 52 L48 36 Z"
          fill={`url(#${gradId})`}
          stroke={stroke}
          strokeWidth={strokeW}
        />
        {/* Jagged crack line */}
        <path
          d="M50 28 L52 36 L44 52 L52 70 L50 88"
          fill="none"
          stroke="hsl(0 0% 75%)"
          strokeWidth={1.5}
          strokeDasharray="2 2"
        />
      </svg>
    );
  }

  if (status === "separated") {
    return (
      <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full drop-shadow-md">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(40 80% 65%)" />
            <stop offset="100%" stopColor="hsl(30 70% 45%)" />
          </linearGradient>
        </defs>
        <path
          d="M50 88 C10 60 4 36 18 22 C30 10 46 14 50 28 C54 14 70 10 82 22 C96 36 90 60 50 88 Z"
          fill={`url(#${gradId})`}
          stroke={stroke}
          strokeWidth={strokeW}
          opacity={0.6}
        />
        {/* Single slash through the heart */}
        <line x1="35" y1="25" x2="65" y2="75" stroke="hsl(0 0% 90%)" strokeWidth={2.5} />
      </svg>
    );
  }

  if (status === "widowed") {
    return (
      <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full drop-shadow-md">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(0 0% 80%)" />
            <stop offset="100%" stopColor="hsl(0 0% 60%)" />
          </linearGradient>
        </defs>
        <path
          d="M50 88 C10 60 4 36 18 22 C30 10 46 14 50 28 C54 14 70 10 82 22 C96 36 90 60 50 88 Z"
          fill={`url(#${gradId})`}
          stroke={stroke}
          strokeWidth={strokeW}
        />
      </svg>
    );
  }

  // Default: married — full colorful heart
  return (
    <svg viewBox="0 0 100 92" className="absolute inset-0 h-full w-full drop-shadow-md">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={getLoveColor(gradId.replace("loveGrad-", "")).grad1} />
          <stop offset="100%" stopColor={getLoveColor(gradId.replace("loveGrad-", "")).grad2} />
        </linearGradient>
      </defs>
      <path
        d="M50 88 C10 60 4 36 18 22 C30 10 46 14 50 28 C54 14 70 10 82 22 C96 36 90 60 50 88 Z"
        fill={`url(#${gradId})`}
        stroke={stroke}
        strokeWidth={strokeW}
      />
    </svg>
  );
}

const STATUS_ICONS: Record<BondStatus, string> = {
  married: "💍",
  divorced: "💔",
  separated: "⚡",
  widowed: "🕊️",
};

export function BondNodeView({ id, data, selected }: NodeProps<FamilyNode>) {
  const pretty = formatDate(data.marriageDate);
  const divorcePretty = formatDate(data.divorceDate);
  const color = getLoveColor(id);
  const gradId = `loveGrad-${id}`;
  const status = data.bondStatus ?? "married";

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
        <BondHeart status={status} gradId={gradId} strokeColor={color.stroke} selected={!!selected} />
        <div className="relative text-center leading-tight pb-2">
          <div className="text-lg">{STATUS_ICONS[status]}</div>
          <div
            className="text-[10px] font-bold text-white drop-shadow"
            style={{ fontFamily: "'Kalam', cursive" }}
          >
            {STATUS_LABELS[status]}
          </div>
        </div>
      </div>
      <div
        className={`-mt-1 px-2 py-0.5 rounded-full border text-[10px] font-medium shadow-sm whitespace-nowrap relative ${
          status === "divorced" ? "bg-red-50 border-red-200 text-red-700" :
          status === "separated" ? "bg-amber-50 border-amber-200 text-amber-700" :
          status === "widowed" ? "bg-gray-50 border-gray-200 text-gray-500" :
          "bg-card"
        }`}
        style={{ fontFamily: "'Kalam', cursive" }}
      >
        {status === "divorced" && divorcePretty
          ? `Div. ${divorcePretty}`
          : status === "separated" && divorcePretty
          ? `Sep. ${divorcePretty}`
          : pretty ?? "Set date"}
      </div>
      <Handles />
    </div>
  );
}
