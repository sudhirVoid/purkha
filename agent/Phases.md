# Project Phases

This document breaks down the project into manageable steps to guide development incrementally.

## Phase 1: Core Tree Visualization (Completed)
- Set up TanStack Start framework.
- Implement `@xyflow/react` base graph.
- Create basic "Person" nodes and "Bond" (marriage) nodes.
- Implement structural actions: Add Parent, Add Spouse, Add Sibling, Add Child.

## Phase 2: Rich Node Data & Styling (Current)
- Add gender attributes with distinct styling (colors/icons).
- Implement media attachments (Image, Video, Audio) directly on nodes.
- Add marriage dates to bond nodes.
- Polish toolbars and node menus.

## Phase 3: Persistence & Data Management (Next)
- Implement state persistence (save the graph state to localStorage or a backend database).
- Allow users to create multiple distinct family trees.
- Setup user authentication (if cloud storage is implemented).

## Phase 4: Advanced Features & Export
- Add export functionality (Export tree as PNG/PDF).
- Implement read-only sharing links for family trees.
- Add detailed profile pages for family members (clicking a node opens a side panel with extensive biographical details).
- Multi-language support (English / Nepali / Hindi).
