import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState, useEffect, FormEvent } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PurkhaMark } from "@/components/brand/PurkhaLogo";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, KeyRound, Loader2 } from "lucide-react";

type LoginSearch = {
  redirect?: string;
};

type AuthMode = "signIn" | "signUp" | "forgotPassword";

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
  const { user, isAuthenticated, isLoading, signInWithEmail, signUpWithEmail, sendPasswordReset } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate({ to: search.redirect || "/builder" });
    }
  }, [isAuthenticated, isLoading, navigate, search.redirect]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    if (authMode === "forgotPassword") {
      setIsSubmitting(true);
      try {
        await sendPasswordReset(email.trim());
        toast.success("Password reset link sent! Check your inbox.");
        setAuthMode("signIn");
      } catch (submitError: unknown) {
        const errorMessage = submitError instanceof Error ? submitError.message : "Failed to send reset email.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!password) {
      toast.error("Please enter your password.");
      return;
    }

    if (authMode === "signUp") {
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Passwords do not match. Please verify.");
        return;
      }

      setIsSubmitting(true);
      try {
        await signUpWithEmail(email.trim(), password, displayName.trim());
        toast.success("Account created successfully! Welcome to Purkha.");
        navigate({ to: search.redirect || "/builder" });
      } catch (submitError: unknown) {
        const errorMessage = submitError instanceof Error ? submitError.message : "Failed to create account.";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Default: signIn
    setIsSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      toast.success("Authentication successful! Welcome back.");
      navigate({ to: search.redirect || "/builder" });
    } catch (submitError: unknown) {
      const errorMessage = submitError instanceof Error ? submitError.message : "Failed to sign in.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center lokta-texture bg-lokta-light py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 paper-glow pointer-events-none" />
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-20" />

        <div className="max-w-md w-full bg-surface-bright signature-frame relative z-10 shadow-2xl">
          <div className="dhaka-band" />
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center">
              <div className="flex justify-center">
                <PurkhaMark className="h-14 w-auto" />
              </div>

              {authMode === "signIn" && (
                <>
                  <p className="mt-5 font-devanagari text-xl text-sindoor" lang="ne">
                    स्वागत छ
                  </p>
                  <h1 className="mt-1 font-headline-xl text-[32px] leading-tight font-bold text-himal">
                    Sign In to PURKHA
                  </h1>
                  <p className="mt-2 font-body-md text-on-surface-variant">
                    Enter your email and password to access your ancestral vamshavali.
                  </p>
                </>
              )}

              {authMode === "signUp" && (
                <>
                  <p className="mt-5 font-devanagari text-xl text-sindoor" lang="ne">
                    नयाँ खाता
                  </p>
                  <h1 className="mt-1 font-headline-xl text-[32px] leading-tight font-bold text-himal">
                    Join the League
                  </h1>
                  <p className="mt-2 font-body-md text-on-surface-variant">
                    Create your account to begin documenting your generations.
                  </p>
                </>
              )}

              {authMode === "forgotPassword" && (
                <>
                  <p className="mt-5 font-devanagari text-xl text-sindoor" lang="ne">
                    पासवर्ड पुनःप्राप्ति
                  </p>
                  <h1 className="mt-1 font-headline-xl text-[32px] leading-tight font-bold text-himal">
                    Reset Password
                  </h1>
                  <p className="mt-2 font-body-md text-on-surface-variant">
                    Enter your email address and we will send you a password reset link.
                  </p>
                </>
              )}
            </div>

            {/* Segmented Mode Switcher (Sign In vs Sign Up) */}
            {authMode !== "forgotPassword" && (
              <div className="grid grid-cols-2 p-1 bg-surface-container-low border border-outline-variant/60 text-center font-label-xs tracking-wider uppercase">
                <button
                  type="button"
                  id="tab-signin"
                  onClick={() => {
                    setAuthMode("signIn");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className={`py-2.5 transition-all font-semibold ${
                    authMode === "signIn"
                      ? "bg-surface-bright text-himal shadow-sm border border-outline-variant/40"
                      : "text-on-surface-variant hover:text-himal"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup"
                  onClick={() => {
                    setAuthMode("signUp");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className={`py-2.5 transition-all font-semibold ${
                    authMode === "signUp"
                      ? "bg-surface-bright text-himal shadow-sm border border-outline-variant/40"
                      : "text-on-surface-variant hover:text-himal"
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Full Name for Sign Up */}
              {authMode === "signUp" && (
                <div>
                  <label
                    htmlFor="signup-name"
                    className="block font-label-sm text-label-sm text-on-surface mb-1.5 uppercase tracking-wider"
                  >
                    Full Name <span className="text-on-surface-variant/60 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      value={displayName}
                      onChange={(changeEvent) => setDisplayName(changeEvent.target.value)}
                      className="appearance-none block w-full pl-10 pr-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-sindoor focus:border-sindoor font-body-md transition-colors"
                      placeholder="e.g. Ram Bahadur Shrestha"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block font-label-sm text-label-sm text-on-surface mb-1.5 uppercase tracking-wider"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(changeEvent) => setEmail(changeEvent.target.value)}
                    required
                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-sindoor focus:border-sindoor font-body-md transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password */}
              {authMode !== "forgotPassword" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="login-password"
                      className="block font-label-sm text-label-sm text-on-surface uppercase tracking-wider"
                    >
                      Password
                    </label>
                    {authMode === "signIn" && (
                      <button
                        type="button"
                        id="btn-forgot-password"
                        onClick={() => setAuthMode("forgotPassword")}
                        className="font-label-xs text-label-xs text-sindoor hover:text-himal transition-colors underline-offset-2 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={authMode === "signUp" ? "new-password" : "current-password"}
                      value={password}
                      onChange={(changeEvent) => setPassword(changeEvent.target.value)}
                      required
                      className="appearance-none block w-full pl-10 pr-11 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-sindoor focus:border-sindoor font-body-md transition-colors"
                      placeholder={authMode === "signUp" ? "At least 6 characters" : "Enter your password"}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-himal transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password for Sign Up */}
              {authMode === "signUp" && (
                <div>
                  <label
                    htmlFor="signup-confirm-password"
                    className="block font-label-sm text-label-sm text-on-surface mb-1.5 uppercase tracking-wider"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(changeEvent) => setConfirmPassword(changeEvent.target.value)}
                      required
                      className="appearance-none block w-full pl-10 pr-11 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-sindoor focus:border-sindoor font-body-md transition-colors"
                      placeholder="Re-enter your password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-on-surface-variant hover:text-himal transition-colors"
                      aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  id="auth-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-lokta-light bg-sindoor-deep hover:bg-himal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sindoor transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>
                        {authMode === "signIn" && "Signing In..."}
                        {authMode === "signUp" && "Creating Account..."}
                        {authMode === "forgotPassword" && "Sending Link..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {authMode === "signIn" && "Sign In"}
                        {authMode === "signUp" && "Create Account"}
                        {authMode === "forgotPassword" && "Send Reset Link"}
                      </span>
                      {authMode !== "forgotPassword" ? (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Back to Sign In from Forgot Password */}
            {authMode === "forgotPassword" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  id="btn-back-to-signin"
                  onClick={() => setAuthMode("signIn")}
                  className="font-label-sm text-label-sm uppercase tracking-wider text-sindoor hover:text-himal transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            )}

            {/* Switch between Sign In / Sign Up prompt */}
            {authMode !== "forgotPassword" && (
              <div className="text-center pt-2 font-body-md text-on-surface-variant text-sm">
                {authMode === "signIn" ? (
                  <p>
                    Don't have an account yet?{" "}
                    <button
                      type="button"
                      id="link-to-signup"
                      onClick={() => {
                        setAuthMode("signUp");
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className="font-semibold text-sindoor hover:text-himal underline-offset-2 hover:underline ml-1"
                    >
                      Create one
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{" "}
                    <button
                      type="button"
                      id="link-to-signin"
                      onClick={() => {
                        setAuthMode("signIn");
                        setPassword("");
                        setConfirmPassword("");
                      }}
                      className="font-semibold text-sindoor hover:text-himal underline-offset-2 hover:underline ml-1"
                    >
                      Sign in
                    </button>
                  </p>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-outline-variant/30 text-center">
              <p className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-on-surface-variant/70">
                PURKHA · The League of Nepali People
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
