import { createFileRoute } from '@tanstack/react-router';
import { AuthController } from '../../../backend/controllers/auth.controller';

export const Route = createFileRoute('/api/auth/verify')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token");
          
          if (!token) {
            return new Response("Missing token", { status: 400 });
          }

          const response = await AuthController.verifyEmailHandler(token);
          
          // If successful, redirect to login with a success message
          if (response.status === 200) {
            return new Response(null, {
              status: 302,
              headers: {
                Location: "/login?verified=true",
              },
            });
          }

          return response;
        } catch (error) {
          return new Response(JSON.stringify({ error: "Verification failed" }), { status: 400 });
        }
      },
    },
  },
});
