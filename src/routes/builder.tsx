import { createFileRoute, redirect } from "@tanstack/react-router";
import FamilyFlow from "@/components/family-tree";
import { AppLayout } from "@/components/layout/AppLayout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

    // if (!user) {
    //   throw redirect({
    //     to: "/login",
    //     search: { redirect: location.href },
    //   });
    // }
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
  const [treeData, setTreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!treeId);

  useEffect(() => {
    async function loadTree() {
      if (!treeId || !auth.currentUser) {
        setIsLoading(false);
        return;
      }
      
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch(`/api/trees?id=${treeId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (!res.ok) throw new Error("Failed to load tree");
        const data = await res.json();
        setTreeData(data);
      } catch (err: any) {
        toast.error("Could not load the requested family tree");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTree();
  }, [treeId]);

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
