import { eq } from 'drizzle-orm';
import { db } from '../db';
import { familyTrees } from '../db/schema';

export class TreeService {
  /**
   * Retrieves a family tree by its ID.
   */
  static async getTree(id: string) {
    const result = await db.select().from(familyTrees).where(eq(familyTrees.id, id));
    
    if (result.length === 0) {
      return null;
    }
    
    return result[0];
  }

  /**
   * Upserts a family tree (creates if it doesn't exist, updates if it does).
   */
  static async saveTree(id: string, name: string, data: any) {
    const result = await db.insert(familyTrees).values({
      id,
      name: name || "My Family Tree",
      data,
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: familyTrees.id,
      set: {
        data,
        name: name || "My Family Tree",
        updatedAt: new Date(),
      }
    }).returning();

    return result[0];
  }
}
