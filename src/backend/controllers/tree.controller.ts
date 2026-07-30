import { TreeService } from '../services/tree.service';

export class TreeController {
  /**
   * Handles GET requests to fetch a family tree.
   */
  static async getTreeHandler({ request }: { request: Request }) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || 'default-tree';

    try {
      const tree = await TreeService.getTree(id);
      
      if (!tree) {
        return new Response(JSON.stringify({ error: "Tree not found", data: null }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ data: tree.data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  /**
   * Handles POST requests to save or update a family tree.
   */
  static async saveTreeHandler({ request }: { request: Request }) {
    try {
      const body = await request.json();
      const { id, name, data } = body;

      if (!id || !data) {
        return new Response(JSON.stringify({ error: "Missing required fields: id, data" }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const result = await TreeService.saveTree(id, name, data);

      return new Response(JSON.stringify({ success: true, message: "Tree saved successfully", result }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
}
