# AI Context Memory

> **Note to AI:** Update this file as you make significant progress, switch tasks, or encounter important architectural decisions. This prevents losing context across sessions.

## Current State
- The project is a full-stack genealogy application powered by **TanStack Start**, **React 19**, **Tailwind CSS v4**, and **@xyflow/react** (React Flow).
- **Backend & Persistence:** Neon PostgreSQL database managed via **Drizzle ORM** with a strict Controller-Service pattern in `src/backend/`. Users authenticate via **Firebase Auth** (isolated in `src/hooks/useAuth.tsx`), and records are synchronized to PostgreSQL via `/api/auth/sync`. Trees are stored and retrieved through `/api/trees`.
- **Canvas & Layout Engine:** The family tree builder (`src/components/family-tree/`) features:
  - **Hierarchical Bounding-Box Layout (`auto-layout.ts`):** Arranges generations into horizontal strata where children are strictly bounded within their parents' horizontal footprint.
  - **Couple Bottom Baseline Equalization:** Dynamically determines $H_{\text{couple}} = \max(\text{heights})$ and assigns equal `minHeight` so both spouses sit on the identical bottom line.
  - **Bond Node Depth Placement:** Marriage nodes sit strictly at `BOND_DEPTH = 36px` below the equalized couple bottom.
  - **Polygamous / Multi-Spouse Handling:** Provides an active spouse switcher on person nodes. Inactive spouses hide their exclusive downward children, while ancestor disconnection guards ensure non-descendant trees are never orphaned.
  - **Dual View Modes:** Canvas interactive graph and structured hierarchical outline (`TreeView.tsx`).
- **Design System:** Grounded in a tactile Himalayan / "Digital Lokta" aesthetic, featuring mineral generation tone ribbons with Devanagari numerals, Dhaka maroon accents, and organic card borders.

## Active Tasks / Next Steps (Phase 4)
- **Tree Export:** Add high-resolution PNG, SVG, and PDF export for the visual canvas and tree view.
- **Sharing & Collaboration:** Generate public read-only share links for family trees.
- **Internationalization:** Multi-language localization (English / Nepali / Hindi).
- **Cloud Media Upload:** Direct image and media attachment storage (Firebase Storage / Cloudflare R2 / S3) instead of local base64.

## Key Learnings & Decisions
- **Lovable Integration:** Never rewrite published git history (no force push, rebase, or squash on published commits).
- **Authentication & Route Protection:**
  - Encapsulate all client Firebase Auth logic inside `src/hooks/useAuth.tsx` (`AuthProvider`). Never import `firebase/auth` directly in UI components.
  - Protect routes (`/builder`, `/dashboard`) using TanStack Router `beforeLoad` interceptors with redirects. Do not use inline component fallback guards.
  - Sync user profiles to PostgreSQL via `/api/auth/sync` immediately following authentication.
- **AutoLayout Invariants:**
  - Horizontal strata per generation $Y_g = g \times \Delta Y$.
  - Subtrees must remain within parent horizontal boundaries to prevent edge crossing and lineage overlaps.
  - Always align couple cards to a shared bottom baseline to keep marriage bonds horizontally and vertically centered.
  - Check ancestor connectivity when filtering descendant nodes to avoid cutting off unrelated branches when switching spouses.
- **Agent Cleanliness:** Always remove temporary scratch scripts and diagnostic tools before completing tasks.
