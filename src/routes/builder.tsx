import { createFileRoute } from "@tanstack/react-router";
import FamilyFlow from "@/components/FamilyFlow";
import { AppLayout } from "@/components/layout/AppLayout";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Family Relationship Builder" },
      { name: "description", content: "Build two-generation family relationship diagrams visually with drag-and-drop nodes." },
    ],
  }),
  component: Builder,
});

function Builder() {
  return (
    <AppLayout>
      <FamilyFlow />
    </AppLayout>
  );
}
