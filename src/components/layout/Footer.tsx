import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="bg-surface-container w-full py-12 border-t border-outline-variant mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-desktop w-full gap-8">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <span className="font-headline-md text-headline-md text-tertiary italic">
            Heirloom
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant opacity-70">
            Handcrafted in the Himalayas
          </span>
        </div>
        <div className="flex gap-8">
          <Link
            to="/"
            className="font-label-xs text-label-xs text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity uppercase"
          >
            Archival Standards
          </Link>
          <Link
            to="/"
            className="font-label-xs text-label-xs text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity uppercase"
          >
            Data Privacy
          </Link>
          <Link
            to="/"
            className="font-label-xs text-label-xs text-on-surface-variant opacity-70 hover:opacity-100 transition-opacity uppercase"
          >
            Preservation Ethics
          </Link>
        </div>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-slate-dusk">history_edu</span>
          <span className="material-symbols-outlined text-slate-dusk">temple_buddhist</span>
        </div>
      </div>
      <div className="text-center mt-12">
        <p className="font-label-xs text-label-xs text-on-surface-variant opacity-50">
          © {new Date().getFullYear()} Heirloom Purkha Register. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
