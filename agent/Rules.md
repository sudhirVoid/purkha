# AI Rules & Boundaries

These rules must be strictly followed when assisting with the Purkha project.

## General Boundaries
1. **Lovable Syncing:** This project is connected to Lovable. **DO NOT** rewrite published git history (no force pushing, rebasing, amending, or squashing commits that are already pushed). Doing so breaks synchronization.
2. **Configuration Preservation:** Do not manually edit `@lovable.dev/vite-tanstack-config` defaults in `vite.config.ts`. Avoid breaking the existing `components.json` structure.
3. **Agent Cleanliness:** Always delete any temporary files (like scripts, testing utilities, or scratch files) created during a task once they are no longer needed. Keep the workspace clean.

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

## Authentication & Route Protection (Separation of Concerns)
1. **Auth Context Isolation:** All client-side Firebase authentication logic must be encapsulated in `src/hooks/useAuth.tsx` (the `AuthProvider`). Do not import `firebase/auth` or handle auth state directly inside UI components (like `login.tsx` or `FamilyFlow.tsx`), except for triggering the `signIn`/`signOut` methods.
2. **TanStack Route Protection:**
   - All protected routes (e.g., `/builder`, `/dashboard`) must be guarded using TanStack Router's `beforeLoad` interceptor.
   - The `beforeLoad` function should check the `user` state and throw a `redirect({ to: '/login', search: { redirect: location.href } })` if unauthenticated.
   - Do NOT use inline component checks (e.g., `if (!user) return <Login />`) within the component tree for route protection.
3. **Backend Sync:** Firebase is the source of truth for identity, but our PostgreSQL (Drizzle) database handles application data. Always sync the user profile to PostgreSQL via the `/api/auth/sync` route immediately after a successful Firebase authentication event.

## Backend & API Standards
1. **Architecture:** Use the Controller-Service pattern for all backend features. Keep this logic tightly encapsulated inside `src/backend/`.
2. **Framework Agnosticism:** Never write raw business logic or database queries directly inside `src/routes/api/` files. The TanStack router files should only pass the Request object to a Controller.
3. **Database:** Use Drizzle ORM exclusively for database interactions (do not use Prisma or raw SQL).
4. **Environment Variables & Secrets:**
   - Server-only secrets MUST NOT be prefixed with `VITE_`.
   - Any secret intended for the frontend MUST be prefixed with `VITE_`.
   - Never push `.env` to Git. Always use `.env.example` to document required variables for other developers.
   - When deploying (e.g., to Netlify), ensure secrets are added directly to the platform's environment variables.

## Error Handling
- Use the existing `reportLovableError` utility for capturing boundary errors.
- Ensure graceful fallbacks for media (images/video/audio) that fail to load in the graph.
- Provide clear visual feedback in the UI when graph actions cannot be completed (e.g., "Add parent first").
