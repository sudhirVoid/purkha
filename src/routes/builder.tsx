import { createFileRoute, redirect } from "@tanstack/react-router";
import FamilyFlow from "@/components/family-tree";
import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentUser, useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BuilderSearch = {
  treeId?: string;
};

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>): BuilderSearch => {
    return {
      treeId: search.treeId as string | undefined,
    };
  },
  beforeLoad: async ({ location }) => {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  head: () => ({
    meta: [
      { title: "Vamshavali Builder | PURKHA" },
      { name: "description", content: "Build your family's vamshavali visually — ancestors, partners and descendants — with PURKHA, the league of Nepali people." },
    ],
  }),
  component: Builder,
});

function Builder() {
  const { treeId } = Route.useSearch();
  const { user } = useAuth();
  const [treeData, setTreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!treeId);

  useEffect(() => {
    async function loadTree() {
      if (!treeId || !user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/trees?id=${treeId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to load tree");
        }
        const parsedData = await response.json();
        setTreeData(parsedData);
      } catch (loadError: unknown) {
        toast.error("Could not load the requested family tree");
        console.error(loadError);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTree();
  }, [treeId, user]);

  return (
    <AppLayout>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center h-full text-on-surface-variant font-body-lg">
          <span className="material-symbols-outlined animate-spin mr-3 text-sindoor">progress_activity</span>
          Gathering your purkha…
        </div>
      ) : (
        <FamilyFlow 
          initialNodes={treeData?.data?.nodes}
          initialEdges={treeData?.data?.edges}
          treeId={treeData?.id}
          treeName={treeData?.name}
        />
      )}
    </AppLayout>
  );
}
