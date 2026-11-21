'use client';
import {
  Auth, // Import Auth type for type hinting
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/**
 * Anonymous sign-in is intentionally disabled for storefront smoke / guest checkout.
 * Guest Pay Securely uses server Admin (`FIREBASE_SERVICE_ACCOUNT_KEY`) only.
 * Calling this must never throw `auth/admin-restricted-operation`.
 */
export function initiateAnonymousSignIn(_authInstance: Auth): void {
  console.warn(
    '[auth] initiateAnonymousSignIn is a no-op. Guest checkout does not use client Auth; set FIREBASE_SERVICE_ACCOUNT_KEY for Admin order create.'
  );
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call createUserWithEmailAndPassword directly. Do NOT use 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
