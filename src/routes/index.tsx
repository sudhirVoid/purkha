import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";
import { BRAND, PurkhaMark } from "@/components/brand/PurkhaLogo";
import { PrayerFlags } from "@/components/brand/PrayerFlags";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PURKHA — The Ancestors · The League of Nepali People" },
      {
        name: "description",
        content:
          "Build your family's vamshavali, honor your purkha and connect with the league of Nepali people across the world.",
      },
    ],
  }),
  component: LandingPage,
});

const STATS = [
  { value: "142", label: "Jati & Janajati", note: "communities, one league" },
  { value: "124", label: "Mother tongues", note: "every name, in its own voice" },
  { value: "77", label: "Districts", note: "from Taplejung to Darchula" },
  { value: "∞", label: "Diaspora", note: "wherever Nepalis call home" },
];

const PILLARS = [
  {
    icon: "account_tree",
    title: "Vamshavali Builder",
    np: "वंशावली",
    body: "Draw your lineage generation by generation — parents, partners and children — on an infinite canvas or a collapsible, colour-coded family tree.",
    img: "/brand/pillar_tree_1791560975133.jpg",
    alt: "A family tree visualization strung like lungta prayer flags",
  },
  {
    icon: "travel_explore",
    title: "From Thalo to the World",
    np: "थलो",
    body: "Record birthplaces, the ancestral thalo and where every branch lives today — from Ilam and Jumla to Doha, London and Denver.",
    img: "/brand/pillar_thalo_1791560987590.jpg",
    alt: "A traditional carved Newari lattice window",
  },
  {
    icon: "graphic_eq",
    title: "Voices of the Elders",
    np: "सम्झना",
    body: "Attach photographs, voice recordings and stories to each ancestor, so the memory of every hajurba and hajurama outlives us all.",
    img: "/brand/pillar_voices_1791561001178.jpg",
    alt: "Aged documents with Nepali calligraphy on lokta paper",
  },
];

const STEPS = [
  { n: "१", title: "Plant the root", body: "Begin with the eldest purkha you know — a great-grandparent, a name from a story." },
  { n: "२", title: "Grow the branches", body: "Add partners and children. Each couple folds open to reveal the next generation." },
  { n: "३", title: "Share with your kul", body: "Invite family to fill the gaps, so the vamshavali grows with every voice." },
];

const LINEAGES = [
  { title: "The Shakya Genealogy", meta: "324 descendants · Kathmandu Valley" },
  { title: "The Sherpa Archives", meta: "156 descendants · Solukhumbu" },
  { title: "Tharu Lineage Record", meta: "412 descendants · Terai" },
];

