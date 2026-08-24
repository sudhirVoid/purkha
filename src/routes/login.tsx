import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, actionCodeSettings } from "@/lib/firebase";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    };
  },
  head: () => ({
    meta: [{ title: "Login & Register | Purkha Register" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  useEffect(() => {
    // Check if coming from a magic link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let savedEmail = window.localStorage.getItem("emailForSignIn");
      if (!savedEmail) {
        savedEmail = window.prompt("Please provide your email for confirmation");
      }
      if (savedEmail) {
        setIsSubmitting(true);
        signInWithEmailLink(auth, savedEmail, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem("emailForSignIn");
            
            // Sync with backend using the ID token
            const token = await result.user.getIdToken();
            const res = await fetch("/api/auth/sync", {
              method: "POST",
              headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}` 
              }
            });
            
            if (!res.ok) throw new Error("Failed to sync user with backend");
            
            toast.success("Authentication successful! Welcome.");
            navigate({ to: search.redirect || "/builder" });
          })
          .catch((error) => {
            toast.error(error.message);
            setIsSubmitting(false);
          });
      }
    }
  }, [navigate, search.redirect]);

  const onSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setIsSubmitting(true);
    try {
      // Ensure the redirect parameter is preserved in the magic link URL
      const dynamicSettings = {
        ...actionCodeSettings,
        url: `${window.location.origin}/login?redirect=${encodeURIComponent(search.redirect || "/builder")}`,
      };
      
      await sendSignInLinkToEmail(auth, email, dynamicSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setLinkSent(true);
      toast.success("Magic link sent! Check your inbox.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center lokta-texture bg-lokta-light py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-20"></div>

        <div className="max-w-md w-full space-y-8 bg-surface-bright p-10 signature-frame relative z-10 shadow-xl">
          <div>
            <h2 className="mt-2 text-center font-headline-xl text-[36px] font-bold text-primary">
              {linkSent ? "Check Your Inbox" : "Begin Your Journey"}
            </h2>
            <p className="mt-2 text-center font-body-md text-on-surface-variant">
              {linkSent 
                ? "We've sent a magic link to your email. Click it to securely sign in." 
                : "Enter your email to receive a secure passwordless login link."}
            </p>
          </div>

          {!linkSent && (
            <form className="mt-8 space-y-6" onSubmit={onSendLink}>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="archivist@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Authenticating..." : "Send Magic Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
