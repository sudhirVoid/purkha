import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/settings")({
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
    meta: [{ title: "Settings | Purkha Register" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setIsSaving(true);
    
    try {
      // 1. Update Firebase Profile
      await updateProfile(auth.currentUser, { displayName });
      
      // 2. Sync to Backend
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ username: displayName })
      });
      
      if (!res.ok) throw new Error("Failed to sync profile to database");
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
        <h1 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed mb-8">Settings</h1>
        
        <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30">
          <h2 className="font-title-md text-title-md mb-4 text-on-surface">Profile Information</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Display Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-surface-container-highest border border-outline py-2 px-4 rounded-lg focus:outline-none focus:border-primary transition-colors text-on-surface"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">Email Address (Read Only)</label>
              <input 
                type="email" 
                value={user?.email || ""}
                disabled
                className="w-full bg-surface-container-highest opacity-70 border border-outline py-2 px-4 rounded-lg text-on-surface cursor-not-allowed"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="font-label-sm text-label-sm bg-primary text-on-primary px-6 py-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
