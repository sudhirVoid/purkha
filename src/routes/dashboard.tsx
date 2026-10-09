import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PurkhaMark } from "@/components/brand/PurkhaLogo";

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
    meta: [{ title: "Dashboard | PURKHA" }],
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
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full h-full">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="font-devanagari text-lg text-sindoor" lang="ne">नमस्ते</p>
            <h1 className="font-headline-lg text-headline-lg text-himal mb-2">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}
            </h1>
            <p className="font-body-md text-on-surface-variant">The vamshavalis you are keeping for the generations ahead.</p>
          </div>
          <Link 
            to="/builder"
            id="dashboard-new-vamshavali"
            className="font-label-sm text-label-sm uppercase tracking-widest bg-sindoor-deep text-lokta-light px-6 py-3 hover:bg-himal transition-colors flex items-center space-x-2 shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>New Vamshavali</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center text-outline">Gathering your vamshavalis…</div>
          ) : trees.length === 0 ? (
            <div className="col-span-full py-16 flex flex-col items-center bg-lokta-light lokta-texture border border-lokta-border text-center px-6">
              <PurkhaMark className="h-14 w-auto mb-5" title="" />
              <p className="text-himal font-headline-md text-headline-md">No vamshavali yet</p>
              <p className="mt-2 text-on-surface-variant font-body-md max-w-sm">Start with the eldest purkha you know — every great tree begins with a single root.</p>
              <Link to="/builder" className="mt-6 font-label-sm text-label-sm uppercase tracking-widest text-sindoor hover:text-himal underline-offset-4 hover:underline">Plant your first root</Link>
            </div>
          ) : (
            trees.map(tree => (
              <div key={tree.id} className="brand-card bg-surface-bright p-6 border border-lokta-border border-t-4 border-t-sindoor-deep group relative">
                <span className="material-symbols-outlined absolute top-5 right-5 text-sayapatri">account_tree</span>
                <h3 className="font-headline-md text-xl text-himal mb-2 pr-8">{tree.name}</h3>
                <p className="font-label-xs text-label-xs uppercase tracking-wider text-on-surface-variant mb-6">
                  Last tended {new Date(tree.updatedAt).toLocaleDateString()}
                </p>
                <Link 
                  to="/builder"
                  search={{ treeId: tree.id }}
                  className="font-label-sm text-label-sm uppercase tracking-wider text-himal group-hover:text-sindoor flex items-center space-x-1"
                >
                  <span>Open Vamshavali</span>
                  <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
