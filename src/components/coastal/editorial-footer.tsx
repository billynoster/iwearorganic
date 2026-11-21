import Image from 'next/image';
import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/men', label: 'Men' },
      { href: '/women', label: 'Women' },
      { href: '/new-arrivals', label: 'New Arrivals' },
      { href: '/shopping', label: 'All' },
      { href: '/lookbook', label: 'Lookbook' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/about', label: 'About' },
      { href: '/shipping', label: 'Shipping & Returns' },
    ],
  },
  {
    title: 'Policies',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
    ],
  },
];

const USA_FLAG = '/editorial/brand/usa-flag.webp';

export function EditorialFooter() {
  return (
    <footer className="ca-section-y border-t border-oat bg-linen">
      <div className="ca-container">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-brand text-lg font-bold lowercase tracking-tight text-mineral-ink">
              i wear organic.
            </p>
            <p className="ca-editorial mt-3 max-w-xs text-base text-mineral-ink/60">
              Easy to wear. Hard to overlook.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7 md:col-start-6">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="ca-eyebrow text-mineral-ink">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="ca-meta inline-flex min-h-11 items-center transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-oat pt-6">
          <p className="ca-meta inline-flex items-center gap-2 text-mineral-ink/45">
            <Image
              src={USA_FLAG}
              alt=""
              width={91}
              height={48}
              unoptimized
              className="h-4 w-auto"
              aria-hidden="true"
            />
            <span>© {new Date().getFullYear()} I Wear Organic</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
