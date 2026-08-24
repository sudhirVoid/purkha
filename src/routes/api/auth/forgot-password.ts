import { createFileRoute } from '@tanstack/react-router';
import { AuthController } from '../../../backend/controllers/auth.controller';

export const Route = createFileRoute('/api/auth/forgot-password')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const data = await request.json();
          return AuthController.forgotPasswordHandler({ data, request });
        } catch (error) {
          return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
        }
      },
    },
  },
});
