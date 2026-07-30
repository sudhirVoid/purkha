import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import { AuthService } from "../services/auth.service";
import bcrypt from "bcryptjs";

export class AuthController {
  static async registerHandler({ data, request }: { data: any; request: Request }) {
    try {
      const { username, email, password } = data;
      if (!username || !email || !password) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const userId = await AuthService.registerUser(username, email, passwordHash);
      const token = await AuthService.createVerificationToken(userId, "email_verification");
      
      const origin = new URL(request.url).origin;
      await AuthService.sendVerificationEmail(email, token, origin);

      return new Response(JSON.stringify({ success: true, message: "User registered. Please check your email to verify." }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }

  static async loginHandler({ data }: { data: any }) {
    try {
      const { email, password } = data;
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
      }

      const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userRecords.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
      }

      const user = userRecords[0];
      if (!user.emailVerified) {
        return new Response(JSON.stringify({ error: "Email is not verified. Please check your inbox." }), { status: 403 });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
      }

      const token = await AuthService.createSessionToken(user.id, user.email);

      // We'll set the token in a cookie via the route handler or directly here
      return new Response(JSON.stringify({ success: true, token }), {
        status: 200,
        headers: {
          "Set-Cookie": `auth_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`,
          "Content-Type": "application/json"
        }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }

  static async verifyEmailHandler(token: string) {
    try {
      await AuthService.verifyEmailToken(token);
      return new Response("Email verified successfully. You can now login.", { status: 200 });
    } catch (error: any) {
      return new Response(`Error: ${error.message}`, { status: 400 });
    }
  }

  static async forgotPasswordHandler({ data, request }: { data: any; request: Request }) {
    try {
      const { email } = data;
      if (!email) {
        return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
      }

      const userRecords = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userRecords.length > 0) {
        const user = userRecords[0];
        const token = await AuthService.createVerificationToken(user.id, "password_reset");
        const origin = new URL(request.url).origin;
        await AuthService.sendPasswordResetEmail(user.email, token, origin);
      }

      // Always return success to prevent email enumeration
      return new Response(JSON.stringify({ success: true, message: "If an account exists, a reset link has been sent." }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }

  static async resetPasswordHandler({ data }: { data: any }) {
    try {
      const { token, password } = data;
      if (!token || !password) {
        return new Response(JSON.stringify({ error: "Token and new password are required" }), { status: 400 });
      }

      const newPasswordHash = await bcrypt.hash(password, 10);
      await AuthService.resetPassword(token, newPasswordHash);

      return new Response(JSON.stringify({ success: true, message: "Password has been reset successfully." }), { status: 200 });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }
}
