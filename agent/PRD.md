# Project Requirements Document (PRD)

## Project Name
Purkha (Himalayan Ancestral Lineage & Family Relationship Builder)

## Overview
Purkha is a web-based genealogical platform designed to help users visually build, preserve, and explore their ancestral lineage and family histories. Rooted in Himalayan aesthetics and Vedic traditions, Purkha combines a fluid, node-based canvas with an intuitive hierarchical outline, enabling families to document generations, biographical memories, and rich media in an archival format.

## Target Users
- Individuals and families documenting their ancestral tree (*Vamshavali*).
- Diaspora communities seeking an emotional, cultural connection to their roots.
- Historians, researchers, and community elders cataloging lineage and oral histories.

## Core Features & Requirements

### 1. Dual Viewing Experience
- **Interactive Visual Canvas:** Node-based drag-and-drop tree powered by `@xyflow/react` with custom minimap, zoom/pan controls, background grid, and smooth curved relationship lines (*Lungta* prayer cords).
- **Ancestral Hierarchy Outline (`TreeView`):** Collapsible, nested tree view providing a clean, accessible overview of generational tiers and branches.
- **Seamless Mode Toggle:** Switch instantly between the visual canvas and outline mode without losing context or active selection.

### 2. Node & Relationship Modeling
- **Relationship Types:** Add Parent (Father/Mother), Spouse, Sibling, and Child with immediate graph recalculation.
- **Bond Nodes:** Dedicated marriage union nodes placed between spouses, displaying wedding dates, children counts, and union rings.
- **Multi-Spouse & Polygamous Lineage Support:**
  - Individuals with multiple marriages feature an interactive spouse switcher on their card.
  - Selecting a spouse dynamically filters downward children to show that couple's descendants.
  - Built-in orphan prevention ensures unrelated ancestral branches remain visible when toggling spouses.

### 3. Layout Engine & Visual Invariants
- **Horizontal Generation Strata:** Nodes are organized into clean horizontal generational tiers ($Y_g = g \times \Delta Y$).
- **Subtree Bounding-Box Containment:** Children and subtrees stay strictly within the horizontal boundaries set by their parents, eliminating overlapping lineages.
- **Couple Bottom Baseline Equalization:** Spouses with different card heights (due to varying biographies or media attachments) are equalized to the same `minHeight`, ensuring they sit on the exact same bottom baseline.
- **Calibrated Bond Depth:** Bond nodes sit at a consistent `36px` depth below the couple's equalized bottom baseline, perfectly centered between partners.
- **Collapsible Subtrees:** Ability to collapse/minimize lower generations to navigate extensive multi-generational trees with ease.

### 4. Person Metadata & Rich Media
- **Identity & Gender:** Name, gender identification (Male, Female, Other) with distinct Himalayan accent styling.
- **Profile Avatar:** Dedicated profile picture displayed directly on the card with hover-to-upload capability.
- **Biographical Sheet:** Slide-out drawer (`BuilderSidebar`) for recording birth date, death date, birthplace, current residence, occupation, and life narrative.
- **Media Attachments:** Multi-format media strip (images, audio, video) with full-screen inspection `Dialog`.
- **Generational Ribbons:** Generational depth tags styled with Devanagari numerals (१, २, ३...) and cyclical Himalayan mineral palettes (`toneFor`).

### 5. Authentication, Persistence & Multi-Tree Management
- **Firebase Authentication:** Secure email/password and Google OAuth login encapsulated in `src/hooks/useAuth.tsx`.
- **PostgreSQL Database (NeonDB + Drizzle ORM):** Server-side persistence via `/api/trees` and automatic profile synchronization via `/api/auth/sync`.
- **Tree Dashboard (`/dashboard`):** Manage multiple distinct family trees (create, rename, delete, open in builder).
- **Route Protection:** Protected routes (`/builder`, `/dashboard`) secured using TanStack Router's `beforeLoad` redirects.

### 6. Export & Sharing (Upcoming)
- High-resolution tree export (PNG, SVG, PDF).
- Public read-only sharing links for family members.
- Multi-language localization (English, Nepali, Hindi).
