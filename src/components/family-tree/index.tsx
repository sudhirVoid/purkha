import { ReactFlowProvider } from "@xyflow/react";
import FamilyFlowInner from "./FamilyFlowInner";

export default function FamilyFlow(props: any) {
  return (
    <ReactFlowProvider>
      <FamilyFlowInner {...props} />
    </ReactFlowProvider>
  );
}
