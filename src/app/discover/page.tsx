import { Suspense } from 'react';
import HomePage from './home-page';

// Triggering a fresh state for Cloud Run deployment 3
// Adding a comment to push the latest commit
export default function Page() {
  return (
    <Suspense>
      <HomePage />
    </Suspense>
  );
}
