import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, actionCodeSettings } from "@/lib/firebase";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { PurkhaMark } from "@/components/brand/PurkhaLogo";

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
    meta: [{ title: "Join the League | PURKHA" }],
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
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center lokta-texture bg-lokta-light py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 paper-glow pointer-events-none"></div>
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-20"></div>

        <div className="max-w-md w-full bg-surface-bright signature-frame relative z-10 shadow-2xl">
          <div className="dhaka-band" />
          <div className="p-10 space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <PurkhaMark className="h-14 w-auto" />
            </div>
            <p className="mt-5 font-devanagari text-xl text-sindoor" lang="ne">
              {linkSent ? "धन्यवाद" : "स्वागत छ"}
            </p>
            <h1 className="mt-1 font-headline-xl text-[34px] leading-tight font-bold text-himal">
              {linkSent ? "Check Your Inbox" : "Join the League"}
            </h1>
            <p className="mt-3 font-body-md text-on-surface-variant">
              {linkSent 
                ? "We've sent a magic link to your email. Click it to securely sign in to PURKHA." 
                : "Enter your email to receive a secure, passwordless sign-in link to your vamshavali."}
            </p>
          </div>

          {!linkSent && (
            <form className="mt-8 space-y-6" onSubmit={onSendLink}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase tracking-wider">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-sindoor focus:border-sindoor font-body-md transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <button id="login-submit" type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-lokta-light bg-sindoor-deep hover:bg-himal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sindoor transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Authenticating..." : "Send Magic Link"}
                  {!isSubmitting && <span className="material-symbols-outlined text-[18px]">mail</span>}
                </button>
              </div>
            </form>
          )}
          <p className="text-center font-label-xs text-label-xs uppercase tracking-[0.2em] text-on-surface-variant/70">
            PURKHA · The League of Nepali People
          </p>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
