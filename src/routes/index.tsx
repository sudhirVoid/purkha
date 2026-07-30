import { createFileRoute } from "@tanstack/react-router";
import FamilyFlow from "@/components/FamilyFlow";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Family Relationship Builder" },
      { name: "description", content: "Build two-generation family relationship diagrams visually with drag-and-drop nodes." },
      { property: "og:title", content: "Family Relationship Builder" },
      { property: "og:description", content: "Build two-generation family relationship diagrams visually." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <FamilyFlow />;
}
