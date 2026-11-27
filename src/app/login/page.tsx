'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  OAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { ensureUserProfile } from '@/lib/ensure-user-profile';
import { resolvePostSignInRedirect } from '@/lib/safe-auth-redirect';
import {
  allowAuthInboxPreview,
  resolveContinueShoppingHref,
} from '@/lib/safe-shopping-return';
import { GuestBrowsingFooter } from '@/components/account/continue-shopping-link';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const EMAIL_FOR_SIGN_IN = 'emailForSignIn';
const RESEND_COOLDOWN_MS = 30_000;

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Phase 8B — centered optional Sign in.
 * Google / Apple / passwordless email link. Guest shopping always available.
 */
export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<
    'google' | 'apple' | 'email' | null
  >(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('/');
  const [continueHref, setContinueHref] = useState('/shopping');
  const [resendHint, setResendHint] = useState<string | null>(null);
  const lastEmailSendAt = useRef(0);

  const emailInvalid = emailTouched && email.trim().length > 0 && !isValidEmail(email);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setRedirectUrl(resolvePostSignInRedirect(params.get('redirect')));
    setContinueHref(
      resolveContinueShoppingHref({
        fromParam: params.get('from'),
        referrer: document.referrer || null,
      })
    );
    // Local / non-production UX preview only — never fake delivery on prod hosts.
    if (allowAuthInboxPreview() && params.get('preview') === 'inbox') {
      const previewEmail = params.get('email') || 'you@example.com';
      setSentEmail(previewEmail);
      setEmail(previewEmail);
      setIsEmailSent(true);
    }
  }, []);

  useEffect(() => {
    if (isUserLoading) return;

    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) return;

    let storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN);
    if (!storedEmail) {
      storedEmail =
        window.prompt('Confirm the email you used for the sign-in link') || null;
    }
    if (!storedEmail) {
      setLinkError(
        'We couldn’t confirm your email for this link. Request a new sign-in link below.'
      );
      return;
    }

    setIsLoading(true);
    setLoadingProvider('email');
    signInWithEmailLink(auth, storedEmail, href)
      .then(async (cred) => {
        window.localStorage.removeItem(EMAIL_FOR_SIGN_IN);
        await ensureUserProfile(firestore, cred.user);
        toast({
          title: 'Signed in',
          description: 'Welcome back to I Wear Organic.',
        });
        router.replace(redirectUrl);
      })
      .catch((error) => {
        console.error(error);
        setIsEmailSent(false);
        setLinkError(
          'That sign-in link is invalid or has expired. Request a new one below.'
        );
        toast({
          variant: 'destructive',
          title: 'Sign-in link expired',
          description: 'Request a new sign-in link to continue.',
        });
      })
      .finally(() => {
        setIsLoading(false);
        setLoadingProvider(null);
      });
  }, [auth, firestore, isUserLoading, redirectUrl, router, toast]);

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      void ensureUserProfile(firestore, user).then(() => {
        router.replace(redirectUrl);
      });
    }
  }, [user, isUserLoading, router, redirectUrl, firestore]);

  const finishProviderSignIn = async (
    credUser: Parameters<typeof ensureUserProfile>[1]
  ) => {
    await ensureUserProfile(firestore, credUser);
    toast({
      title: 'Signed in',
      description: 'Welcome back to I Wear Organic.',
    });
    router.replace(redirectUrl);
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setLinkError(null);
    setIsLoading(true);
    setLoadingProvider('google');
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await finishProviderSignIn(result.user);
    } catch (error) {
      console.error(error);
      if (
        error instanceof FirebaseError &&
        (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request')
      ) {
        return;
      }
      setFormError('Could not complete Google sign-in. Try again, or use email.');
      toast({
        variant: 'destructive',
        title: 'Google sign-in didn’t finish',
        description: 'Try again, or use an email sign-in link.',
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    setFormError(null);
    setLinkError(null);
    setIsLoading(true);
    setLoadingProvider('apple');
    try {
      const provider = new OAuthProvider('apple.com');
      provider.addScope('email');
      provider.addScope('name');
      const result = await signInWithPopup(auth, provider);
      await finishProviderSignIn(result.user);
    } catch (error) {
      console.error(error);
      if (
        error instanceof FirebaseError &&
        (error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request')
      ) {
        return;
      }
      const appleHint =
        error instanceof FirebaseError && error.code === 'auth/operation-not-allowed'
          ? 'Apple Sign In isn’t enabled yet for this store. Try Google or email.'
          : 'Could not complete Apple sign-in. Try Google or email instead.';
      setFormError(appleHint);
      toast({
        variant: 'destructive',
        title: 'Apple sign-in didn’t finish',
        description: appleHint,
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const sendEmailLink = async (targetEmail: string, isResend = false) => {
    const trimmed = targetEmail.trim();
    if (!isValidEmail(trimmed)) {
      setEmailTouched(true);
      setFormError('Enter a valid email address.');
      return;
    }

    const now = Date.now();
    if (isResend && now - lastEmailSendAt.current < RESEND_COOLDOWN_MS) {
      const waitSec = Math.ceil(
        (RESEND_COOLDOWN_MS - (now - lastEmailSendAt.current)) / 1000
      );
      setResendHint(`Please wait ${waitSec}s before requesting another link.`);
      return;
    }

    setFormError(null);
    setLinkError(null);
    setResendHint(null);
    setIsLoading(true);
    setLoadingProvider('email');

    const actionCodeSettings = {
      url: `${window.location.origin}/login${
        redirectUrl && redirectUrl !== '/'
          ? `?redirect=${encodeURIComponent(redirectUrl)}`
          : ''
      }`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings);
      lastEmailSendAt.current = Date.now();
      window.localStorage.setItem(EMAIL_FOR_SIGN_IN, trimmed);
      setSentEmail(trimmed);
      setEmail(trimmed);
      setIsEmailSent(true);
      if (isResend) {
        setResendHint('A new sign-in link is on its way.');
      }
    } catch (error) {
      console.error(error);
      let errorMessage = 'Could not send a sign-in link. Please try again.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/invalid-email') {
          errorMessage = 'Enter a valid email address.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage =
            'Too many attempts. Please wait a few minutes, then try again.';
        } else if (
          error.code === 'auth/network-request-failed' ||
          error.message?.toLowerCase().includes('network')
        ) {
          errorMessage = 'Network issue — check your connection and try again.';
        }
      }
      setFormError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Couldn’t send sign-in link',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailLink = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (isLoading) return;
    setEmailTouched(true);
    if (!isValidEmail(email)) {
      setFormError('Enter a valid email address.');
      return;
    }
    await sendEmailLink(email);
  };

  if (isUserLoading || (user && !user.isAnonymous)) {
    return (
      <main className="bg-cotton text-mineral-ink">
        <div className="ca-container flex min-h-[42vh] items-center justify-center py-16">
          <p className="font-body text-sm text-mineral-ink/60">Signing you in…</p>
        </div>
      </main>
    );
  }

  if (isEmailSent) {
    return (
      <main className="bg-cotton text-mineral-ink">
        <div className="ca-container flex justify-center px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
          <div className="w-full max-w-[440px]">
            <h1 className="ca-editorial-display text-editorial-section text-mineral-ink">
              Check your inbox.
            </h1>
            <p className="mt-4 font-body text-base leading-relaxed text-mineral-ink/70">
              We’ve sent a sign-in link to{' '}
              <span className="font-medium text-mineral-ink">{sentEmail}</span>.
            </p>
            <p className="mt-3 font-body text-sm leading-relaxed text-mineral-ink/60">
              Open the link in your email to continue. Use the same browser on this
              device when you can — it finishes signing you in more reliably.
            </p>

            {resendHint ? (
              <p className="mt-4 font-body text-sm text-mineral-ink/65" role="status">
                {resendHint}
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void sendEmailLink(sentEmail, true)}
                className="ca-btn-primary w-full justify-center"
              >
                {loadingProvider === 'email' ? 'Sending…' : 'Resend sign-in link'}
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setIsEmailSent(false);
                  setFormError(null);
                  setLinkError(null);
                  setResendHint(null);
                  setEmailTouched(false);
                }}
                className="ca-btn-secondary w-full justify-center"
              >
                Change email
              </button>
            </div>

            <GuestBrowsingFooter href={continueHref} className="mt-10" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-cotton text-mineral-ink">
      <div className="ca-container flex justify-center px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="w-full max-w-[440px]">
          <h1 className="ca-editorial-display text-editorial-section text-mineral-ink">
            Wear Better. Naturally.
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-mineral-ink/70">
            Sign in to save your details and keep track of your orders.
          </p>

          {(linkError || formError) && (
            <p
              role="alert"
              className="mt-6 border border-dusk-rose/35 bg-[color-mix(in_srgb,var(--ca-dusk-rose)_10%,var(--ca-linen))] px-4 py-3 font-body text-sm text-mineral-ink"
            >
              {linkError || formError}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="ca-btn-secondary w-full justify-center"
            >
              <GoogleGlyph />
              {loadingProvider === 'google' ? 'Connecting…' : 'Continue with Google'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAppleSignIn}
              className="ca-btn-secondary w-full justify-center"
            >
              <AppleGlyph />
              {loadingProvider === 'apple' ? 'Connecting…' : 'Continue with Apple'}
            </button>
          </div>

          <div className="relative my-8" role="separator" aria-label="or continue with email">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-oat" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-cotton px-3 font-body text-xs uppercase tracking-[0.14em] text-mineral-ink/45">
                or continue with email
              </span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleEmailLink} noValidate>
            <div>
              <label htmlFor="email" className="ca-field-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError(null);
                }}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@example.com"
                aria-invalid={emailInvalid || undefined}
                aria-describedby={
                  emailInvalid ? 'email-error' : 'email-help'
                }
                className={cn(
                  'mt-2 w-full border bg-cotton px-4 py-3 font-body text-sm text-mineral-ink placeholder:text-mineral-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue',
                  emailInvalid ? 'border-dusk-rose' : 'border-oat'
                )}
              />
              {emailInvalid ? (
                <p id="email-error" className="mt-2 font-body text-xs text-dusk-rose">
                  Enter a valid email address.
                </p>
              ) : (
                <p id="email-help" className="sr-only">
                  We’ll email a one-time sign-in link. No password needed.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || emailInvalid}
              className="ca-btn-primary w-full justify-center"
            >
              {loadingProvider === 'email' ? 'Sending…' : 'Email me a sign-in link'}
            </button>

            <p className="font-body text-xs leading-relaxed text-mineral-ink/55">
              No password needed. We’ll send a secure sign-in link.
            </p>
          </form>

          <GuestBrowsingFooter href={continueHref} className="mt-10" />
        </div>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

function AppleGlyph() {
  return (
    <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.745.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.33-.02-.14-1.05.41-2.22 1.09-2.97.75-.82 2.06-1.47 3.1-1.61.1.15.14.32.14.5.07-.02.14-.03.2-.03.01-.17.04-.34.04-.52zM20.8 17.33c-.55 1.26-.81 1.82-1.52 2.93-1 1.55-2.4 3.48-4.14 3.5-1.54.02-1.94-.99-4.04-.98-2.1.01-2.54 1-4.08.98-1.74-.02-3.07-1.76-4.07-3.31C1.3 17.68.2 13.9 1.9 11.2c1.2-1.9 3.1-3.01 4.9-3.01 1.83 0 2.98 1 4.49 1 1.45 0 2.33-1 4.5-1 1.61 0 3.31.88 4.51 2.4-3.96 2.17-3.32 7.82.5 6.74z"
      />
    </svg>
  );
}
