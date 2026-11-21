'use client';

import type { User } from 'firebase/auth';
import { updateProfile } from 'firebase/auth';
import {
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { isEmailLinkAuthUser, joinFullName } from '@/lib/account-profile';

/**
 * Ensure a Firestore `/users/{uid}` doc exists after sign-in.
 * Guest browsing never calls this. Required fields match firestore.rules.
 *
 * Email-link users: do not seed first/last from Auth displayName (avoids
 * leftover Firebase console names like “Steve Adams”). Until the customer
 * saves a name on Profile (`hasChosenName`), clear Auth displayName and any
 * auto-seeded Firestore name fields so the nav shows the email local-part.
 */
export async function ensureUserProfile(
  firestore: Firestore,
  user: User
): Promise<void> {
  if (!user || user.isAnonymous) return;

  const userRef = doc(firestore, 'users', user.uid);
  const snap = await getDoc(userRef);

  const emailOnly = isEmailLinkAuthUser(user);
  const authDisplayName = user.displayName?.trim() || '';
  // Only OAuth (Google/Apple) displayNames are trusted as seed values.
  const seedDisplayName = emailOnly ? '' : authDisplayName;
  const [firstName = '', ...rest] = seedDisplayName.split(/\s+/);
  const lastName = rest.join(' ');

  if (!snap.exists()) {
    await setDoc(userRef, {
      id: user.uid,
      email: user.email || '',
      dateJoined: serverTimestamp(),
      ...(firstName ? { firstName: firstName.slice(0, 50) } : {}),
      ...(lastName ? { lastName: lastName.slice(0, 50) } : {}),
    });
  } else {
    const data = snap.data() || {};
    const patch: Record<string, unknown> = {};
    if (data.id !== user.uid) patch.id = user.uid;
    if (typeof data.email !== 'string') {
      patch.email = user.email || '';
    } else if (user.email && data.email !== user.email) {
      // After verifyBeforeUpdateEmail completes, Auth email wins — sync doc.
      patch.email = user.email;
    }
    if (!data.dateJoined) patch.dateJoined = serverTimestamp();

    if (!emailOnly) {
      if (!data.firstName && firstName) patch.firstName = firstName.slice(0, 50);
      if (!data.lastName && lastName) patch.lastName = lastName.slice(0, 50);
    } else if (data.hasChosenName !== true) {
      // Drop leftover seeded names for passwordless accounts.
      if (typeof data.firstName === 'string' && data.firstName.trim()) {
        patch.firstName = deleteField();
      }
      if (typeof data.lastName === 'string' && data.lastName.trim()) {
        patch.lastName = deleteField();
      }
      if (typeof data.displayName === 'string' && data.displayName.trim()) {
        const seeded = joinFullName(
          typeof data.firstName === 'string' ? data.firstName : '',
          typeof data.lastName === 'string' ? data.lastName : ''
        );
        if (
          !seeded ||
          data.displayName.trim().toLowerCase() === seeded.toLowerCase() ||
          (authDisplayName &&
            data.displayName.trim().toLowerCase() === authDisplayName.toLowerCase())
        ) {
          patch.displayName = deleteField();
        }
      }
    }

    if (Object.keys(patch).length > 0) {
      await setDoc(userRef, patch, { merge: true });
    }
  }

  if (emailOnly && authDisplayName) {
    const data = snap.exists() ? snap.data() || {} : {};
    if (data.hasChosenName !== true) {
      try {
        await updateProfile(user, { displayName: '' });
      } catch (err) {
        console.warn('[auth] could not clear leftover displayName', err);
      }
    }
  }
}
