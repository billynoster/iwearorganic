import type { User } from 'firebase/auth';

/**
 * Email-link (passwordless) Auth uses the `password` provider id.
 * Those accounts often carry leftover Firebase console displayNames —
 * never treat Auth displayName as the customer's chosen name for them.
 */
export function isEmailLinkAuthUser(user: User | null | undefined): boolean {
  if (!user || user.isAnonymous) return false;
  const providers = user.providerData ?? [];
  if (providers.length === 0) {
    // Fresh email-link sessions can briefly report no providerData.
    return Boolean(user.email);
  }
  return providers.every((p) => p.providerId === 'password');
}

export function emailLocalPart(email: string | null | undefined): string {
  if (!email) return '';
  const local = email.split('@')[0]?.trim() || '';
  return local;
}

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { firstName: '', lastName: '' };
  const [first = '', ...rest] = trimmed.split(' ');
  return {
    firstName: first.slice(0, 50),
    lastName: rest.join(' ').slice(0, 50),
  };
}

export function joinFullName(
  firstName?: string | null,
  lastName?: string | null
): string {
  return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(' ');
}

export type ProfileNameFields = {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
};

/**
 * Prefer Firestore profile name → (OAuth only) Auth displayName → email local-part → “Account”.
 * Email-link users skip Auth displayName so leftover console names never surface.
 */
export function resolveAccountDisplayName(
  user: User | null | undefined,
  profile?: ProfileNameFields | null
): string {
  const fromProfile = joinFullName(profile?.firstName, profile?.lastName);
  if (fromProfile) return fromProfile;

  if (profile?.displayName?.trim()) {
    return profile.displayName.trim();
  }

  if (user && !isEmailLinkAuthUser(user)) {
    const authName = user.displayName?.trim();
    if (authName) return authName;
  }

  const local = emailLocalPart(user?.email);
  if (local) return local;

  return 'Account';
}

export function initialsFromLabel(label: string, email?: string | null): string {
  const name = label.trim();
  if (name && name !== 'Account') {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return 'BA';
}
