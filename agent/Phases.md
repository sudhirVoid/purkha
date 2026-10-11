# Project Phases

This document breaks down the project into manageable milestones to guide development incrementally.

## Phase 1 & 2: Core Visualization, Rich Data & Styling (Completed)
- Set up TanStack Start framework and `@xyflow/react` base graph.
- Create basic "Person" nodes and "Bond" (marriage) nodes.
- Implement structural actions: Add Parent, Add Spouse, Add Sibling, Add Child.
- Add gender attributes with distinct styling (colors/icons).
- Implement media attachments (Image, Video, Audio) with a full-screen `Dialog` viewer.
- Add marriage dates and children count to bond nodes.
- Implement detailed Person Metadata via a slide-out `Sheet` (Drawer).
- Implement hierarchical collapsing (minimizing sub-trees).
- Initial `autoLayout` algorithm keeping couples adjacent.

## Phase 3: Persistence, Authentication & Architecture (Completed)
- Set up Neon PostgreSQL serverless database with Drizzle ORM.
- Implement backend Controller-Service pattern inside `src/backend/` (`tree.controller.ts`, `tree.service.ts`, `auth.controller.ts`, `auth.service.ts`).
- Integrate Firebase Authentication (email/password and Google OAuth).
- Encapsulate Firebase Auth client-side within `src/hooks/useAuth.tsx`.
- Implement automatic backend user profile sync via `/api/auth/sync`.
- Implement user dashboard (`/dashboard`) supporting multiple distinct family trees.
- Secure protected routes (`/builder`, `/dashboard`) using TanStack Router's `beforeLoad` interceptor.
- Implement tree persistence APIs (`/api/trees` and `/api/trees/$id`).

## Phase 3.5: Advanced Layout & Multi-Spouse Engine (Completed)
- Implement **Hierarchical Bounding-Box Layout Algorithm** (`auto-layout.ts`):
  - Horizontal rectangle generation strata ($Y_g = g \times \Delta Y$).
  - Subtree bounding-box containment (children strictly within parents' span).
- **Couple Bottom Baseline Equalization:**
  - Equalize card `minHeight` across partners so both sit on the identical bottom baseline regardless of unequal bio/media content.
- **Bond Node Depth Placement:**
  - Place marriage bond nodes strictly `BOND_DEPTH = 36px` below the equalized couple bottom.
- **Polygamous / Multi-Spouse Support:**
  - Interactive spouse switcher on person nodes.
  - Context-aware downward descendant filtering hiding children of inactive marriages.
  - Disconnected orphan prevention ensuring unrelated ancestral branches remain visible.
- **Dual View Modes:**
  - Toggle between interactive React Flow canvas and structured hierarchical outline (`TreeView.tsx`).
- **Generation Tone System:**
  - Compute ancestral generations and assign Himalayan mineral tones (`toneFor`) with Devanagari numerals (१, २, ३...).

## Phase 4: Advanced Features, Collaboration & Export (Current / Next)
- Add export functionality (Export family tree canvas or outline as high-resolution PNG, SVG, or PDF).
- Implement public read-only sharing links for family trees.
- Multi-language localization (English / Nepali / Hindi) for cultural authenticity.
- Cloud media storage (Firebase Storage / Cloudflare R2 / AWS S3) replacing local base64 images.
- Tree version history and change audit logs.
