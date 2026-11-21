'use client';

/**
 * Legacy vibe onboarding used to force `/onboarding` after every sign-in.
 * Optional Sign in keeps guest browsing and guest checkout primary — do not
 * redirect signed-in shoppers into a quiz. The `/onboarding` route remains
 * reachable for anyone who navigates there deliberately.
 */
export function CheckOnboarding({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
