# AI Rules & Boundaries

These rules must be strictly followed when assisting with the Purkha project.

## General Boundaries
1. **Lovable Syncing:** This project is connected to Lovable. **DO NOT** rewrite published git history (no force pushing, rebasing, amending, or squashing commits that are already pushed). Doing so breaks synchronization.
2. **Configuration Preservation:** Do not manually edit `@lovable.dev/vite-tanstack-config` defaults in `vite.config.ts`. Avoid breaking the existing `components.json` structure.

## Technical Rules
1. **Libraries to Use:**
   - Tailwind CSS for all styling. Use CSS variables defined in `src/styles.css` for theme colors.
   - `lucide-react` for icons.
   - `shadcn/ui` (Radix primitives + Tailwind) for UI components.
   - `@xyflow/react` for anything related to the visual graph.
2. **Libraries to Avoid:**
   - Do not use styled-components, Emotion, or other CSS-in-JS libraries. Stick strictly to Tailwind.
   - Do not introduce alternative routing libraries (e.g., react-router v6 or next/router), stick to TanStack Start.
3. **Code Style:**
   - Write modern React (Functional components, Hooks).
   - Ensure strict TypeScript typing for all props, states, and API responses.
   - Use meaningful variable names and keep components small and focused.
   - **CRITICAL:** Do NOT use single-letter variable names (like `a`, `e`, `n`, `p`, etc.) anywhere in the codebase. Always use descriptive, meaningful names (e.g., `actions`, `event`, `node`, `person`).

## Error Handling
- Use the existing `reportLovableError` utility for capturing boundary errors.
- Ensure graceful fallbacks for media (images/video/audio) that fail to load in the graph.
- Provide clear visual feedback in the UI when graph actions cannot be completed (e.g., "Add parent first").

## Backend & API Standards
1. **Architecture:** Use the Controller-Service pattern for all backend features. Keep this logic tightly encapsulated inside `src/backend/`.
2. **Framework Agnosticism:** Never write raw business logic or database queries directly inside `src/routes/api/` files. The TanStack router files should only pass the Request object to a Controller.
3. **Database:** Use Drizzle ORM exclusively for database interactions (do not use Prisma or raw SQL).
4. **Environment Variables & Secrets:**
   - Server-only secrets MUST NOT be prefixed with `VITE_`.
   - Any secret intended for the frontend MUST be prefixed with `VITE_`.
   - Never push `.env` to Git. Always use `.env.example` to document required variables for other developers.
   - When deploying (e.g., to Netlify), ensure secrets are added directly to the platform's environment variables.
