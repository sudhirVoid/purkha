import { Link } from "@tanstack/react-router";
import { BRAND, PurkhaLogo } from "@/components/brand/PurkhaLogo";

const footerLink =
  "font-body-md text-[15px] text-lokta-light/70 hover:text-sayapatri transition-colors";

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-himal text-lokta-light">
      <div className="dhaka-band" />
      <div className="grid grid-cols-1 gap-12 px-margin-mobile md:px-margin-desktop py-16 md:grid-cols-12">
        <div className="md:col-span-5 space-y-5">
          <PurkhaLogo size="lg" tone="inverse" showTagline />
          <p className="max-w-sm font-body-md text-lokta-light/70">
            A home for every Nepali family — in the hills, the Terai, the Himal and across the world —
            to remember the ones who came before.
          </p>
          <p className="font-devanagari text-lg text-sayapatri" lang="ne">
            {BRAND.motto}
          </p>
        </div>

        <div className="md:col-span-3 space-y-4">
          <h2 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-sayapatri">The League</h2>
          <ul className="space-y-2.5">
            <li><Link to="/builder" className={footerLink}>Vamshavali Builder</Link></li>
            <li><a href="/#lineages" className={footerLink}>Lineages of the League</a></li>
            <li><a href="/#manifesto" className={footerLink}>Our Story</a></li>
          </ul>
        </div>

        <div className="md:col-span-4 space-y-4">
          <h2 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-sayapatri">Stewardship</h2>
          <ul className="space-y-2.5">
            <li><Link to="/" className={footerLink}>Preservation Ethics</Link></li>
            <li><Link to="/" className={footerLink}>Data Privacy</Link></li>
            <li><Link to="/" className={footerLink}>Archival Standards</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-lokta-light/10 px-margin-mobile md:px-margin-desktop py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="font-label-xs text-label-xs text-lokta-light/50 tracking-wider">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.league}
        </p>
        <p className="font-label-xs text-label-xs text-lokta-light/50 tracking-wider">
          Made for every Nepali, everywhere.
        </p>
      </div>
    </footer>
  );
}
