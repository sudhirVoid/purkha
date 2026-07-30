import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login | Purkha Register" }],
  }),
  component: LoginPage,
});

const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .refine((email) => {
      // Basic check to discourage temp emails (can be expanded)
      const allowedDomains = ["gmail.com", "googlemail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];
      const domain = email.split("@")[1];
      return allowedDomains.includes(domain?.toLowerCase() || "");
    }, "Please use a verified email provider (Google, Outlook, Yahoo, iCloud, etc.)."),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "magic_link">("password");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Login data:", data);
    toast.success("Authentication successful! Welcome back.");
    setIsSubmitting(false);
  };

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center lokta-texture bg-lokta-light py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-20"></div>

        <div className="max-w-md w-full space-y-8 bg-surface-bright p-10 signature-frame relative z-10 shadow-xl">
          <div>
            <h2 className="mt-2 text-center font-headline-xl text-[36px] font-bold text-primary">
              Welcome Back
            </h2>
            <p className="mt-2 text-center font-body-md text-on-surface-variant">
              Continue your journey into the archives.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                  placeholder="archivist@gmail.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error font-body-md">{errors.email.message}</p>
                )}
              </div>

              {authMode === "password" && (
                <div>
                  <label
                    htmlFor="password"
                    className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-error font-body-md">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {authMode === "password" && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-terracotta-wood focus:ring-terracotta-wood border-outline-variant bg-surface-container"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block font-body-md text-sm text-on-surface-variant"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/"
                    className="font-label-sm text-dhaka-maroon hover:text-terracotta-wood uppercase transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? "Authenticating..."
                  : authMode === "password"
                    ? "Sign In"
                    : "Send Magic Link"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-bright text-on-surface-variant font-label-sm uppercase tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "password" ? "magic_link" : "password")}
                className="font-label-sm text-sm text-slate-dusk border-b border-slate-dusk hover:text-terracotta-wood hover:border-terracotta-wood transition-colors pb-1 uppercase tracking-wider"
              >
                {authMode === "password" ? "Use Magic Link / OTP" : "Use Password Instead"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