function LandingPage() {
  return (
    <PageLayout>
      {/* ───────────── Hero ───────────── */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden lokta-texture bg-lokta-light border-b border-lokta-border"
      >
        <div className="absolute inset-0 paper-glow pointer-events-none" />
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-30" />
        <PrayerFlags className="absolute top-0 left-0 opacity-90" count={18} />

        <div className="relative z-10 grid grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop pt-24 pb-20 lg:min-h-[calc(100svh-72px)] items-center">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center space-y-8">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 bg-sindoor" />
              <span className="font-label-xs text-label-xs uppercase tracking-[0.24em] text-sindoor">
                {BRAND.meaning} · {BRAND.league}
              </span>
            </div>

            <h1 id="hero-title" className="font-headline-xl text-headline-xl text-himal max-w-3xl">
              Honor your <span className="italic text-sindoor-gradient">purkha.</span>
              <br />
              Carry their names forward.
            </h1>

            <p className="font-devanagari text-2xl md:text-3xl text-sindoor-deep" lang="ne">
              {BRAND.motto}
            </p>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              PURKHA is the league of Nepali people — a shared home to build your family's
              vamshavali, remember the ones who came before, and pass their stories to the
              generations who follow.
            </p>

            <div className="flex flex-wrap gap-4 items-center pt-2">
              <Link
                to="/builder"
                id="hero-begin-vamshavali"
                className="group inline-flex items-center gap-2 bg-sindoor-deep px-8 py-4 font-label-sm text-label-sm uppercase tracking-[0.16em] text-lokta-light shadow-[0_12px_30px_-12px_rgb(142_18_48/0.7)] transition-all hover:bg-himal hover:-translate-y-0.5"
              >
                Begin your Vamshavali
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_right_alt
                </span>
              </Link>
              <a
                href="#lineages"
                id="hero-explore-lineages"
                className="inline-flex items-center gap-2 border border-himal px-8 py-4 font-label-sm text-label-sm uppercase tracking-[0.16em] text-himal transition-colors hover:bg-himal hover:text-lokta-light"
              >
                Explore lineages
              </a>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 flex justify-center items-center pt-8 lg:pt-0">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-5 border border-lokta-border rotate-3 bg-white/40" />
              <div className="relative signature-frame overflow-hidden bg-surface-container-high animate-drift">
                <img
                  className="w-full h-auto object-cover"
                  src="/brand/vamshavali-hero.jpg"
                  alt="An illustrated vamshavali — a great tree with ancestral medallions, rooted before the Himalaya and a pagoda temple"
                  width={896}
                  height={1200}
                  fetchPriority="high"
                />
              </div>

              {/* Floating sample node */}
              <div className="absolute -left-6 md:-left-14 top-[18%] w-56 bg-surface-bright/95 backdrop-blur border border-lokta-border shadow-xl p-4 border-l-4 border-l-himal">
                <p className="font-label-xs text-label-xs uppercase tracking-widest text-on-surface-variant">
                  Generation I · Root
                </p>
                <p className="font-headline-md text-lg text-himal leading-tight mt-1">Prithvi Narayan Shah</p>
                <p className="font-label-xs text-label-xs text-on-surface-variant mt-1">1723 – 1775 · Gorkha</p>
              </div>

              <div className="absolute -bottom-7 -right-4 md:-right-8 bg-sindoor-deep text-lokta-light px-5 py-4 flex items-center gap-3 shadow-xl">
                <PurkhaMark className="h-9 w-auto" title="" />
                <div className="leading-tight">
                  <p className="font-devanagari text-lg" lang="ne">वंशावली</p>
                  <p className="font-label-xs text-[10px] uppercase tracking-[0.2em] text-sayapatri">Vamshavali</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── League stats ───────────── */}
      <section aria-label="The league in numbers" className="bg-himal text-lokta-light">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-lokta-light/10">
          {STATS.map((s) => (
            <div key={s.label} className="px-6 md:px-10 py-10 text-center md:text-left">
              <p className="font-brand text-4xl md:text-5xl font-bold text-sayapatri">{s.value}</p>
              <p className="mt-2 font-label-sm text-label-sm uppercase tracking-[0.18em]">{s.label}</p>
              <p className="mt-1 font-body-md text-sm text-lokta-light/60">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="dhaka-band" />
      </section>

      {/* ───────────── Pillars ───────────── */}
      <section aria-labelledby="pillars-title" className="bg-surface py-24 px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-16 space-y-4 reveal">
          <span className="font-label-sm text-label-sm text-sindoor tracking-[0.24em] uppercase">
            What PURKHA keeps
          </span>
          <h2 id="pillars-title" className="font-headline-lg text-headline-lg text-himal">
            A living archive for every Nepali family
          </h2>
          <div className="mx-auto h-1 w-24 bg-gradient-to-r from-sindoor via-sayapatri to-himal" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {PILLARS.map((p, i) => (
            <article
              key={p.title}
              className={`brand-card reveal flex flex-col bg-lokta-light border border-lokta-border p-8 space-y-6 ${i === 1 ? "md:mt-12" : ""}`}
            >
              <div className="relative h-48 w-full overflow-hidden bg-surface-container group">
                <img
                  className="h-full w-full object-cover grayscale-[60%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                  src={p.img}
                  alt={p.alt}
                  loading="lazy"
                  width={600}
                  height={384}
                />
                <span className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center bg-sindoor-deep text-lokta-light">
                  <span className="material-symbols-outlined">{p.icon}</span>
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-headline-md text-headline-md text-himal">{p.title}</h3>
                  <span className="font-devanagari text-sindoor" lang="ne">{p.np}</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">{p.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ───────────── How it works ───────────── */}
      <section aria-labelledby="steps-title" className="relative bg-surface-container-low border-y border-lokta-border py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
        <div className="absolute inset-0 lattice-pattern opacity-20 pointer-events-none" />
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-4 space-y-5 reveal">
            <span className="font-label-sm text-label-sm text-sindoor tracking-[0.24em] uppercase">How it works</span>
            <h2 id="steps-title" className="font-headline-lg text-headline-lg text-himal">
              From one name to a whole vamsha
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Most families can name three generations. Together, we can name ten — and make sure the
              eleventh knows where it comes from.
            </p>
          </div>
          <ol className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="reveal relative bg-surface-bright border border-lokta-border p-7 pt-10">
                <span
                  className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-himal font-devanagari text-2xl text-sayapatri ring-4 ring-surface-container-low"
                  lang="ne"
                  aria-hidden="true"
                >
                  {s.n}
                </span>
                <h3 className="font-headline-md text-xl text-himal">{s.title}</h3>
                <p className="mt-2 font-body-md text-on-surface-variant">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────── Lineages of the League ───────────── */}
      <section id="lineages" aria-labelledby="lineages-title" className="bg-surface py-24 scroll-mt-20">
        <div className="px-margin-mobile md:px-margin-desktop grid grid-cols-12 gap-gutter items-center">
          <div className="col-span-12 md:col-span-4 space-y-6 reveal">
            <span className="font-label-sm text-label-sm text-sindoor tracking-[0.24em] uppercase">From the league</span>
            <h2 id="lineages-title" className="font-headline-lg text-headline-lg text-himal">Lineages of the League</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              From the Valley to the high Himal and the plains of the Terai — every lineage is a
              chapter of Nepal's story waiting to be read.
            </p>
            <ul className="pt-2 flex flex-col gap-3">
              {LINEAGES.map((l, i) => (
                <li
                  key={l.title}
                  className="group flex items-center gap-4 p-4 border border-lokta-border bg-surface-bright cursor-pointer transition-all hover:bg-himal hover:text-lokta-light hover:border-himal"
                >
                  <span className="font-devanagari text-xl text-sindoor group-hover:text-sayapatri" lang="ne">
                    {["०१", "०२", "०३"][i]}
                  </span>
                  <div className="flex-1">
                    <p className="font-headline-md text-[18px] leading-tight">{l.title}</p>
                    <p className="font-label-xs text-label-xs opacity-70 mt-0.5">{l.meta}</p>
                  </div>
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-2 gap-4 h-[520px]">
              <div className="row-span-2 relative overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="An archival portrait of an elderly Himalayan patriarch"
                  src="/brand/lineage_patriarch_1791561013270.jpg"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-himal/85 via-himal/10 to-transparent" />
                <div className="absolute bottom-5 left-5 text-lokta-light">
                  <p className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-sayapatri">Featured purkha</p>
                  <p className="font-headline-md text-headline-md">Harka Bahadur</p>
                </div>
              </div>
              <div className="relative overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="A detailed rendering of a family tree diagram"
                  src="/brand/lineage_diagram_1791561025890.jpg"
                  loading="lazy"
                />
              </div>
              <div className="relative overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="An archive room of wooden shelves holding lokta paper scrolls"
                  src="/brand/lineage_archive_1791561043606.jpg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── Manifesto ───────────── */}
      <section
        id="manifesto"
        aria-labelledby="manifesto-title"
        className="relative bg-sindoor-deep text-lokta-light py-24 px-margin-mobile md:px-margin-desktop overflow-hidden scroll-mt-20"
      >
        <div className="absolute inset-0 lattice-pattern opacity-[0.15] pointer-events-none invert" />
        <PurkhaMark className="absolute -right-10 -bottom-10 h-[380px] w-auto opacity-[0.07]" title="" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8 reveal">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.28em] text-sayapatri">Our story</span>
          <h2 id="manifesto-title" className="font-devanagari text-4xl md:text-6xl leading-tight" lang="ne">
            {BRAND.motto}
          </h2>
          <p className="font-headline-md text-xl md:text-2xl italic text-lokta-light/85">
            "{BRAND.mottoEnglish}."
          </p>
          <p className="font-body-lg text-body-lg text-lokta-light/75 max-w-2xl mx-auto">
            Purkha means ancestors. We built PURKHA because a nation's memory lives in its families —
            in the names whispered at Shraddha, the stories told around the fire at Dashain, the
            photographs fading in a tin box. This is a league for all of us: every jati, every
            language, every village, every Nepali far from home.
          </p>
        </div>
      </section>

      {/* ───────────── Final CTA ───────────── */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop flex justify-center bg-surface">
        <div className="reveal max-w-5xl w-full bg-surface-container-high border-l-[6px] border-sindoor-deep p-10 md:p-14 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-[0.07]">
            <span className="material-symbols-outlined text-[140px] text-himal">account_tree</span>
          </div>
          <div className="flex-1 space-y-6 relative z-10">
            <h2 className="font-headline-xl text-headline-lg text-himal">
              Your purkha are waiting to be remembered.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Join the league. Plant your first root today and start connecting the threads of your
              family's past — for the children who will one day ask, "where do we come from?"
            </p>
            <Link
              to="/builder"
              id="cta-plant-root"
              className="inline-flex items-center gap-2 bg-himal px-10 py-5 font-label-sm text-label-sm uppercase tracking-[0.18em] text-lokta-light transition-colors hover:bg-sindoor-deep"
            >
              Plant your first root
              <span className="material-symbols-outlined">park</span>
            </Link>
          </div>
          <div className="relative h-52 w-52 shrink-0">
            <svg viewBox="0 0 200 200" className="absolute inset-0 animate-spin-slow" aria-hidden="true">
              <defs>
                <path id="motto-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
              </defs>
              <text className="fill-sindoor" style={{ fontFamily: "var(--font-label)", fontSize: 11, letterSpacing: 4 }}>
                <textPath href="#motto-ring">
                  PURKHA · THE ANCESTORS · THE LEAGUE OF NEPALI PEOPLE ·
                </textPath>
              </text>
            </svg>
            <div className="absolute inset-8 rounded-full bg-lokta-light border border-lokta-border flex items-center justify-center">
              <PurkhaMark className="h-20 w-auto" title="" />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
