import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  // If API key is dummy, simulate a mock sign-in for dev logic testing
  if (firebaseConfig.apiKey === "mock-api-key") {
    console.warn("Using mock Google Sign-In because Firebase is not configured via ENV vars.");
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            displayName: "Jane Doe (Google)",
            email: "jane.doe@example.com",
            uid: "mock-google-uid-123",
          }
        });
      }, 1000);
    });
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    throw error;
  }
};

export { auth };
