import { redirect } from 'next/navigation';

/**
 * Legacy /profile → focused Account surface (Orders + Addresses).
 * Wishlist / vibe preferences stay out of the Account menu scope.
 */
export default function ProfilePage() {
  redirect('/account');
}
