import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, ActionCodeSettings } from "firebase/auth";

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "purkha-auth-1a2b3c",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:323824954337:web:15d74159bedfe1d05940a0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "purkha-auth-1a2b3c.firebasestorage.app",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAWPSvNhaqKCauMPB64aQzhLZUpO1mGLZ4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "purkha-auth-1a2b3c.firebaseapp.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "323824954337"
};

// Initialize Firebase only if it hasn't been initialized already
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Action code settings for email link authentication
export const actionCodeSettings: ActionCodeSettings = {
  // URL you want to redirect back to. The domain must be in the authorized domains list in the Firebase Console.
  url: typeof window !== "undefined" ? window.location.origin + "/login" : "http://localhost:8080/login",
  handleCodeInApp: true,
};
