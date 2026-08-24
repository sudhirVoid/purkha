import { Handle, Position } from "@xyflow/react";

const handleCls = "!opacity-0 pointer-events-none";

export function Handles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className={handleCls} />
      <Handle type="source" position={Position.Bottom} className={handleCls} />
    </>
  );
}
