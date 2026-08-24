import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/layout/PageLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Heirloom | Purkha Register" },
      { name: "description", content: "Document Your Legacy - Preserve your family history on digital Lokta." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center overflow-hidden lokta-texture bg-lokta-light border-b border-lokta-border">
        <div className="absolute inset-0 lattice-pattern pointer-events-none opacity-40"></div>
        <div className="px-margin-desktop grid grid-cols-12 gap-gutter relative z-10 w-full py-terrace-padding">
          <div className="col-span-12 md:col-span-7 flex flex-col justify-center space-y-8">
            <div className="flex items-center gap-2">
              <span className="w-12 h-[1px] bg-dhaka-maroon"></span>
              <span className="font-label-xs text-label-xs text-dhaka-maroon uppercase">
                Authentic Lineage Records
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-primary max-w-2xl">
              Document Your <span className="italic text-terracotta-wood">Legacy</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
              Preserve your family history on digital Lokta. A contemporary archival experience
              inspired by the enduring craftsmanship of the Himalayas.
            </p>
            <div className="flex gap-4 items-center">
              <Link to="/builder" className="bg-primary text-on-primary font-label-sm text-label-sm px-8 py-4 flex items-center gap-2 hover:bg-slate-dusk transition-colors">
                Begin Archive <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
              <button className="border border-slate-dusk text-slate-dusk font-label-sm text-label-sm px-8 py-4 hover:bg-surface-container transition-colors">
                View Sample Registry
              </button>
            </div>
          </div>
          <div className="col-span-12 md:col-span-5 flex justify-center items-center">
            <div className="relative w-full aspect-[4/5] max-w-sm">
              <div className="absolute -inset-4 border border-lokta-border rotate-3 -z-10 bg-white/50"></div>
              <div className="w-full h-full signature-frame overflow-hidden bg-surface-container-high animate-drift">
                <img
                  className="w-full h-full object-cover"
                  alt="A high-quality editorial photograph of a weathered, handmade Lokta paper book"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvV7YHWL6AitGluGx3_urHNFYhGAHCuV3gfqycPkh6Pg97oO1deE8tqQmtttwkjum5di8npY75G-u4ZhqDPtH6Wb-IsnJAne3XzwJzBgCq12d-9kIZSN5ahlY_zW34s7m6jGau_AsDVe6SYIoiNE3YLjhmWGV7D7GRzxsF1wySuW8Dn8lPdEkjW6XuwqO9x6NuAtXRoGUHX_mCkcvw3Z9yP-9ZJ1D90g0vn1dmeXUFhVYvPTCCzCmOTQ"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-dhaka-maroon text-white p-4 font-label-xs text-label-xs uppercase tracking-widest flex flex-col items-center">
                <span>Vol.</span>
                <span className="text-xl font-bold">01</span>
              </div>
            </div>
          </div>
        </div>
        {/* Terraced Ornament */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-surface to-transparent"></div>
      </section>

      {/* "The Modern Manuscript" Section */}
      <section className="bg-surface py-terrace-padding px-margin-desktop">
        <div className="text-center mb-16 space-y-4">
          <span className="font-label-sm text-label-sm text-terracotta-wood tracking-[0.2em] uppercase">
            The Craft
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary">The Modern Manuscript</h2>
          <div className="w-24 h-1 bg-lokta-border mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="flex flex-col bg-lokta-light border border-lokta-border p-8 space-y-6 hover:translate-y-[-8px] transition-transform duration-500">
            <div className="h-48 w-full bg-surface-container relative overflow-hidden group">
              <div className="absolute inset-0 lattice-pattern group-hover:opacity-60 transition-opacity"></div>
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                alt="A close-up shot of a traditional Newari lattice window design"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuClHiWl3_dZzjLaq32FvmDR-n-hfD27McgsWwYwHBLAsa4yDlbP04qh6x2ikxMqtgFJiszGXiZtOhtD1foNf9Fofc9Axj1J9c64oOTQwx1cBMbCo0zKRklI_CjhTtosL_TIEea-FDIyhLO73SHjwu9bNKGzC7dRqKbtIohnVr_s3Ap7-PZ8kkjdlGPCGsQ2tD8FHUmugSIMvIHC4APryNgMgMIfiKRY5UxWVXmGdZqIS1Yl3hl2YS10Ww"
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-headline-md text-headline-md text-primary">Artisanal Nodes</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Every branch of your ancestry is represented by digital modules inspired by
                wood-carving motifs.
              </p>
              <Link to="/" className="inline-flex items-center gap-1 font-label-sm text-label-sm text-dhaka-maroon font-bold group">
                Learn more <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col bg-lokta-light border border-lokta-border p-8 space-y-6 mt-12 hover:translate-y-[-8px] transition-transform duration-500">
            <div className="h-48 w-full bg-surface-container relative overflow-hidden group">
              <div className="absolute inset-0 lattice-pattern group-hover:opacity-60 transition-opacity"></div>
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                alt="A stack of beautifully aged documents with elegant Nepali calligraphy written on yellowed, fibrous Lokta paper."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZIm3NP52svBQGJ_T6hf2XFUz7TQgBgjxiDFqEz33iaCYDy95zyoSiXmS632wYMtiyS05z-QJQFE0GNIrpNqQwMMFozJ8cFSjSodsKbXOTF7eEMc4jex46ho4BItwAGaBeCRfAK-jzfVYlnDMsDIq9UbEpWst_4f5PRG1ATytX0qztGQjsG81rSbCkGHcu2LEov_eBfTROJMtyPG-fkfxlMsecYXNtZmKFGPOr6y-NiVwHmA8Ko4GIdw"
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-headline-md text-headline-md text-primary">Digital Archiving</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Preserve physical artifacts through high-fidelity digital rendering that maintains
                their tactile essence.
              </p>
              <Link to="/" className="inline-flex items-center gap-1 font-label-sm text-label-sm text-dhaka-maroon font-bold group">
                Learn more <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col bg-lokta-light border border-lokta-border p-8 space-y-6 hover:translate-y-[-8px] transition-transform duration-500">
            <div className="h-48 w-full bg-surface-container relative overflow-hidden group">
              <div className="absolute inset-0 lattice-pattern group-hover:opacity-60 transition-opacity"></div>
              <img
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                alt="A conceptual digital family tree visualization using a 'Lungta' prayer flag aesthetic"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe1VmmR1nN5_VefQWrsXgxpRhSbi2m-2yt5x3sBLmuNSHy4TyClv4MTfOIsqvMxwsKaE68FIBC1yID6BLs9gn0fCUczrmooqsarS_Ek3HGKazHRIq_SH8u_qyoaK0CdOBiplcMw11ZSCe9HvpbIqu_YkwcAWEEBQb3RAS87lSiG_vO_b0gZVYSg_58fkKS0AOhe_oauBTNwD57I-DIhoEFN-67K9w44QDnLWexVu7e6hrd9KVWBFiWcQ"
              />
            </div>
            <div className="space-y-3">
              <h3 className="font-headline-md text-headline-md text-primary">Lineage Visuals</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                View your family connections through flowing Lungta-inspired relationship maps that
                breathe life into data.
              </p>
              <Link to="/" className="inline-flex items-center gap-1 font-label-sm text-label-sm text-dhaka-maroon font-bold group">
                Learn more <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">chevron_right</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* "From the Volumes" Showcase */}
      <section className="bg-surface-container-low py-terrace-padding border-y border-lokta-border">
        <div className="px-margin-desktop grid grid-cols-12 gap-gutter items-center">
          <div className="col-span-12 md:col-span-4 space-y-6">
            <h2 className="font-headline-lg text-headline-lg text-primary">From the Volumes</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Explore curated family registries from our community. Every lineage is a volume of
              history waiting to be read.
            </p>
            <div className="pt-4 flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 border border-lokta-border bg-surface-bright group hover:bg-terracotta-wood hover:text-white transition-all cursor-pointer">
                <span className="font-label-sm text-label-sm font-bold opacity-30 group-hover:opacity-100">
                  01
                </span>
                <div className="flex-1">
                  <p className="font-headline-md text-[18px] leading-tight">The Shakya Genealogy</p>
                  <p className="font-label-xs text-label-xs opacity-70">
                    324 Descendants • Kathmandu Valley
                  </p>
                </div>
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div className="flex items-center gap-4 p-4 border border-lokta-border bg-surface-bright group hover:bg-terracotta-wood hover:text-white transition-all cursor-pointer">
                <span className="font-label-sm text-label-sm font-bold opacity-30 group-hover:opacity-100">
                  02
                </span>
                <div className="flex-1">
                  <p className="font-headline-md text-[18px] leading-tight">The Sherpa Archives</p>
                  <p className="font-label-xs text-label-xs opacity-70">
                    156 Descendants • Solu-Khumbu
                  </p>
                </div>
                <span className="material-symbols-outlined">menu_book</span>
              </div>
              <div className="flex items-center gap-4 p-4 border border-lokta-border bg-surface-bright group hover:bg-terracotta-wood hover:text-white transition-all cursor-pointer">
                <span className="font-label-sm text-label-sm font-bold opacity-30 group-hover:opacity-100">
                  03
                </span>
                <div className="flex-1">
                  <p className="font-headline-md text-[18px] leading-tight">Tharu Lineage Record</p>
                  <p className="font-label-xs text-label-xs opacity-70">
                    412 Descendants • Terai Region
                  </p>
                </div>
                <span className="material-symbols-outlined">menu_book</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-8">
            <div className="grid grid-cols-2 gap-4 h-[500px]">
              <div className="row-span-2 relative border-r-4 border-dhaka-maroon overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="A portrait-style archival photo of an elderly Himalayan patriarch"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxV9HeNLEozNztx0X-qHwnmA-vPn3KbvRuifRv35ZyFaqIiuGsZnJZNiQUYwwwe9Y2PnVRqhOCq90d1Q9xdSzUFzNnjq0zvp3MPL7GelISyp8mGmK6zT7jOQ1tQYJykCPDGfO_bc_B9Pd9H-EmXOki0BgdtI0nfV5q-7GzV1Go6sUKhqEyzvFg51gf0vvl9VcYZydpGSI6cEu4_6-geyb1vNc5UZiYlD8X0WOS0ivReDVBpr-0YNPT5g"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="font-label-xs text-label-xs uppercase">Featured Lineage</p>
                  <p className="font-headline-md text-headline-md">Harka Bahadur</p>
                </div>
              </div>
              <div className="relative overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="A detailed digital rendering of a family tree diagram"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmvLPetLiwX6Y9KzG5ejJhslKjETPxMkg7gIRvMsK7vyiQ97PaMrE-X9ElsvDhoNjj37Jdo_wttCBdj4_DkEQrq6STR5VVW7jNcHVUDh-9VAqpgqA74Lo70xlIm32uSn-4XMJ-A0SpECOg69c6pnNug7IiEOO3KIkPxjKcR6k9hv5pbknU7psTOTMBEaT-iQ796FiUW8vOXb2vwbj4hpiMlFUPD3s4zc46tEw3ffUfDW8A1UGrT37HAg"
                />
              </div>
              <div className="relative overflow-hidden signature-frame">
                <img
                  className="w-full h-full object-cover"
                  alt="An atmospheric shot of an archive room filled with floor-to-ceiling wooden shelves of Lokta paper scrolls"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvSToi3UHUsLIdXJU7mG6DkFPvsBWGcs31tzFEJ_siE6_drdPqmFBH5-asLYSqVvGo3rvvwaf36lsAjwORTGxtvlypW8TNRbq4EJK-Ah-mMauJ-v1ufpjxFhcS41i7G-vaJ85WMi1UwOBMH-lcEL2WKNjpurq9NN-KEzN5aWMJNlNaQjMqVzc92DvuaEJTpQUgnQxWcMdQ4be3NBms8ttjetha9zmxchKfe4UN3_II_CtRunEQwj-vOQ"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA: The Ancestry Node */}
      <section className="py-24 px-margin-desktop flex justify-center">
        <div className="max-w-4xl w-full bg-surface-container-high border-l-[6px] border-dhaka-maroon p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[120px]">account_tree</span>
          </div>
          <div className="flex-1 space-y-6 relative z-10">
            <h2 className="font-headline-xl text-headline-lg text-primary">
              Ready to anchor your roots?
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Join thousands of families in the Purkha Register. Create your first lineage node
              today and start connecting the threads of your past.
            </p>
            <Link to="/builder" className="bg-dhaka-maroon text-on-primary font-label-sm text-label-sm px-10 py-5 uppercase tracking-widest hover:opacity-90 transition-opacity inline-block">
              Create Your Branch
            </Link>
          </div>
          <div className="w-48 h-48 rounded-full border-2 border-dashed border-terracotta-wood p-4 animate-spin-[20s]">
            <div className="w-full h-full rounded-full bg-lokta-light flex items-center justify-center text-center p-4">
              <span className="font-label-xs text-label-xs text-terracotta-wood uppercase font-bold">
                12,000+ Centuries Recorded
              </span>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
