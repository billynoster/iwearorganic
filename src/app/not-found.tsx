import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="ca-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="ca-eyebrow mb-3">404</p>
      <h1 className="ca-display text-h2">
        Page not found.
      </h1>
      <p className="ca-lede mt-4">
        That path is not in the collection. Try the shop or return home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="ca-btn-primary">
          Home
        </Link>
        <Link href="/shopping" className="ca-text-link py-3">
          Shop
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
