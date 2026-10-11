import { ReactNode } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface" suppressHydrationWarning>
      <NavBar />
      <main className="flex-1 mt-[72px]" suppressHydrationWarning>
        {children}
      </main>
      <Footer />
    </div>
  );
}
