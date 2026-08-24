import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: 'purkha-auth-1a2b3c'
  });
}

export const adminAuth = getAuth();
