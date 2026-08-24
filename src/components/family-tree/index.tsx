import { ReactFlowProvider } from "@xyflow/react";
import FamilyFlowInner from "./FamilyFlowInner";

export default function FamilyFlow() {
  return (
    <ReactFlowProvider>
      <FamilyFlowInner />
    </ReactFlowProvider>
  );
}
