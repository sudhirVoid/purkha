import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<User>;
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<User>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfile: (newDisplayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncWithBackend: (targetUser?: User) => Promise<boolean>;
}

export function getFriendlyAuthErrorMessage(error: unknown): string {
  const firebaseError = error as { code?: string; message?: string };
  const errorCode = firebaseError?.code || "";
  const errorMessage = firebaseError?.message || "";
  const combinedError = `${errorCode} ${errorMessage}`.toLowerCase();

  if (combinedError.includes("email-already-in-use") || combinedError.includes("email_exists")) {
    return "An account with this email already exists. Please switch to Sign In, or use 'Forgot password' if you need to reset it.";
  }
  if (
    combinedError.includes("invalid-credential") ||
    combinedError.includes("wrong-password") ||
    combinedError.includes("user-not-found") ||
    combinedError.includes("invalid_login_credentials") ||
    combinedError.includes("email_not_found")
  ) {
    return "Incorrect email or password. If this account was previously created with a magic link, please use 'Forgot password' to set a password.";
  }
  if (combinedError.includes("weak-password")) {
    return "Password must be at least 6 characters long.";
  }
  if (combinedError.includes("invalid-email") || combinedError.includes("invalid_email")) {
    return "Please enter a valid email address.";
  }
  if (combinedError.includes("user-disabled")) {
    return "This account has been disabled. Please contact support.";
  }
  if (combinedError.includes("too-many-requests")) {
    return "Too many unsuccessful attempts. Please wait a moment and try again.";
  }
  if (combinedError.includes("network-request-failed")) {
    return "Network connection issue. Please check your internet connection.";
  }
  if (combinedError.includes("missing-password")) {
    return "Please enter your password.";
  }
  if (combinedError.includes("operation-not-allowed")) {
    return "Email/password authentication is not enabled for this project. Please check Firebase configuration.";
  }

  const cleanedMessage = errorMessage
    .replace(/^Firebase:\s*/, "")
    .replace(/\s*\(auth\/[^)]+\)\.?$/, "");
  return cleanedMessage || "Authentication failed. Please try again.";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncWithBackend = async (targetUser?: User): Promise<boolean> => {
    const userToSync = targetUser || user;
    if (!userToSync) {
      return false;
    }

    try {
      const idToken = await userToSync.getIdToken();
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        const errorDetails = await response.text();
        console.warn("Backend user sync warning:", errorDetails);
        return false;
      }
      return true;
    } catch (syncError) {
      console.error("Backend user sync error:", syncError);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(userCredential.user);
      await syncWithBackend(userCredential.user);
      return userCredential.user;
    } catch (authError) {
      const friendlyMessage = getFriendlyAuthErrorMessage(authError);
      throw new Error(friendlyMessage);
    }
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName?: string
  ): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName && displayName.trim()) {
        await updateProfile(userCredential.user, {
          displayName: displayName.trim(),
        });
      }
      setUser(userCredential.user);
      await syncWithBackend(userCredential.user);
      return userCredential.user;
    } catch (authError) {
      const friendlyMessage = getFriendlyAuthErrorMessage(authError);
      throw new Error(friendlyMessage);
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (authError) {
      const friendlyMessage = getFriendlyAuthErrorMessage(authError);
      throw new Error(friendlyMessage);
    }
  };

  const updateUserProfile = async (newDisplayName: string): Promise<void> => {
    if (!user) {
      throw new Error("No authenticated user found.");
    }

    try {
      await updateProfile(user, { displayName: newDisplayName });
      setUser({ ...user, displayName: newDisplayName } as User);

      const idToken = await user.getIdToken();
      const response = await fetch("/api/auth/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username: newDisplayName }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync profile changes to backend database.");
      }
    } catch (profileError) {
      console.error("Error updating user profile:", profileError);
      throw profileError;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (authError) {
      console.error("Error signing out:", authError);
      throw authError;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    updateUserProfile,
    signOut,
    syncWithBackend,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    });
  });
};
