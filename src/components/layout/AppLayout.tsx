import { ReactNode, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { PurkhaLogo } from "@/components/brand/PurkhaLogo";

export function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface overflow-hidden h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="relative bg-surface-bright flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-16 max-w-full top-0 border-b border-outline-variant z-50 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            aria-label="Toggle sidebar"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/" aria-label="PURKHA home">
            <PurkhaLogo size="sm" />
          </Link>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link to="/dashboard" className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-on-surface-variant hover:text-sindoor transition-colors" activeProps={{ className: "!text-himal border-b-2 border-sindoor pb-1" }}>
            Dashboard
          </Link>
          <Link to="/builder" className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-on-surface-variant hover:text-sindoor transition-colors" activeProps={{ className: "!text-himal border-b-2 border-sindoor pb-1" }}>
            Vamshavali
          </Link>
          <Link to="/settings" className="font-label-sm text-label-sm uppercase tracking-[0.14em] text-on-surface-variant hover:text-sindoor transition-colors" activeProps={{ className: "!text-himal border-b-2 border-sindoor pb-1" }}>
            Settings
          </Link>
        </nav>
        <div className="flex items-center space-x-6">
          <div className="relative hidden lg:block">
            <input aria-label="Search ancestors" className="bg-surface-container-low border-b border-outline py-1 px-4 text-sm focus:outline-none focus:border-sindoor w-64" placeholder="Search purkha…" type="search" />
            <span className="material-symbols-outlined absolute right-2 top-1 text-outline">search</span>
          </div>
          <button className="font-label-sm text-label-sm uppercase tracking-widest text-lokta-light bg-himal px-6 py-2 transition-colors duration-300 hover:bg-sindoor-deep">
            Export
          </button>
        </div>
        <div className="absolute inset-x-0 -bottom-[3px] h-[3px] dhaka-band opacity-90" style={{ backgroundSize: "6px 3px" }} />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SideNavBar */}
        <aside className={`bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flat no shadows z-40 ${isSidebarCollapsed ? 'hidden' : 'flex absolute inset-y-0 left-0 w-64'} md:relative md:flex flex-col py-terrace-padding pt-8 transition-all duration-300 shrink-0 ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'}`}>
          <div className={`px-4 mb-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-3 w-full">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant shrink-0">
                  <img className="w-full h-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOho9_qLkGjMoUnehxDs_7YReXVgC00GZqXhWIitrSbZHi6ObyKBPQ-jSh6SjZdd_tYfIWw8v1-tVYTPbPEd0aqBcaI33higf_Py77kYcDdQiz1krOzAX8NidPPHaYY27tgTSM0D_q1fT5EEm2wF76HAR3E_4hBdljTcsOTS_esXJ_O-fHvg12plUCvAYKJ1DR0rf-ATAlXX5urbFfyxP98au_HZPNdEZeiI3pHV-KfmAq8vJucc23w" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-headline-md text-himal text-lg truncate">
                    {user?.displayName || (user?.email ? user.email.split('@')[0] : "PURKHA Member")}
                  </h2>
                  <p className="font-label-xs text-label-xs uppercase tracking-wider text-sindoor truncate">{user?.email || "Keeper of the Vamsha"}</p>
                </div>
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant shrink-0 mb-2">
                <img className="w-full h-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOho9_qLkGjMoUnehxDs_7YReXVgC00GZqXhWIitrSbZHi6ObyKBPQ-jSh6SjZdd_tYfIWw8v1-tVYTPbPEd0aqBcaI33higf_Py77kYcDdQiz1krOzAX8NidPPHaYY27tgTSM0D_q1fT5EEm2wF76HAR3E_4hBdljTcsOTS_esXJ_O-fHvg12plUCvAYKJ1DR0rf-ATAlXX5urbFfyxP98au_HZPNdEZeiI3pHV-KfmAq8vJucc23w" />
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:flex w-5 h-12 items-center justify-center hover:bg-surface-container-highest transition-colors text-outline absolute top-8 -right-[21px] bg-surface-container-low border border-outline-variant border-l-0 rounded-r-2xl z-50"
            >
              <span className="material-symbols-outlined text-sm -ml-1">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
          </div>

          <nav className="flex-1 space-y-2 flex flex-col items-center w-full">
            <Link to="/builder" className={`flex items-center space-x-3 text-on-surface-variant py-2 hover:bg-surface-container-highest transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} activeProps={{ className: "!bg-secondary-container !text-on-secondary-container font-semibold" }}>
              <span className="material-symbols-outlined">account_tree</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Vamshavali</span>}
            </Link>
            <Link to="/dashboard" className={`flex items-center space-x-3 text-on-surface-variant py-2 hover:bg-surface-container-highest transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} activeProps={{ className: "!bg-secondary-container !text-on-secondary-container font-semibold" }}>
              <span className="material-symbols-outlined">dashboard</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Dashboard</span>}
            </Link>
            <a className={`flex items-center space-x-3 text-on-surface-variant dark:text-on-surface-variant py-2 hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} href="#">
              <span className="material-symbols-outlined">photo_library</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Media</span>}
            </a>
            <Link to="/settings" className={`flex items-center space-x-3 text-on-surface-variant py-2 hover:bg-surface-container-highest transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} activeProps={{ className: "!bg-secondary-container !text-on-secondary-container font-semibold" }}>
              <span className="material-symbols-outlined">settings</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Settings</span>}
            </Link>
          </nav>
          
          <div className="w-full mt-auto mb-4 flex flex-col items-center gap-4">
            {!isSidebarCollapsed && (
              <p className="px-6 font-devanagari text-sm text-sindoor/80 text-center" lang="ne">हाम्रा पुर्खा, हाम्रो पहिचान</p>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 text-error dark:text-error-fixed py-2 hover:bg-error-container dark:hover:bg-error-container/20 transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`}
            >
              <span className="material-symbols-outlined">logout</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 min-w-0 relative bg-surface-container-low overflow-hidden canvas-container transition-all duration-300" id="canvas">
          {children}
        </main>
      </div>
    </div>
  );
}
