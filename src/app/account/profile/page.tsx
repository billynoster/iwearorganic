'use client';

import { useEffect, useState } from 'react';
import {
  verifyBeforeUpdateEmail,
  updateProfile,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { AccountShell } from '@/components/account/account-shell';
import { RequireSignedIn } from '@/components/account/require-signed-in';
import {
  joinFullName,
  splitFullName,
} from '@/lib/account-profile';
import { allowAuthInboxPreview } from '@/lib/safe-shopping-return';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AccountProfilePage() {
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (allowAuthInboxPreview() && params.get('preview') === 'form') {
      setPreview(true);
    }
  }, []);

  if (preview) {
    return <ProfileContent preview />;
  }

  return (
    <RequireSignedIn>
      <ProfileContent />
    </RequireSignedIn>
  );
}

function ProfileContent({ preview = false }: { preview?: boolean }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(!preview);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  useEffect(() => {
    if (preview) {
      setEmail('you@example.com');
      setLoading(false);
      return;
    }
    if (!user || !firestore) return;

    const load = async () => {
      setLoading(true);
      try {
        const userRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const chosen = data.hasChosenName === true;
        const fromProfile = chosen
          ? joinFullName(
              typeof data.firstName === 'string' ? data.firstName : '',
              typeof data.lastName === 'string' ? data.lastName : ''
            )
          : '';
        // Prefer customer-chosen profile name; avoid leftover Auth displayName defaults.
        setFullName(fromProfile || (chosen ? user.displayName?.trim() || '' : ''));
        setEmail(user.email || (typeof data.email === 'string' ? data.email : ''));
        setPhone(typeof data.phone === 'string' ? data.phone : '');
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: 'Could not load profile',
          description: 'Refresh and try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [user, firestore, toast, preview]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (preview) {
      setEmailNotice('Preview only — sign in to save your profile.');
      return;
    }
    if (!user || !firestore) return;

    setFormError(null);
    setEmailNotice(null);
    setSaving(true);

    try {
      const { firstName, lastName } = splitFullName(fullName);
      const trimmedPhone = phone.trim().slice(0, 30);
      const trimmedEmail = email.trim();
      const currentEmail = (user.email || '').trim();

      if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        setFormError('Enter a valid email address.');
        setSaving(false);
        return;
      }

      const userRef = doc(firestore, 'users', user.uid);
      const patch: Record<string, unknown> = {
        // Marks that the customer chose a name (vs leftover Auth/console seeds).
        hasChosenName: true,
      };

      if (firstName) patch.firstName = firstName;
      else patch.firstName = deleteField();

      if (lastName) patch.lastName = lastName;
      else patch.lastName = deleteField();

      if (trimmedPhone) patch.phone = trimmedPhone;
      else patch.phone = deleteField();

      const displayName = joinFullName(firstName, lastName);
      if (displayName) patch.displayName = displayName;
      else patch.displayName = deleteField();

      await setDoc(userRef, patch, { merge: true });

      try {
        await updateProfile(user, { displayName: displayName || '' });
      } catch (err) {
        console.warn('[auth] displayName update failed', err);
      }

      if (trimmedEmail && trimmedEmail.toLowerCase() !== currentEmail.toLowerCase()) {
        await requestEmailChange(user, trimmedEmail);
        setEmailNotice(
          `We sent a confirmation link to ${trimmedEmail}. Your sign-in email updates after you open that link. Keep using ${currentEmail} until then.`
        );
        toast({
          title: 'Confirm your new email',
          description: `Check ${trimmedEmail} for a verification link.`,
        });
      } else {
        toast({
          title: 'Profile saved',
          description: 'Your details are up to date.',
        });
      }
    } catch (err) {
      console.error(err);
      const message = emailChangeErrorMessage(err);
      setFormError(message);
      toast({
        variant: 'destructive',
        title: 'Could not save profile',
        description: message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountShell
      title="Profile."
      description="Your name, email, and phone — used for orders and account details."
      email={user?.email || (preview ? 'you@example.com' : null)}
    >
      {preview ? (
        <p
          role="status"
          className="mb-6 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-4 py-3 font-body text-sm text-mineral-ink/70"
        >
          Local preview only — not signed in. Production requires Sign in.
        </p>
      ) : null}
      {loading ? (
        <p className="font-body text-sm text-mineral-ink/60">Loading profile…</p>
      ) : (
        <form
          onSubmit={handleSave}
          className="max-w-xl space-y-5"
          noValidate
        >
          {(formError || emailNotice) && (
            <p
              role={formError ? 'alert' : 'status'}
              className={cn(
                'border px-4 py-3 font-body text-sm text-mineral-ink',
                formError
                  ? 'border-dusk-rose/35 bg-[color-mix(in_srgb,var(--ca-dusk-rose)_10%,var(--ca-linen))]'
                  : 'border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))]'
              )}
            >
              {formError || emailNotice}
            </p>
          )}

          <Field
            label="Full name"
            id="full-name"
            value={fullName}
            onChange={setFullName}
            autoComplete="name"
            placeholder="Your name"
          />

          <div>
            <Field
              label="Email"
              id="profile-email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              inputMode="email"
              required
            />
            <p className="mt-2 font-body text-xs leading-relaxed text-mineral-ink/55">
              Changing email sends a confirmation link to the new address. Your
              sign-in email only updates after you confirm — we never change it
              silently.
            </p>
          </div>

          <Field
            label="Phone"
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={setPhone}
            autoComplete="tel"
            inputMode="tel"
            placeholder="Optional"
          />
          <p className="-mt-2 font-body text-xs leading-relaxed text-mineral-ink/55">
            Saved on your profile for checkout contact — not used for SMS
            sign-in.
          </p>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className={cn('ca-btn-primary', saving && 'opacity-60')}
            >
              {saving ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      )}
    </AccountShell>
  );
}

async function requestEmailChange(user: User, newEmail: string) {
  const continueUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/account/profile`
      : undefined;
  await verifyBeforeUpdateEmail(
    user,
    newEmail,
    continueUrl
      ? { url: continueUrl, handleCodeInApp: false }
      : undefined
  );
}

function emailChangeErrorMessage(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/requires-recent-login':
        return 'For security, sign out and sign back in, then try changing your email again.';
      case 'auth/email-already-in-use':
        return 'That email is already in use on another account.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email changes aren’t enabled for this store yet. Your name and phone were still saved.';
      default:
        break;
    }
  }
  return 'Something went wrong while saving. Please try again.';
}

function Field({
  label,
  id,
  value,
  onChange,
  required,
  type = 'text',
  autoComplete,
  inputMode,
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="ca-field-label">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-oat bg-linen px-3 py-2.5 font-body text-sm text-mineral-ink placeholder:text-mineral-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
      />
    </div>
  );
}
