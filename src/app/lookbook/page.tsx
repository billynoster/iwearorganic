import type { Metadata } from 'next';
import Link from 'next/link';
import { EditorialFilm } from '@/components/coastal/lookbook/editorial-film';
import { LookbookHero } from '@/components/coastal/lookbook/lookbook-hero';
import { StyleEditCard } from '@/components/coastal/lookbook/style-edit-card';
import { getPublishedEdits } from '@/content/lookbook-edits';

export const metadata: Metadata = {
  title: 'Lookbook',
  description:
    'Wear the moment. Style edits, looks, and fashion films from i wear organic — shop the pieces.',
  openGraph: {
    title: 'Lookbook | i wear organic',
    description:
      'A collection of looks, places, and everyday moments. Find your style. Shop the pieces.',
    url: 'https://iwearorganic.com/lookbook',
  },
  alternates: {
    canonical: 'https://iwearorganic.com/lookbook',
  },
};

export default function LookbookLandingPage() {
  const edits = getPublishedEdits();
  const [featured, ...rest] = edits;
  const filmEdit = edits.find((edit) => edit.film);

  return (
    <main>
      <LookbookHero />

      <section
        aria-labelledby="style-edits-heading"
        className="border-t border-oat/70 bg-linen"
      >
        <div className="ca-container py-14 sm:py-16 md:py-20">
          <div className="mb-10 max-w-2xl md:mb-14">
            <p className="ca-eyebrow mb-3">Style Edits</p>
            <h2
              id="style-edits-heading"
              className="ca-display text-h2"
            >
              Curated campaigns.
            </h2>
            <p className="mt-4 ca-lede">
              Discover an edit, explore its looks, and shop the pieces — less reading, more
              wearing.
            </p>
          </div>

          {edits.length === 0 ? (
            <p className="font-body text-mineral-ink/60">
              New Style Edits are on the way. Meanwhile,{' '}
              <Link href="/shopping" className="underline underline-offset-2">
                shop the collection
              </Link>
              .
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-x-8 md:gap-y-16">
              {featured ? (
                <StyleEditCard edit={featured} featured priority />
              ) : null}
              {rest.map((edit) => (
                <StyleEditCard key={edit.id} edit={edit} />
              ))}
            </div>
          )}
        </div>
      </section>

      {filmEdit?.film ? <EditorialFilm film={filmEdit.film} /> : null}

      <section
        aria-labelledby="lookbook-shop-heading"
        className="border-t border-oat/70 bg-linen"
      >
        <div className="ca-container py-14 sm:py-16 md:py-20">
          <div className="max-w-xl">
            <p className="ca-eyebrow mb-3">Shop</p>
            <h2
              id="lookbook-shop-heading"
              className="ca-display text-h2"
            >
              Wear it your way.
            </h2>
            <p className="mt-4 ca-lede">
              Move from editorial looks into the Everyday Collection — considered essentials,
              easy to wear.
            </p>
            <div className="mt-8">
              <Link href="/shopping" className="ca-btn-primary !rounded-[6px]">
                Shop the Collection
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
