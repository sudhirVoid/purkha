import { createFileRoute } from '@tanstack/react-router';
import { TreeController } from '../../backend/controllers/tree.controller';

export const Route = createFileRoute('/api/tree')({
  server: {
    handlers: {
      GET: TreeController.getTreeHandler,
      POST: TreeController.saveTreeHandler,
    },
  },
});
