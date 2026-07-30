import { createFileRoute } from '@tanstack/react-router';
import { AuthController } from '../../../backend/controllers/auth.controller';

export const Route = createFileRoute('/api/auth/login')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();
          return AuthController.loginHandler({ data });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
      },
    },
  },
});
