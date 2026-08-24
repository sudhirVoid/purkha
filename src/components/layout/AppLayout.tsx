import { ReactNode, useState } from "react";
import { Link } from "@tanstack/react-router";

export function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="bg-surface font-body-md text-on-surface overflow-hidden h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface-bright dark:bg-surface-dim flex justify-between items-center w-full px-margin-desktop py-4 max-w-full docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows z-50">
        <div className="flex items-center space-x-4">
          <span className="font-headline-lg text-headline-lg text-tertiary dark:text-tertiary-fixed-dim italic">Heirloom</span>
        </div>
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-tertiary dark:hover:text-tertiary-fixed transition-colors">
            Heritage
          </Link>
          <Link to="/builder" className="font-label-sm text-label-sm text-primary dark:text-primary-fixed border-b-2 border-tertiary pb-1 hover:text-tertiary dark:hover:text-tertiary-fixed transition-colors">
            Library
          </Link>
          <Link to="/" className="font-label-sm text-label-sm text-on-surface-variant dark:text-on-surface-variant hover:text-tertiary dark:hover:text-tertiary-fixed transition-colors">
            Archive
          </Link>
        </nav>
        <div className="flex items-center space-x-6">
          <div className="relative hidden lg:block">
            <input className="bg-surface-container-low border-b border-outline py-1 px-4 text-sm focus:outline-none focus:border-tertiary w-64" placeholder="Search ancestors..." type="text" />
            <span className="material-symbols-outlined absolute right-2 top-1 text-outline">search</span>
          </div>
          <button className="font-label-sm text-label-sm uppercase tracking-widest text-on-primary bg-primary px-6 py-2 transition-all duration-300 hover:opacity-80">
            Export
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* SideNavBar */}
        <aside className={`bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline flat no shadows z-40 hidden md:flex flex-col py-terrace-padding space-y-4 pt-8 transition-all duration-300 relative shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <div className={`px-4 mb-8 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant shrink-0">
                  <img className="w-full h-full object-cover" alt="User Profile" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEOho9_qLkGjMoUnehxDs_7YReXVgC00GZqXhWIitrSbZHi6ObyKBPQ-jSh6SjZdd_tYfIWw8v1-tVYTPbPEd0aqBcaI33higf_Py77kYcDdQiz1krOzAX8NidPPHaYY27tgTSM0D_q1fT5EEm2wF76HAR3E_4hBdljTcsOTS_esXJ_O-fHvg12plUCvAYKJ1DR0rf-ATAlXX5urbFfyxP98au_HZPNdEZeiI3pHV-KfmAq8vJucc23w" />
                </div>
                <div className="overflow-hidden">
                  <h2 className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim text-lg truncate">Purkha Register</h2>
                  <p className="font-label-sm text-label-sm opacity-70 truncate">Lineage Keeper</p>
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
              className="w-5 h-12 flex items-center justify-center hover:bg-surface-container-highest transition-colors text-outline absolute top-8 -right-[21px] bg-surface-container-low border border-outline-variant border-l-0 rounded-r-2xl z-50"
            >
              <span className="material-symbols-outlined text-sm -ml-1">{isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}</span>
            </button>
          </div>

          <nav className="flex-1 space-y-2 flex flex-col items-center w-full">
            <Link to="/builder" className={`flex items-center space-x-3 bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed-dim rounded-full py-2 transition-all duration-300 w-full hover:opacity-90 ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`}>
              <span className="material-symbols-outlined">account_tree</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Ancestry</span>}
            </Link>
            <a className={`flex items-center space-x-3 text-on-surface-variant dark:text-on-surface-variant py-2 hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} href="#">
              <span className="material-symbols-outlined">menu_book</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Documents</span>}
            </a>
            <a className={`flex items-center space-x-3 text-on-surface-variant dark:text-on-surface-variant py-2 hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} href="#">
              <span className="material-symbols-outlined">photo_library</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Media</span>}
            </a>
            <a className={`flex items-center space-x-3 text-on-surface-variant dark:text-on-surface-variant py-2 hover:bg-surface-container-highest dark:hover:bg-surface-variant transition-all duration-300 rounded-full w-full ${isSidebarCollapsed ? 'justify-center mx-0 w-12' : 'px-4 mx-2 max-w-[calc(100%-16px)]'}`} href="#">
              <span className="material-symbols-outlined">settings</span>
              {!isSidebarCollapsed && <span className="font-label-sm text-label-sm">Settings</span>}
            </a>
          </nav>
        </aside>

        {/* Main Canvas Area */}
        <main className="flex-1 min-w-0 relative bg-surface-container-low overflow-hidden canvas-container transition-all duration-300" id="canvas">
          {children}
        </main>
      </div>
    </div>
  );
}
