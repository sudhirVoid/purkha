import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ message: 'hello i am running' }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
