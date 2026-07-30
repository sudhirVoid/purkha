import { Link } from "@tanstack/react-router";

export function NavBar() {
  return (
    <nav className="bg-surface-bright border-b border-outline-variant flex justify-between items-center w-full px-margin-desktop py-4 max-w-full fixed top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="font-headline-lg text-headline-lg text-tertiary italic">
          Heirloom
        </Link>
        <div className="hidden md:flex gap-6 items-center">
          <Link
            to="/"
            className="font-label-sm text-label-sm text-primary border-b-2 border-tertiary pb-1"
          >
            Heritage
          </Link>
          <Link
            to="/"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Library
          </Link>
          <Link
            to="/"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-tertiary transition-colors"
          >
            Archive
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <input
            className="bg-surface-container border-b border-slate-dusk focus:border-terracotta-wood focus:ring-0 focus:outline-none text-body-md font-body-md pl-2 pr-10 py-1 transition-all"
            placeholder="Search ancestors..."
            type="text"
          />
          <span className="material-symbols-outlined absolute right-2 top-1 text-slate-dusk">
            search
          </span>
        </div>
        <Link
          to="/login"
          className="font-label-sm text-label-sm bg-terracotta-wood text-on-primary px-6 py-3 rounded-DEFAULT hover:opacity-90 transition-all uppercase tracking-widest inline-block"
        >
          Start Your Journey
        </Link>
      </div>
    </nav>
  );
}
