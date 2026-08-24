import { createFileRoute } from '@tanstack/react-router';
import { TreeController } from '../../../backend/controllers/tree.controller';

export const Route = createFileRoute('/api/trees/')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return TreeController.getTrees(request);
      },
      POST: async ({ request }: { request: Request }) => {
        return TreeController.saveTree(request);
      },
    },
  },
});
