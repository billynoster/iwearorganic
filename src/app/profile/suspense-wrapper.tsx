'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Legacy wrapper — Account lives at `/account`. */
export default function ProfilePageWrapper() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/account');
  }, [router]);
  return (
    <main className="ca-container flex min-h-[40vh] items-center justify-center py-20">
      <p className="font-body text-sm text-mineral-ink/60">Opening account…</p>
    </main>
  );
}
