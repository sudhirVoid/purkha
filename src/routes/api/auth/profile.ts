import { createFileRoute } from '@tanstack/react-router';
import { AuthController } from '../../../backend/controllers/auth.controller';

export const Route = createFileRoute('/api/auth/profile')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        return AuthController.updateProfileHandler(request);
      },
    },
  },
});
