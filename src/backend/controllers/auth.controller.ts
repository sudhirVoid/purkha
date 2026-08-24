import { AuthService } from "../services/auth.service";

export class AuthController {
  static async syncHandler(request: Request) {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), { status: 401 });
      }

      const idToken = authHeader.split("Bearer ")[1];
      
      // Verify token with Firebase Admin
      const decodedToken = await AuthService.verifyFirebaseToken(idToken);
      
      if (!decodedToken.email) {
        return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
      }

      // Sync user to our Postgres DB
      const user = await AuthService.syncUser(decodedToken.uid, decodedToken.email);

      // Return success and we can also set a session cookie here if SSR needs it
      return new Response(JSON.stringify({ success: true, user: { id: user.id, username: user.username } }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          // Optional: Set your own session cookie for TanStack SSR here if needed
          // "Set-Cookie": `session_id=${idToken}; Path=/; HttpOnly; SameSite=Lax`
        }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }

  static async updateProfileHandler(request: Request) {
    try {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Missing or invalid authorization header" }), { status: 401 });
      }

      const idToken = authHeader.split("Bearer ")[1];
      const decodedToken = await AuthService.verifyFirebaseToken(idToken);
      
      const body = await request.json();
      if (!body.username) {
        return new Response(JSON.stringify({ error: "Username is required" }), { status: 400 });
      }

      const updatedUser = await AuthService.updateUsername(decodedToken.uid, body.username);

      return new Response(JSON.stringify({ success: true, user: updatedUser }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }
}
