import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ location }) => {
    const user = await new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });

    if (!user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  head: () => ({
    meta: [{ title: "Dashboard | Purkha Register" }],
  }),
  component: DashboardPage,
});

type Tree = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
};

function DashboardPage() {
  const { user } = useAuth();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTrees() {
      if (!auth.currentUser) return;
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await fetch("/api/trees", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error("Failed to load family trees");
        const data = await res.json();
        setTrees(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrees();
  }, [user]);

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed mb-2">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}
            </h1>
            <p className="font-body-md text-on-surface-variant">Here is a summary of your saved lineage flows.</p>
          </div>
          <Link 
            to="/builder"
            className="font-label-md bg-tertiary text-on-tertiary px-6 py-3 rounded-full hover:opacity-90 transition-opacity flex items-center space-x-2 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Create New Tree</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center text-outline">Loading your trees...</div>
          ) : trees.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center bg-surface-container-low border border-outline-variant/50 rounded-2xl">
              <span className="material-symbols-outlined text-4xl text-outline mb-4">account_tree</span>
              <p className="text-on-surface-variant font-body-lg">No family trees saved yet.</p>
              <Link to="/builder" className="mt-4 text-primary font-label-md hover:underline">Start building one now</Link>
            </div>
          ) : (
            trees.map(tree => (
              <div key={tree.id} className="bg-surface-container rounded-2xl p-6 border border-outline-variant hover:border-primary/50 transition-colors group relative">
                <h3 className="font-title-lg text-title-lg text-on-surface mb-2">{tree.name}</h3>
                <p className="font-body-sm text-on-surface-variant mb-6">
                  Last updated: {new Date(tree.updatedAt).toLocaleDateString()}
                </p>
                <Link 
                  to="/builder"
                  search={{ treeId: tree.id }}
                  className="font-label-sm text-primary group-hover:text-tertiary flex items-center space-x-1"
                >
                  <span>Open Flow</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
