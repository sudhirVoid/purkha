import { createFileRoute } from '@tanstack/react-router';
import { AuthController } from '../../../backend/controllers/auth.controller';

export const Route = createFileRoute('/api/auth/reset-password')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();
          return AuthController.resetPasswordHandler({ data });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
      },
    },
  },
});
