import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PurkhaLogo } from "@/components/brand/PurkhaLogo";

function NotFoundComponent() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-surface lokta-texture px-4 overflow-hidden">
      <div className="absolute inset-x-0 top-0 dhaka-band" />
      <div className="absolute inset-0 lattice-pattern opacity-30 pointer-events-none" />
      <div className="relative max-w-md text-center">
        <Link to="/" className="inline-block mb-10">
          <PurkhaLogo size="md" />
        </Link>
        <p className="font-devanagari text-7xl font-bold text-sindoor" lang="ne">४०४</p>
        <h1 className="mt-4 font-headline-md text-headline-md text-himal">This branch of the tree is missing</h1>
        <p className="mt-3 font-body-md text-on-surface-variant">
          The page you're looking for doesn't exist or has been moved. Let's take you back to your roots.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-himal px-6 py-3 font-label-sm text-label-sm uppercase tracking-widest text-lokta-light transition-colors hover:bg-sindoor-deep"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface lokta-texture px-4">
      <div className="max-w-md text-center">
        <PurkhaLogo size="md" className="mb-8" />
        <h1 className="font-headline-md text-headline-md text-himal">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "PURKHA — The Ancestors · The League of Nepali People" },
      {
        name: "description",
        content:
          "PURKHA (पुर्खा) is the league of Nepali people — build your vamshavali, remember your ancestors and carry their stories to the generations ahead.",
      },
      { name: "author", content: "PURKHA" },
      { name: "theme-color", content: "#8E1230" },
      { property: "og:site_name", content: "PURKHA" },
      { property: "og:title", content: "PURKHA — The Ancestors · The League of Nepali People" },
      {
        property: "og:description",
        content: "हाम्रा पुर्खा, हाम्रो पहिचान — Our ancestors, our identity. Build your family's vamshavali.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/brand/vamshavali-hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&family=Space+Mono:wght@400;700&family=Fira+Sans:wght@300;400;500;600&family=Noto+Serif+Devanagari:wght@400;600;700&family=Mukta:wght@400;600&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "alternate icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { AuthProvider } from "../hooks/useAuth";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  );
}
