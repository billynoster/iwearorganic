'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, MapPin, Package, UserRound } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  initialsFromLabel,
  resolveAccountDisplayName,
  type ProfileNameFields,
} from '@/lib/account-profile';
import { cn } from '@/lib/utils';

type AccountMenuProps = {
  /** Close parent mobile drawer when a link is chosen. */
  onNavigate?: () => void;
  className?: string;
  /** Compact text link for mobile drawer (no avatar). */
  variant?: 'nav' | 'mobile';
};

/**
 * Optional Sign in / Account control for Coastal Analog chrome.
 * Guests see a quiet “Sign in” link — never a forced gate.
 */
export function AccountMenu({
  onNavigate,
  className,
  variant = 'nav',
}: AccountMenuProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileNameFields | null>(null);

  const signedIn = Boolean(user && !user.isAnonymous);

  useEffect(() => {
    if (!signedIn || !user || !firestore) {
      setProfile(null);
      return;
    }
    const userRef = doc(firestore, 'users', user.uid);
    const unsub = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          setProfile(null);
          return;
        }
        const data = snap.data();
        // Until the customer saves Profile, ignore leftover seeded names for email-link.
        if (data.hasChosenName !== true) {
          const providers = user.providerData ?? [];
          const emailOnly =
            providers.length === 0
              ? Boolean(user.email)
              : providers.every((p) => p.providerId === 'password');
          if (emailOnly) {
            setProfile(null);
            return;
          }
        }
        setProfile({
          firstName: typeof data.firstName === 'string' ? data.firstName : null,
          lastName: typeof data.lastName === 'string' ? data.lastName : null,
          displayName:
            typeof data.displayName === 'string' ? data.displayName : null,
        });
      },
      () => setProfile(null)
    );
    return () => unsub();
  }, [signedIn, user, firestore]);

  const handleSignOut = async () => {
    await auth.signOut();
    onNavigate?.();
    router.push('/');
  };

  if (isUserLoading) {
    return (
      <span
        className={cn(
          'inline-flex h-11 w-11 items-center justify-center',
          className
        )}
        aria-hidden="true"
      >
        <span className="h-7 w-7 animate-pulse rounded-full bg-oat/80" />
      </span>
    );
  }

  if (!signedIn) {
    if (variant === 'mobile') {
      return (
        <Link
          href="/login"
          className={cn(
            'min-h-11 py-3 font-body text-sm font-medium text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue',
            className
          )}
          onClick={onNavigate}
        >
          Sign in
        </Link>
      );
    }

    return (
      <Link
        href="/login"
        className={cn(
          'inline-flex min-h-11 items-center px-1 font-body text-[0.8125rem] font-medium tracking-[0.01em] text-mineral-ink/65 transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
          className
        )}
      >
        Sign in
      </Link>
    );
  }

  const label = resolveAccountDisplayName(user, profile);
  const shortLabel = label.split(/\s+/)[0] || 'Account';
  const initials = initialsFromLabel(label, user!.email);

  if (variant === 'mobile') {
    return (
      <div className={cn('flex flex-col border-t border-oat/70 pt-2', className)}>
        <p className="py-2 font-body text-xs text-mineral-ink/55">{label}</p>
        <Link
          href="/account/orders"
          className="min-h-11 py-3 font-body text-sm font-medium text-mineral-ink"
          onClick={onNavigate}
        >
          Orders
        </Link>
        <Link
          href="/account/addresses"
          className="min-h-11 py-3 font-body text-sm font-medium text-mineral-ink"
          onClick={onNavigate}
        >
          Addresses
        </Link>
        <Link
          href="/account/profile"
          className="min-h-11 py-3 font-body text-sm font-medium text-mineral-ink"
          onClick={onNavigate}
        >
          Profile
        </Link>
        <button
          type="button"
          className="min-h-11 py-3 text-left font-body text-sm font-medium text-mineral-ink/70"
          onClick={handleSignOut}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex min-h-11 items-center gap-2 rounded-sm px-1 text-mineral-ink/80 transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
            className
          )}
          aria-label={`Account menu for ${label}`}
        >
          {user!.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user!.photoURL}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-oat font-body text-[0.65rem] font-semibold text-mineral-ink">
              {initials}
            </span>
          )}
          <span className="hidden max-w-[7rem] truncate font-body text-[0.8125rem] font-medium tracking-[0.01em] lg:inline">
            {shortLabel}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-oat bg-linen text-mineral-ink shadow-none"
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            <span className="font-body text-sm font-medium leading-none">
              {label}
            </span>
            {user!.email ? (
              <span className="font-body text-xs text-mineral-ink/55">
                {user!.email}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-oat" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-oat/60">
          <Link href="/account/orders" onClick={onNavigate}>
            <Package className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-oat/60">
          <Link href="/account/addresses" onClick={onNavigate}>
            <MapPin className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Addresses
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-oat/60">
          <Link href="/account/profile" onClick={onNavigate}>
            <UserRound className="mr-2 h-4 w-4" strokeWidth={1.5} />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-oat" />
        <DropdownMenuItem
          className="cursor-pointer focus:bg-oat/60"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
