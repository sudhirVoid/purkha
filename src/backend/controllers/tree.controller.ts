import { db } from "../db";
import { familyTrees } from "../db/schema";
import { eq, desc } from "drizzle-orm";
import { adminAuth } from "../lib/firebase-admin";

export class TreeController {
  static async getTrees(request: Request) {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await adminAuth.verifyIdToken(token);
      const userId = decodedToken.uid;

      const url = new URL(request.url);
      const treeId = url.searchParams.get("id");

      if (treeId) {
        const [tree] = await db
          .select()
          .from(familyTrees)
          .where(eq(familyTrees.id, treeId))
          .limit(1);
          
        if (tree && tree.userId !== userId) {
           return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
        }
        
        return new Response(JSON.stringify(tree || null), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const trees = await db
        .select()
        .from(familyTrees)
        .where(eq(familyTrees.userId, userId))
        .orderBy(desc(familyTrees.updatedAt));

      return new Response(JSON.stringify(trees), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Error fetching trees:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }

  static async saveTree(request: Request) {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      const token = authHeader.split("Bearer ")[1];
      const decodedToken = await adminAuth.verifyIdToken(token);
      const userId = decodedToken.uid;
      const email = decodedToken.email;

      // Ensure user exists in our DB before inserting a tree to avoid foreign key constraints
      if (email) {
        const { AuthService } = await import("../services/auth.service");
        await AuthService.syncUser(userId, email);
      }

      const body = await request.json();
      const { id, name, data } = body;

      if (!name || !data) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
      }

      const treeId = id || crypto.randomUUID();

      await db
        .insert(familyTrees)
        .values({
          id: treeId,
          userId,
          name,
          data,
        })
        .onConflictDoUpdate({
          target: familyTrees.id,
          set: {
            name,
            data,
            updatedAt: new Date(),
          },
        });

      return new Response(JSON.stringify({ success: true, id: treeId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: any) {
      console.error("Error saving tree:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
}
