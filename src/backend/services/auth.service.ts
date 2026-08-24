import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { adminAuth } from "../lib/firebase-admin";

export class AuthService {
  /**
   * Verify the Firebase ID Token provided by the client
   */
  static async verifyFirebaseToken(idToken: string) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error("Error verifying Firebase ID token:", error);
      throw new Error("Invalid or expired authentication token");
    }
  }

  /**
   * Sync a Firebase user with our local PostgreSQL database.
   * If the user doesn't exist, we create them.
   */
  static async syncUser(firebaseUid: string, email: string) {
    // Check if user exists in the database
    const existingUser = await db.select().from(users).where(eq(users.id, firebaseUid)).limit(1);
    
    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // New user, insert into our database
    // We'll generate a default username from the email prefix
    const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `${baseUsername}${randomSuffix}`;

    const [newUser] = await db.insert(users).values({
      id: firebaseUid,
      username,
      email,
      emailVerified: true, // Firebase Magic Link guarantees this
    }).returning();

    return newUser;
  }

  /**
   * Update the user's username in PostgreSQL
   */
  static async updateUsername(firebaseUid: string, username: string) {
    const [updatedUser] = await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, firebaseUid))
      .returning();
      
    return updatedUser;
  }
}
