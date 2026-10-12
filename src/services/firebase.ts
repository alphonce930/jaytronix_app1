import { getAnalytics, isSupported } from "firebase/analytics";
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  config.apiKey &&
    config.authDomain &&
    config.projectId &&
    config.appId,
);
const app = isFirebaseConfigured ? getApps()[0] ?? initializeApp(config) : null;

export const auth = app ? getAuth(app) : null;
export const analytics =
  app && config.measurementId && typeof window !== "undefined"
    ? isSupported()
        .then((supported) => supported ? getAnalytics(app) : null)
        .catch((error: unknown) => {
          console.warn("Firebase Analytics could not be initialized.", error);
          return null;
        })
    : Promise.resolve(null);
