'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search as SearchIcon } from 'lucide-react';
import { PageHero } from '@/components/coastal/page-hero';
import { ProductGrid } from '@/components/coastal/product-grid';
import { ProductGridSkeleton } from '@/components/coastal/product-grid-skeleton';
import type { Product } from '@/services/types';
import { loadSearchCatalog, rankSearchResults } from '@/lib/search-catalog';
import { cn } from '@/lib/utils';

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get('q') || '';
  const [query, setQuery] = useState(initial);
  const [committedQuery, setCommittedQuery] = useState(initial);
  const [products, setProducts] = useState<Product[]>([]);
  const [usingFixtures, setUsingFixtures] = useState(true);
  const [catalogUnavailable, setCatalogUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setCommittedQuery(q);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await loadSearchCatalog();
        if (!cancelled) {
          setProducts(result.products);
          setUsingFixtures(result.usingFixtures);
          setCatalogUnavailable(Boolean(result.catalogUnavailable));
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Search unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(
    () => rankSearchResults(products, committedQuery),
    [products, committedQuery]
  );

  const commitSearch = useCallback(
    (value: string) => {
      const next = value.trim();
      setCommittedQuery(next);
      setActiveIndex(-1);
      const params = new URLSearchParams();
      if (next) params.set('q', next);
      router.replace(params.toString() ? `/search?${params}` : '/search', {
        scroll: false,
      });
    },
    [router]
  );

  const onResultsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => {
        const next = i < 0 ? 0 : (i + 1) % results.length;
        resultRefs.current[next]?.focus();
        return next;
      });
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => {
        const next = i <= 0 ? results.length - 1 : i - 1;
        resultRefs.current[next]?.focus();
        return next;
      });
    }
  };

  return (
    <main>
      <PageHero
        eyebrow="Search"
        title="Find your everyday."
        editorial
        description="Search the collection by name, fabric note, or category."
      />
      <div className="ca-container py-8 sm:py-12">
        <form
          role="search"
          className="mb-8 flex max-w-xl items-center gap-4 border-b border-mineral-ink/20 pb-4"
          onSubmit={(e) => {
            e.preventDefault();
            commitSearch(query);
          }}
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-mineral-ink/50" aria-hidden="true" />
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <input
            id="shop-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search menswear, tees, hoodies…"
            className="min-h-11 w-full bg-transparent font-body text-base text-mineral-ink placeholder:text-mineral-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            autoComplete="off"
          />
          <button type="submit" className="ca-btn-primary shrink-0 !min-h-11 !px-5">
            Search
          </button>
        </form>

        {catalogUnavailable ? (
          <p
            role="alert"
            className="mb-8 border border-oat bg-[color-mix(in_srgb,var(--ca-linen)_70%,var(--ca-oat))] px-4 py-3 font-body text-sm text-mineral-ink"
          >
            Catalog temporarily unavailable. Please refresh or try again shortly.
          </p>
        ) : usingFixtures ? (
          <p
            role="status"
            className="ca-caption mb-8 text-dusk-rose"
          >
            Development fixtures — not production inventory or pricing
          </p>
        ) : null}

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : error ? (
          <p className="font-body text-sm text-mineral-ink/70" role="alert">
            {error}
          </p>
        ) : results.length === 0 && committedQuery.trim() ? (
          <div className="ca-stack max-w-lg py-4" role="status">
            <p className="font-body text-sm text-mineral-ink/55">
              No results for{' '}
              <span className="font-medium text-mineral-ink">
                “{committedQuery.trim()}”
              </span>
            </p>
            <p className="ca-display text-h3">
              Nothing matched that search.
            </p>
            <p className="ca-lede">
              Try a broader term — tee, hoodie, menswear — or browse The Everyday Collection.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shopping" className="ca-btn-primary">
                Shop the collection
              </Link>
              <Link href="/new-arrivals" className="ca-text-link min-h-11 py-3">
                New arrivals
                <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="min-h-11 font-body text-sm text-mineral-ink/60 underline-offset-2 hover:underline"
                onClick={() => {
                  setQuery('');
                  commitSearch('');
                }}
              >
                Clear search
              </button>
            </div>
          </div>
        ) : (
          <div onKeyDown={onResultsKeyDown}>
            <p className="mb-4 font-body text-sm text-mineral-ink/60" aria-live="polite">
              {committedQuery.trim() ? (
                <>
                  {results.length} result{results.length === 1 ? '' : 's'} for{' '}
                  <span className="font-medium text-mineral-ink">
                    “{committedQuery.trim()}”
                  </span>
                </>
              ) : (
                <>
                  {results.length} piece{results.length === 1 ? '' : 's'} in the catalog — type to
                  refine
                </>
              )}
            </p>
            <p className="mb-8 font-body text-xs text-mineral-ink/45">
              Tip: use ↑ ↓ when a result link is focused to move through the list.
            </p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {results.map((product, index) => {
                const image =
                  product.images.find((i) => i.isDefault) ?? product.images[0];
                const price =
                  product.variants.find((v) => v.isEnabled)?.priceCents ??
                  product.variants[0]?.priceCents;
                return (
                  <li key={product.id}>
                    <Link
                      ref={(el) => {
                        resultRefs.current[index] = el;
                      }}
                      href={`/shopping/${product.id}`}
                      className={cn(
                        'group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
                        activeIndex === index && 'ring-2 ring-haze-blue ring-offset-2'
                      )}
                      onFocus={() => setActiveIndex(index)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-[#ebe6df]">
                        {image?.src &&
                        (image.src.startsWith('http') || image.src.startsWith('data:')) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={image.src}
                            alt={image.alt || product.title}
                            className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4_55%,#c8bdb4)]"
                            aria-hidden="true"
                          />
                        )}
                        {(usingFixtures || image?.isPlaceholder) && (
                          <span className="absolute bottom-2 left-2 font-body text-[0.6rem] uppercase tracking-[0.14em] text-mineral-ink/55">
                            Placeholder
                          </span>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        <h2 className="ca-product-title">
                          {product.title}
                        </h2>
                        {typeof price === 'number' ? (
                          <p className="ca-meta">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0,
                            }).format(price / 100)}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* Keep ProductGrid available for empty catalog edge */}
            {results.length === 0 && !committedQuery.trim() ? (
              <ProductGrid
                products={results}
                usingFixtures={usingFixtures}
                emptyMessage="No products in the catalog yet."
              />
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="ca-container py-20">
          <ProductGridSkeleton count={4} />
        </main>
      }
    >
      <SearchInner />
    </Suspense>
  );
}
