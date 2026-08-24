import { ChevronDown, ChevronUp } from "lucide-react";
import { useActions } from "../ActionsContext";

export function CollapseBtn({ id, isCollapsed }: { id: string; isCollapsed?: boolean }) {
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
