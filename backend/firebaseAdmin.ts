/**
@license
* SPDX-License-Identifier: Apache-2.0
* AudioFACTORY Firebase Admin SDK Initializer
*/
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let adminApp: any;

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || 'gen-lang-client-0637573997';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } else {
    // Default initialization for development/staging environments
    adminApp = initializeApp({
      projectId,
    });
  }
} else {
  adminApp = getApp();
}

export const adminAuth = getAuth(adminApp);

// Initialize Firestore with the named database ID from config
const firestoreDbId = firebaseConfig.firestoreDatabaseId || 'ai-studio-socialnot-845fd311-8b26-4908-9a36-b5f4f288bed7';
export const adminDb = getFirestore(adminApp, firestoreDbId);
adminDb.settings({ ignoreUndefinedProperties: true });
