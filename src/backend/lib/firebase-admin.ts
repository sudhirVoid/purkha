export const adminAuth = {
  async verifyIdToken(idToken: string) {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY;
    if (!apiKey) {
      throw new Error("VITE_FIREBASE_API_KEY is not configured");
    }

    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    const data = await response.json();
    
    if (data.error || !data.users || data.users.length === 0) {
      throw new Error(data.error?.message || "Invalid or expired authentication token");
    }

    const user = data.users[0];
    return {
      uid: user.localId,
      email: user.email,
      email_verified: user.emailVerified,
      name: user.displayName,
      ...user
    };
  }
};
