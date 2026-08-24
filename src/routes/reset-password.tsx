import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Reset Password | Purkha Register" }],
  }),
  component: ResetPasswordPage,
});

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get("token");
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetSchema>>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: z.infer<typeof resetSchema>) => {
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: data.password }),
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      toast.success(result.message);
      navigate({ to: "/login" });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <PageLayout>
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center lokta-texture bg-lokta-light py-12 px-4">
          <div className="max-w-md w-full bg-surface-bright p-10 signature-frame shadow-xl text-center">
            <h2 className="text-xl font-headline-md text-error mb-4">Invalid Link</h2>
            <p className="font-body-md mb-6">The password reset link is invalid or has expired.</p>
            <Link to="/login" className="font-label-sm text-dhaka-maroon uppercase tracking-widest border-b border-dhaka-maroon">
              Return to Login
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center lokta-texture bg-lokta-light py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-20"></div>

        <div className="max-w-md w-full space-y-8 bg-surface-bright p-10 signature-frame relative z-10 shadow-xl">
          <div>
            <h2 className="mt-2 text-center font-headline-xl text-[32px] font-bold text-primary">
              Reset Password
            </h2>
            <p className="mt-2 text-center font-body-md text-on-surface-variant">
              Enter a new secure password for your account.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">New Password</label>
                <input
                  type="password"
                  className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && <p className="mt-1 text-sm text-error font-body-md">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface mb-2 uppercase">Confirm Password</label>
                <input
                  type="password"
                  className="appearance-none block w-full px-4 py-3 border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-1 focus:ring-terracotta-wood focus:border-terracotta-wood font-body-md transition-colors"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-error font-body-md">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <button type="submit" disabled={isSubmitting} className="group relative w-full flex justify-center py-4 px-4 border border-transparent font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-dhaka-maroon hover:bg-terracotta-wood focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-terracotta-wood transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? "Updating..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
}
