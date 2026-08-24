import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login & Register | Purkha Register" }],
  }),
  component: LoginPage,
});

const baseSchema = {
  email: z
    .string()
    .email("Please enter a valid email address.")
    .refine((email) => {
      const allowedDomains = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
      const domain = email.split("@")[1];
      return allowedDomains.includes(domain?.toLowerCase() || "");
    }, "Please use a verified email provider (Google, Outlook, Yahoo, iCloud, etc.)."),
};

const loginSchema = z.object({
  ...baseSchema,
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  ...baseSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const forgotSchema = z.object({
  ...baseSchema,
});

type AuthMode = "login" | "register" | "forgot";

function LoginPage() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = useForm<z.infer<typeof registerSchema>>({ resolver: zodResolver(registerSchema) });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<z.infer<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      toast.success("Authentication successful! Welcome back.");
      // Redirect to builder after successful login
      navigate({ to: "/builder" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (data: z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      toast.success(result.message);
      setAuthMode("login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgot = async (data: z.infer<typeof forgotSchema>) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      toast.success(result.message);
      setAuthMode("login");
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
              {authMode === "login" && "Welcome Back"}
              {authMode === "register" && "Begin Your Journey"}
              {authMode === "forgot" && "Recover Access"}
            </h2>
            <p className="mt-2 text-center font-body-md text-on-surface-variant">
              {authMode === "login" && "Continue your journey into the archives."}
              {authMode === "register" && "Create an identity to anchor your roots."}
              {authMode === "forgot" && "Enter your email to receive a secure reset link."}
            </p>
          </div>

          {/* Login Form */}
          {authMode === "login" && (
            <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit(onLogin)}>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="archivist@gmail.com"
                    {...registerLogin("email")}
                  />
                  {loginErrors.email && <p className="mt-1 text-sm text-error font-body-md">{loginErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Password</label>
                  <input
                    type="password"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="••••••••"
                    {...registerLogin("password")}
                  />
                  {loginErrors.password && <p className="mt-1 text-sm text-error font-body-md">{loginErrors.password.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <button type="button" onClick={() => setAuthMode("forgot")} className="font-label-sm text-dhaka-maroon hover:text-terracotta-wood uppercase transition-colors">
                    Forgot password?
                  </button>
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Authenticating..." : "Sign In"}
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {authMode === "register" && (
            <form className="mt-8 space-y-6" onSubmit={handleSignupSubmit(onRegister)}>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Username</label>
                  <input
                    type="text"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="archivist"
                    {...registerSignup("username")}
                  />
                  {signupErrors.username && <p className="mt-1 text-sm text-error font-body-md">{signupErrors.username.message}</p>}
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="archivist@gmail.com"
                    {...registerSignup("email")}
                  />
                  {signupErrors.email && <p className="mt-1 text-sm text-error font-body-md">{signupErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Password</label>
                  <input
                    type="password"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="••••••••"
                    {...registerSignup("password")}
                  />
                  {signupErrors.password && <p className="mt-1 text-sm text-error font-body-md">{signupErrors.password.message}</p>}
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Creating Identity..." : "Create Account"}
                </button>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot" && (
            <form className="mt-8 space-y-6" onSubmit={handleForgotSubmit(onForgot)}>
              <div className="space-y-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Email Address</label>
                  <input
                    type="email"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="archivist@gmail.com"
                    {...registerForgot("email")}
                  />
                  {forgotErrors.email && <p className="mt-1 text-sm text-error font-body-md">{forgotErrors.email.message}</p>}
                </div>
              </div>

              <div>
                <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-bright text-on-surface-variant font-label-sm uppercase tracking-wider">
                  Options
                </span>
              </div>
            </div>

            <div className="mt-6 text-center space-x-4">
              {authMode !== "login" && (
                <button type="button" onClick={() => setAuthMode("login")} className="font-label-sm text-sm text-slate-dusk border-b border-slate-dusk hover:text-terracotta-wood hover:border-terracotta-wood transition-colors pb-1 uppercase tracking-wider">
                  Back to Sign In
                </button>
              )}
              {authMode !== "register" && (
                <button type="button" onClick={() => setAuthMode("register")} className="font-label-sm text-sm text-slate-dusk border-b border-slate-dusk hover:text-terracotta-wood hover:border-terracotta-wood transition-colors pb-1 uppercase tracking-wider">
                  Create Account
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
