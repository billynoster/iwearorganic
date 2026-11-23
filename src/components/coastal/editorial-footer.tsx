import Link from 'next/link';
import { Logo } from '@/components/logo';

/** Brand kit §40 footer groups */
const COLUMNS = [
  {
    title: 'Shop',
    links: [
      { href: '/women', label: 'Women' },
      { href: '/men', label: 'Men' },
      { href: '/new-arrivals', label: 'New Arrivals' },
      { href: '/shopping', label: 'Best Sellers' },
    ],
  },
  {
    title: 'About',
    links: [
      { href: '/about', label: 'Our Story' },
      { href: '/about', label: 'Materials' },
      { href: '/about', label: 'Organic Standards' },
    ],
  },
  {
    title: 'Help',
    links: [
      { href: '/shipping', label: 'Shipping' },
      { href: '/shipping', label: 'Returns' },
      { href: '/contact', label: 'Size Guide' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Follow',
    links: [
      { href: 'https://instagram.com/iwearorganic', label: 'Instagram', external: true },
      { href: 'https://www.tiktok.com/@iwearorganic', label: 'TikTok', external: true },
      { href: 'https://www.pinterest.com/iwearorganic', label: 'Pinterest', external: true },
      { href: 'https://x.com/iwearorganic', label: 'X', external: true },
    ],
  },
];

export function EditorialFooter() {
  return (
    <footer className="ca-section-y border-t border-oat bg-cotton">
      <div className="ca-container">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo variant="forest" lockup="wordmark" className="w-[168px]" />
            <p className="ca-editorial mt-3 max-w-xs text-xl text-mineral-ink">
              Wear Better. Naturally.
            </p>
            <p className="ca-lede mt-3 max-w-xs text-sm">
              Organic apparel for everyday life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="ca-eyebrow text-mineral-ink">{column.title}</p>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        {...('external' in link && link.external
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="ca-meta inline-flex min-h-11 items-center transition-colors hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest"
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
          <p className="ca-meta text-mineral-ink/45">
            © {new Date().getFullYear()} I Wear Organic
          </p>
        </div>
      </div>
    </footer>
  );
}
