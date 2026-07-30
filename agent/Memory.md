# AI Context Memory

> **Note to AI:** Update this file as you make significant progress, switch tasks, or encounter important architectural decisions. This prevents losing context across sessions.

## Current State
- The project uses **TanStack Start**, **React**, **Tailwind CSS**, and **React Flow**.
- `FamilyFlow.tsx` handles the visual tree. We have completed the core visual logic including adding relations, auto-layout, rich metadata editing via Shadcn UI Sheets, and media viewing via Dialogs.
- The `agent` directory contains the project documentation (`PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Design.md`, `Memory.md`).

## Active Tasks
- Awaiting instructions to move to Phase 3: Persistence (saving the tree to localStorage or backend) so data isn't lost on reload.

## Key Learnings & Decisions
- **Lovable Integration:** Git history must not be forcefully rewritten.
- **AutoLayout Logic:** Spouses are grouped into "units" with their children to ensure they remain side-by-side during X-axis alignment, and bonds are re-centered in a second pass.
- **Collapse/Minimize Logic:** Implemented using a BFS that determines what should be hidden. Crucially, a protected `collapsedSet` ensures that collapsed nodes remain visible, while their spouses and bonds are hidden alongside downward descendants. Collapse is disabled for nodes with < 2 connections.
- **UI Components:** Utilized `shadcn/ui` (Radix) for drawers (`Sheet`) and popups (`Dialog`) to keep the canvas clean while offering detailed editing.
