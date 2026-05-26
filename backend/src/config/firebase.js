import admin from "firebase-admin";

/**
 * Initialize Firebase Admin SDK using environment variables.
 * The private key from the service account JSON uses literal \n — we
 * replace them so the PEM is correctly formatted at runtime.
 */
const initFirebase = () => {
  if (admin.apps.length > 0) return; // already initialized

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  // Skip Firebase init if keys are not configured yet
  if (
    !projectId ||
    projectId === "your-firebase-project-id" ||
    !clientEmail ||
    clientEmail.includes("xxxxx") ||
    !privateKey ||
    privateKey.includes("YOUR_PRIVATE_KEY_HERE")
  ) {
    console.warn("⚠️  Firebase not configured — Google Sign-In will be unavailable until you add Firebase keys to .env");
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
    console.log("✅ Firebase Admin initialized");
  } catch (error) {
    console.warn("⚠️  Firebase init failed:", error.message);
  }
};

export { admin, initFirebase };
