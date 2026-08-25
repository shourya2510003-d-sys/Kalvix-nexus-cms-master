import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

let adminFirestore: any;
let adminAuth: any;
let adminDatabase: any;

try {
  if (!getApps().length) {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newline characters in the private key from Vercel env variables
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    }
  }

  if (getApps().length > 0) {
    adminFirestore = getFirestore();
    adminAuth = getAuth();
    adminDatabase = getDatabase();
  } else {
    // Provide dummy objects to prevent destructuring crashes during Vercel build
    adminFirestore = {} as any;
    adminAuth = {} as any;
    adminDatabase = {} as any;
  }
} catch (error) {
  console.log('Firebase admin initialization error', error);
  adminFirestore = {} as any;
  adminAuth = {} as any;
  adminDatabase = {} as any;
}

export { adminFirestore, adminAuth, adminDatabase };
