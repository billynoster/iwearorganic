'use client';

import firebaseConfig from '../../firebase-applet-config.json';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, setLogLevel } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // Important! initializeApp() is called without any arguments because Firebase App Hosting
    // integrates with the initializeApp() function to provide the environment variables needed to
    // populate the FirebaseOptions in production. It is critical that we attempt to call initializeApp()
    // without arguments.
    let firebaseApp;
    try {
      // Attempt to initialize via Firebase App Hosting environment variables
      firebaseApp = initializeApp();
      console.log("Firebase initialized via App Hosting environment");
    } catch (e) {
      // It's normal for automatic initialization to fail outside of Firebase App Hosting.
      // We silently fall back to the config object to prevent confusing console errors.
      console.log("Firebase initializing with config:", JSON.stringify(firebaseConfig));
      firebaseApp = initializeApp(firebaseConfig);
    }

    return getSdks(firebaseApp);
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  setLogLevel('error');
  const dbId = firebaseConfig.firestoreDatabaseId;
  // Explicitly handle '(default)' as the database ID
  const firestore = (dbId && dbId !== '(default)') 
    ? getFirestore(firebaseApp, dbId) 
    : getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);

  // Connection test
  import('firebase/firestore').then(({ getDocFromServer, doc }) => {
    getDocFromServer(doc(firestore, '_connection_test_', 'test')).catch((err) => {
      if (err.message?.includes('permission')) {
        console.warn("Firestore connection test: Permission denied (expected if rules are strict)");
      } else {
        console.error("Firestore connection test failed:", err.message);
      }
    });
  });

  return {
    firebaseApp,
    auth,
    firestore
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
