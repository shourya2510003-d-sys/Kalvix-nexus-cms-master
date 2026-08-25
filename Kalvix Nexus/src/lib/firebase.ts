import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, get, remove } from "firebase/database";
import { getFirestore } from "firebase/firestore";

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  throw new Error("Critical environment variable NEXT_PUBLIC_FIREBASE_API_KEY is missing.");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
  throw new Error("Critical environment variable NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing.");
}
if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  throw new Error("Critical environment variable NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing.");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: "https://kalvix-nexus-default-rtdb.firebaseio.com",
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const firestore = getFirestore(app);

export { app, db, firestore };

export async function cleanupLoginLogs() {
  try {
    const snap = await get(ref(db, 'logs/logins'));
    if (snap.exists()) {
      const logs = snap.val();
      const keys = Object.keys(logs);
      if (keys.length > 20) {
        keys.sort((a, b) => new Date(logs[b].timestamp).getTime() - new Date(logs[a].timestamp).getTime());
        const keysToDelete = keys.slice(20);
        for (const key of keysToDelete) {
          await remove(ref(db, `logs/logins/${key}`));
        }
      }
    }
  } catch (err) {
    console.error('Error cleaning up logs', err);
  }
}
