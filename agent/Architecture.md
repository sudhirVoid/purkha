# Architecture & Technical Details

## Technical Stack
- **Framework:** TanStack Start (SSR, file-based routing)
- **Backend Architecture:** Controller-Service Pattern (`src/backend/`, framework-agnostic)
- **Database:** NeonDB (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **Authentication:** Firebase Authentication (isolated client-side via `src/hooks/useAuth.tsx`), synced with PostgreSQL
- **UI Library:** React 19, Tailwind CSS v4, Radix UI primitives (`shadcn/ui`)
- **Graph/Node Engine:** `@xyflow/react` (React Flow)
- **Icons:** `lucide-react`
- **State Management:** React Context (`ActionsContext`, `AuthContext`), TanStack Query (`@tanstack/react-query`)

## Application Routes & Navigation
1. **Root Layout (`src/routes/__root.tsx`):**
   - Configures global providers: `AuthProvider`, TanStack `QueryClientProvider`.
   - Injects global navigation header and footer shells.
2. **Landing Page (`src/routes/index.tsx`):**
   - Public landing page highlighting Himalayan ancestral heritage, core features, interactive preview, and calls-to-action.
3. **Authentication (`src/routes/login.tsx`):**
   - Handles email/password and Google OAuth sign-in.
   - Triggers profile sync to `/api/auth/sync` upon authentication.
4. **Dashboard (`src/routes/dashboard.tsx`):**
   - Protected route. Lists user's family trees, allows creating new trees, deleting trees, and opening trees in the builder.
5. **Builder Route (`src/routes/builder.tsx`):**
   - Protected route guarded via TanStack Router's `beforeLoad` interceptor.
   - Loads the active tree by `?treeId=` query parameter or falls back to local/demo state.
6. **Settings (`src/routes/settings.tsx`):**
   - User profile settings and preferences.
7. **API Routes (`src/routes/api/`):**
   - Lightweight routing handlers delegating directly to backend controllers:
     - `/api/auth/sync`: Synchronizes Firebase user records with the PostgreSQL database.
     - `/api/trees` & `/api/trees/$id`: CRUD operations for family trees.

## Family Flow Architecture (`src/components/family-tree/`)
The visual tree engine is modularized into focused components and utilities:

- **`index.tsx` / `FamilyFlow.tsx`:**
  - Root container wrapping tree state, persistence sync, view mode switcher (Canvas vs Tree Outline), and `ActionsContext` provider.
- **`FamilyFlowInner.tsx`:**
  - Houses the `@xyflow/react` canvas, custom controls, minimap, background grid, and multi-spouse active selection state.
  - Automatically runs layout reconciliation whenever graph topology or active spouse changes.
- **`tree-view/TreeView.tsx`:**
  - Collapsible, hierarchical list/outline mode offering an alternative structured overview of ancestral lineage.
- **`BuilderSidebar.tsx`:**
  - Slide-out `Sheet` (drawer) for inspecting and editing rich biographical metadata (names, dates, places, occupations, life stories) and media attachments.
- **`nodes/`:**
  - `PersonNode.tsx`: Renders individuals with avatar upload, generation tone ribbons (Devanagari numerals), gender badges, multi-spouse pill selectors, and action triggers.
  - `BondNode.tsx`: Renders marriage union pill badges with wedding dates, children counts, and ring icons.
  - `CollapseBtn.tsx`: Interactive collapse/expand toggle for subtrees.
  - `MediaStrip.tsx`: Compact preview strip for attached photos, audio, and documents.
- **`edges/`:**
  - `FamilyEdge.tsx`: Custom bezier curved edges styled to emulate Himalayan *Lungta* prayer cord ribbons.
- **`generations.ts`:**
  - Computes ancestral generation levels and assigns Himalayan mineral palette tones (`toneFor`) with Devanagari numerals.

## Hierarchical Layout Engine (`auto-layout.ts`)
The auto-layout algorithm organizes the family tree into clean, non-overlapping horizontal strata with predictable visual balance:

1. **Horizontal Generation Strata:**
   - Canvas is structured into horizontal generation tiers ($Y_g = g \times \Delta Y$).
   - Spouses reside in the same horizontal band as their partner.
2. **Subtree Bounding-Box Invariant:**
   - Children of any couple are strictly constrained within the horizontal span (bounding box) established by their parents, ensuring subtrees never cross or overlap adjacent lineages.
3. **Couple Bottom Baseline Equalization:**
   - When cards have varying heights (e.g., due to bio details or media strips), the layout determines $H_{\text{couple}} = \max(\text{height}_1, \text{height}_2)$ and sets an equalized `minHeight` on both nodes.
   - Both partners sit on the exact same bottom baseline.
4. **Bond Node Depth Placement:**
   - Bond (marriage) nodes are placed strictly below the couple's equalized bottom baseline at a calibrated offset (`BOND_DEPTH = 36px`), centered between the two partners.
5. **Multi-Spouse & Polygamous Lineage Handling:**
   - In families with multiple marriages, each partner can toggle the active spouse.
   - Downward descendant filtering hides children belonging to inactive marriages.
   - An ancestor connectivity check prevents disconnected or orphaned subtrees from rendering.

## Directory Structure
```
Purkha/
├── agent/                         # AI documentation, guidelines, memory, and specs
├── src/
│   ├── backend/                   # Framework-agnostic backend logic
│   │   ├── controllers/           # HTTP controllers (auth, tree)
│   │   ├── services/              # Business logic & Drizzle ORM queries
│   │   ├── db/                    # Drizzle schema (PostgreSQL) & client
│   │   └── lib/                   # Backend utilities
│   ├── components/
│   │   ├── brand/                 # Brand identity & heritage logo
│   │   ├── family-tree/           # Family tree visualization module
│   │   │   ├── edges/             # Custom React Flow edges (FamilyEdge)
│   │   │   ├── nodes/             # Custom React Flow nodes (PersonNode, BondNode)
│   │   │   ├── tree-view/         # Hierarchical outline view (TreeView)
│   │   │   ├── ActionsContext.tsx # Graph action dispatch context
│   │   │   ├── auto-layout.ts     # Bounding-box hierarchical layout algorithm
│   │   │   ├── BuilderSidebar.tsx # Biographical & media editor sheet
│   │   │   ├── FamilyFlowInner.tsx# React Flow canvas implementation
│   │   │   ├── generations.ts     # Generation depth & tone calculations
│   │   │   ├── index.tsx          # FamilyFlow main entry & mode switcher
│   │   │   └── types.ts           # Family tree domain interfaces
│   │   ├── layout/                # Shell headers, footers, and navigation
│   │   └── ui/                    # Reusable shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.tsx            # Firebase Auth context & methods
│   │   └── useFamilyTree.ts       # Graph mutation & state hook
│   ├── lib/                       # Frontend helpers & error reporting
│   ├── routes/                    # TanStack Start file-based routes
│   │   ├── api/                   # API routes binding to backend controllers
│   │   ├── __root.tsx             # Root layout & providers
│   │   ├── index.tsx              # Landing page
│   │   ├── builder.tsx            # Family tree builder (protected)
│   │   ├── dashboard.tsx          # User trees dashboard (protected)
│   │   ├── login.tsx              # Auth sign-in & sign-up
│   │   └── settings.tsx           # User settings
│   ├── router.tsx                 # TanStack Router configuration
│   ├── server.ts                  # SSR entry
│   ├── start.ts                   # Client entry
│   └── styles.css                 # Global CSS tokens & Tailwind styling
├── drizzle.config.ts              # Drizzle ORM configuration
├── package.json                   # Dependencies & scripts
└── vite.config.ts                 # Vite & TanStack configuration
```
