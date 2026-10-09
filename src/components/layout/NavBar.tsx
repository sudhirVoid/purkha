import { Link } from "@tanstack/react-router";
import { PurkhaLogo } from "@/components/brand/PurkhaLogo";

const navLinkClass =
  "font-label-sm text-label-sm uppercase tracking-[0.14em] text-on-surface-variant hover:text-sindoor transition-colors";

export function NavBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed top-0 z-50 w-full border-b border-lokta-border/70 bg-surface-bright/85 backdrop-blur-md"
    >
      <div className="flex h-[72px] w-full items-center justify-between px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-10">
          <Link to="/" aria-label="PURKHA home">
            <PurkhaLogo size="md" />
          </Link>
          <div className="hidden md:flex gap-7 items-center">
            <Link to="/builder" className={navLinkClass}>
              Vamshavali
            </Link>
            <a href="/#lineages" className={navLinkClass}>
              Lineages
            </a>
            <a href="/#manifesto" className={navLinkClass}>
              Our Story
            </a>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative hidden lg:block">
            <label htmlFor="nav-search" className="sr-only">
              Search ancestors
            </label>
            <input
              id="nav-search"
              className="w-56 bg-surface-container border-b border-himal/40 focus:border-sindoor focus:ring-0 focus:outline-none text-body-md font-body-md pl-3 pr-10 py-1.5 transition-colors placeholder:text-on-surface-variant/60"
              placeholder="Search purkha…"
              type="search"
            />
            <span className="material-symbols-outlined absolute right-2 top-1.5 text-himal/70 text-[20px]">
              search
            </span>
          </div>
          <Link
            to="/login"
            id="nav-join-league"
            className="group inline-flex items-center gap-2 bg-sindoor-deep px-5 py-2.5 font-label-sm text-label-sm uppercase tracking-[0.16em] text-lokta-light transition-colors hover:bg-himal"
          >
            Join the League
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
              arrow_right_alt
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
