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

  switch (errorCode) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password. Please verify your credentials.";
    case "auth/email-already-in-use":
      return "An account with this email address already exists. Please sign in.";
    case "auth/weak-password":
      return "Password must be at least 6 characters long.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many unsuccessful attempts. Please wait a few moments and try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    case "auth/missing-password":
      return "Please enter your password.";
    default: {
      const rawMessage = firebaseError?.message || "Authentication failed. Please try again.";
      return rawMessage.replace(/^Firebase:\s*/, "");
    }
  }
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
