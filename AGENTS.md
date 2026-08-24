<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Authentication & Route Protection (Separation of Concerns)
> [!IMPORTANT]
> When making changes to Authentication or Routing in this project, you must adhere to the following architecture rules:
> 
> 1. **Auth Context Isolation**: All client-side Firebase authentication logic must be encapsulated in `src/hooks/useAuth.tsx` (the `AuthProvider`). Do not import `firebase/auth` or handle auth state directly inside UI components (like `login.tsx` or `FamilyFlow.tsx`), except for triggering the `signIn`/`signOut` methods.
> 
> 2. **TanStack Route Protection**: 
>    - All protected routes (e.g., `/builder`) must be guarded using TanStack Router's `beforeLoad` interceptor.
>    - The `beforeLoad` function should check the `user` state and throw a `redirect({ to: '/login', search: { redirect: location.href } })` if unauthenticated.
>    - Do NOT use inline component checks (e.g., `if (!user) return <Login />`) within the component tree for route protection.
> 
> 3. **Backend Sync**: Firebase is the source of truth for identity, but our PostgreSQL (Drizzle) database handles application data. Always sync the user profile to PostgreSQL via the `/api/auth/sync` route immediately after a successful Firebase authentication event.

## Agent Cleanliness
> [!IMPORTANT]
> Always delete any temporary files (like scripts, testing utilities, or scratch files) that you create during a task once they are no longer needed. Keep the workspace clean.
