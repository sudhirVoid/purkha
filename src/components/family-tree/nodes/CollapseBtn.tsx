import { ChevronDown, ChevronRight } from "lucide-react";
import { useActions } from "../ActionsContext";
import { toNepaliDigits, type GenerationTone } from "../generations";

type CollapseBtnProps = {
  id: string;
  isCollapsed?: boolean;
  childrenCount?: number;
  tone?: GenerationTone;
  className?: string;
};

export function CollapseBtn({ id, isCollapsed, childrenCount, tone, className = "" }: CollapseBtnProps) {
  const actions = useActions();
  if (!actions.canCollapse(id) && !(childrenCount && childrenCount > 0)) return null;

  const countText = childrenCount ? `${toNepaliDigits(childrenCount)} सन्तान` : "शाखा";
  const bg = tone?.soft ?? "#F7EEDD";
  const text = tone?.deep ?? "#14295C";
  const border = tone?.base ?? "#E4D3B4";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        actions.toggleCollapse(id);
      }}
      className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer select-none border ${className}`}
      style={{
        backgroundColor: isCollapsed ? (tone?.base ?? "#B3173A") : bg,
        color: isCollapsed ? (tone?.ink ?? "#FFFFFF") : text,
        borderColor: border,
      }}
      title={isCollapsed ? "Expand descendants" : "Collapse descendants"}
    >
      {isCollapsed ? (
        <>
          <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          <span>{countText}</span>
        </>
      ) : (
        <>
          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
          <span className="opacity-90">{countText}</span>
        </>
      )}
    </button>
  );
}
