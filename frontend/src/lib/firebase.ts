import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

/**
 * Firebase configuration for the frontend.
 * These values should be added to your .env file.
 */
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCdi4dcAv1ZxfAW70gg9AIVw8tWertZNVA",

  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "campus-connect-4ed30.firebaseapp.com",

  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    "campus-connect-4ed30",

  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "campus-connect-4ed30.appspot.com",

  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    "306773008601",

  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:306773008601:web:5eef678a1fe8c46125dec8",

  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    "G-SKQ7MG1J7J",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google
 * Uses popup for all devices (more reliable for development)
 */
export async function signInWithGoogle(): Promise<string | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return idToken;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error(error.message || "Google sign-in failed");
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Sign out error:", error);
  }
}

/**
 * Get current user
 */
export function getCurrentUser() {
  return auth.currentUser;
}