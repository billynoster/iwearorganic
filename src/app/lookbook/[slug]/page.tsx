import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AppStoreSignature } from '@/components/coastal/app-store-signature';
import { EditorialFilm } from '@/components/coastal/lookbook/editorial-film';
import { ShoppableLook } from '@/components/coastal/lookbook/shoppable-look';
import { StyleEditCard } from '@/components/coastal/lookbook/style-edit-card';
import {
  getPublishedEditBySlug,
  getPublishedEdits,
  getRelatedEdits,
} from '@/content/lookbook-edits';
import { catalogService } from '@/services';

interface StyleEditPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getPublishedEdits().map((edit) => ({ slug: edit.slug }));
}

export async function generateMetadata({
  params,
}: StyleEditPageProps): Promise<Metadata> {
  const { slug } = await params;
  const edit = getPublishedEditBySlug(slug);
  if (!edit) {
    return { title: 'Style Edit' };
  }

  const description = edit.description;
  const url = `https://iwearorganic.com/lookbook/${edit.slug}`;

  return {
    title: edit.title.replace(/\.$/, ''),
    description,
    openGraph: {
      title: `${edit.title.replace(/\.$/, '')} | Lookbook`,
      description,
      url,
      images: [{ url: edit.heroImage, alt: edit.heroAlt }],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function StyleEditPage({ params }: StyleEditPageProps) {
  const { slug } = await params;
  const edit = getPublishedEditBySlug(slug);
  if (!edit) notFound();

  const { products, meta } = await catalogService.listProducts();
  const related = getRelatedEdits(edit.slug, 2);

  return (
    <main>
      <nav
        aria-label="Breadcrumb"
        className="border-b border-oat/60 bg-linen"
      >
        <div className="ca-container py-3">
          <ol className="flex flex-wrap items-center gap-2 font-body text-xs uppercase tracking-[0.14em] text-mineral-ink/55">
            <li>
              <Link
                href="/lookbook"
                className="min-h-11 inline-flex items-center hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                Lookbook
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-mineral-ink" aria-current="page">
              {edit.title.replace(/\.$/, '')}
            </li>
          </ol>
        </div>
      </nav>

      <header className="relative">
        <div className="relative min-h-[56svh] overflow-hidden md:min-h-[64svh] lg:aspect-[21/9] lg:min-h-0">
          <div className="absolute inset-0" aria-hidden="true">
            {edit.mobileHeroImage ? (
              <>
                <Image
                  src={edit.mobileHeroImage}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-center md:hidden"
                />
                <Image
                  src={edit.heroImage}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className={`hidden object-cover md:block ${
                    edit.heroObjectPositionClassName ?? 'object-[center_20%]'
                  }`}
                />
              </>
            ) : (
              <Image
                src={edit.heroImage}
                alt=""
                fill
                priority
                sizes="100vw"
                className={`object-cover ${
                  edit.heroObjectPositionClassName ?? 'object-[center_18%]'
                }`}
              />
            )}
            <div
              className="absolute inset-0 bg-gradient-to-t from-mineral-ink/55 via-mineral-ink/15 to-transparent"
              aria-hidden="true"
            />
          </div>

          <div className="ca-container relative z-10 flex min-h-[56svh] items-end pb-10 pt-20 md:min-h-[64svh] md:pb-14 lg:min-h-0 lg:h-full lg:items-end">
            <div className="max-w-2xl text-linen">
              {edit.eyebrow ? (
                <p className="ca-eyebrow mb-3 text-linen/75">
                  {edit.eyebrow}
                </p>
              ) : null}
              <h1 className="ca-editorial-display text-hero text-linen">
                {edit.title}
              </h1>
              <p className="ca-lede mt-4 max-w-md text-linen/85">
                {edit.description}
              </p>
              <span className="sr-only">{edit.heroAlt}</span>
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="featured-looks-heading">
        <div className="ca-container border-b border-oat/70 py-10 md:py-12">
          <h2
            id="featured-looks-heading"
            className="ca-display text-h2"
          >
            Featured looks
          </h2>
          <p className="mt-3 max-w-xl ca-lede">
            Explore the garments styled in this edit — then shop verified pieces from the
            catalog.
          </p>
        </div>

        {edit.looks.map((look, index) => (
          <ShoppableLook
            key={look.id}
            look={look}
            products={products}
            usingFixtures={meta.usingFixtures}
            reverse={index % 2 === 1}
            priority={index === 0}
          />
        ))}
      </section>

      {edit.film ? <EditorialFilm film={edit.film} /> : null}

      {related.length > 0 ? (
        <section
          aria-labelledby="related-edits-heading"
          className="border-t border-oat/70 bg-linen"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <h2
              id="related-edits-heading"
              className="ca-display text-h2"
            >
              Related edits
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
              {related.map((rel) => (
                <StyleEditCard key={rel.id} edit={rel} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <AppStoreSignature />
    </main>
  );
}
