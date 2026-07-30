# Architecture & Technical Details

## Technical Stack
- **Framework:** TanStack Start (SSR/routing framework)
- **Backend Architecture:** Controller-Service Pattern (Framework Agnostic)
- **Database:** NeonDB (Serverless PostgreSQL)
- **ORM:** Drizzle ORM
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4, Radix UI (shadcn/ui style components)
- **Graph/Node Engine:** `@xyflow/react` (React Flow)
- **Icons:** `lucide-react`
- **State Management:** React Context (for local graph actions), TanStack Query

## Application Flow
1. **Entry Point:** The application initializes through TanStack Start router (`src/routes/__root.tsx`).
2. **Main Route:** The root path (`/`) defined in `src/routes/index.tsx` loads the primary interface.
3. **Core Component:** `<FamilyFlow />` handles the entire visual tree experience. It encapsulates:
   - Node and edge state management.
   - Custom node rendering (`PersonToolbar`, `BondToolbar`).
   - Context providers (`ActionsContext`) to allow nodes to dispatch structural updates (e.g., adding a child).

## File & Folder Structure
```
Purkha/
├── agent/                 # AI Assistant memory and guidelines (you are here)
├── src/
│   ├── backend/           # Core Backend Logic (Framework Agnostic)
│   │   ├── controllers/   # HTTP Request/Response handling
│   │   ├── services/      # Business logic and Drizzle ORM interactions
│   │   └── db/            # Database schema and connection setup
│   ├── components/        # React components
│   │   ├── FamilyFlow.tsx # Core graph component handling tree logic
│   │   └── ui/            # Reusable shadcn UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions and configurations
│   │   └── lovable-error-reporting.ts # Error logging
│   ├── routes/            # TanStack file-based routing
│   │   ├── api/           # API Endpoints (binds to controllers)
│   │   ├── __root.tsx     # Global layout and providers
│   │   └── index.tsx      # Main page rendering FamilyFlow
│   ├── server.ts          # SSR server entry
│   ├── start.ts           # Client entry
│   └── styles.css         # Global Tailwind CSS and variables
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite and TanStack configuration
├── drizzle.config.ts      # Drizzle ORM migration configuration
└── components.json        # shadcn UI configuration
```
