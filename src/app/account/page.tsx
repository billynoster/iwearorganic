'use client';

import Link from 'next/link';
import { useAuth, useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { AccountShell } from '@/components/account/account-shell';
import { RequireSignedIn } from '@/components/account/require-signed-in';

export default function AccountPage() {
  return (
    <RequireSignedIn>
      <AccountOverview />
    </RequireSignedIn>
  );
}

function AccountOverview() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <AccountShell
      title="Your account."
      description="Profile, orders, and saved addresses — optional, whenever you want them."
      email={user?.email}
    >
      <ul className="divide-y divide-oat border-y border-oat">
        <li>
          <Link
            href="/account/profile"
            className="flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-mineral-ink"
          >
            <span>
              <span className="block font-body text-base font-semibold text-mineral-ink">
                Profile
              </span>
              <span className="mt-1 block font-body text-sm text-mineral-ink/55">
                Name, email, and phone
              </span>
            </span>
            <span aria-hidden="true" className="font-body text-sm text-mineral-ink/40">
              →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/account/orders"
            className="flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-mineral-ink"
          >
            <span>
              <span className="block font-body text-base font-semibold text-mineral-ink">
                Orders
              </span>
              <span className="mt-1 block font-body text-sm text-mineral-ink/55">
                Past purchases and fulfillment status
              </span>
            </span>
            <span aria-hidden="true" className="font-body text-sm text-mineral-ink/40">
              →
            </span>
          </Link>
        </li>
        <li>
          <Link
            href="/account/addresses"
            className="flex items-baseline justify-between gap-4 py-5 transition-colors hover:text-mineral-ink"
          >
            <span>
              <span className="block font-body text-base font-semibold text-mineral-ink">
                Addresses
              </span>
              <span className="mt-1 block font-body text-sm text-mineral-ink/55">
                Saved details for faster checkout
              </span>
            </span>
            <span aria-hidden="true" className="font-body text-sm text-mineral-ink/40">
              →
            </span>
          </Link>
        </li>
      </ul>

      <div className="mt-8">
        <button
          type="button"
          onClick={handleSignOut}
          className="ca-btn-secondary border border-mineral-ink/20"
        >
          Sign out
        </button>
      </div>
    </AccountShell>
  );
}
