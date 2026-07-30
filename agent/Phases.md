# Project Phases

This document breaks down the project into manageable steps to guide development incrementally.

## Phase 1 & 2: Core Visualization, Rich Data & Styling (Completed)
- Set up TanStack Start framework and `@xyflow/react` base graph.
- Create basic "Person" nodes and "Bond" (marriage) nodes.
- Implement structural actions: Add Parent, Add Spouse, Add Sibling, Add Child.
- Add gender attributes with distinct styling (colors/icons).
- Implement media attachments (Image, Video, Audio) with a full-screen `Dialog` viewer.
- Add marriage dates to bond nodes.
- Implement detailed Person Metadata via a slide-out `Sheet` (Drawer).
- Implement hierarchical collapsing (minimizing sub-trees).
- Polish `autoLayout` algorithm to keep couples adjacent.

## Phase 3: Persistence & Data Management (Current)
- Implement state persistence (save the graph state to localStorage or a backend database).
- Allow users to create multiple distinct family trees.
- Setup user authentication (if cloud storage is implemented).

## Phase 4: Advanced Features & Export (Next)
- Add export functionality (Export tree as PNG/PDF).
- Implement read-only sharing links for family trees.
- Multi-language support (English / Nepali / Hindi).
