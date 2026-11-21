'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Product } from '@/services/types';
import { ProductGrid } from '@/components/coastal/product-grid';
import { ProductGridSkeleton } from '@/components/coastal/product-grid-skeleton';
import { FilterDrawer } from '@/components/coastal/discovery/filter-drawer';
import { CategoryRail } from '@/components/coastal/discovery/category-rail';
import { AudienceRail } from '@/components/coastal/discovery/audience-rail';
import {
  DISCOVERY_SORT_OPTIONS,
  PAGE_SIZE,
  categoryLabel,
  collectCatalogCategories,
  countActiveFilterSelections,
  discoveryChips,
  discoveryStateToSearchParams,
  filterDiscoveryProducts,
  hasActiveDiscoveryFilters,
  parseDiscoverySearchParams,
  productsForAudience,
  removeDiscoveryChip,
  type CategoryId,
  type DiscoveryAudience,
  type DiscoveryChip,
  type DiscoverySort,
  type DiscoveryState,
} from '@/lib/collection-discovery';
import { cn } from '@/lib/utils';

export type DiscoveryCollectionKey = 'all' | 'men' | 'women' | 'new-arrivals';

interface CollectionDiscoveryProps {
  products: Product[];
  usingFixtures?: boolean;
  activeCollection?: DiscoveryCollectionKey;
}

function exploreEyebrow(
  collection: DiscoveryCollectionKey,
  audience: DiscoveryAudience
): string {
  if (collection === 'new-arrivals') {
    if (audience === 'women') return 'EXPLORE WOMENSWEAR';
    if (audience === 'men') return 'EXPLORE MENSWEAR';
    return 'EXPLORE NEW ARRIVALS';
  }
  switch (collection) {
    case 'women':
      return 'EXPLORE WOMENSWEAR';
    case 'men':
      return 'EXPLORE MENSWEAR';
    default:
      return 'EXPLORE THE SHOP';
  }
}

function allResultsLabel(
  collection: DiscoveryCollectionKey,
  audience: DiscoveryAudience
): string {
  if (collection === 'new-arrivals') {
    if (audience === 'women') return 'New arrivals · Women';
    if (audience === 'men') return 'New arrivals · Men';
    return 'All new arrivals';
  }
  switch (collection) {
    case 'women':
      return 'All womenswear';
    case 'men':
      return 'All menswear';
    default:
      return 'All pieces';
  }
}

export function CollectionDiscovery({
  products,
  usingFixtures,
  activeCollection = 'all',
}: CollectionDiscoveryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftQuery, setDraftQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const filtersButtonRef = useRef<HTMLButtonElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchId = useId();
  const liveId = useId();

  const audienceMode = activeCollection === 'new-arrivals';

  const applied = useMemo(() => {
    const parsed = parseDiscoverySearchParams(searchParams);
    // Audience URL only applies on New Arrivals.
    if (!audienceMode) return { ...parsed, audience: 'all' as const };
    return parsed;
  }, [searchParams, audienceMode]);

  useEffect(() => {
    setDraftQuery(applied.q || '');
  }, [applied.q]);

  const audienceProducts = useMemo(
    () =>
      audienceMode
        ? productsForAudience(products, applied.audience || 'all')
        : products,
    [audienceMode, products, applied.audience]
  );

  const catalogCategories = useMemo(
    () => collectCatalogCategories(audienceProducts),
    [audienceProducts]
  );

  const filtered = useMemo(
    () =>
      filterDiscoveryProducts(
        products,
        audienceMode ? applied : { ...applied, audience: 'all' }
      ),
    [products, applied, audienceMode]
  );

  const visibleCount = Math.min(filtered.length, applied.page * PAGE_SIZE);
  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;
  const chips = useMemo(() => discoveryChips(applied), [applied]);
  const filterCount = countActiveFilterSelections(applied);
  const filtersActive = hasActiveDiscoveryFilters(
    audienceMode ? applied : { ...applied, audience: 'all' }
  );
  const selectedCategoryId = applied.categories[0] || null;
  const selectedAudience: DiscoveryAudience = audienceMode
    ? applied.audience || 'all'
    : 'all';
  const resultsSummary = selectedCategoryId
    ? categoryLabel(selectedCategoryId)
    : allResultsLabel(activeCollection, selectedAudience);

  const pushState = useCallback(
    (next: DiscoveryState) => {
      const params = discoveryStateToSearchParams(next);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router]
  );

  const commitQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      pushState({
        ...applied,
        q: trimmed || null,
        page: 1,
      });
    },
    [applied, pushState]
  );

  const onDraftQueryChange = (value: string) => {
    setDraftQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => commitQuery(value), 300);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    };
  }, []);

  const clearAll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setDraftQuery('');
    pushState({
      q: null,
      audience: 'all',
      categories: [],
      colors: [],
      sizes: [],
      minPrice: null,
      maxPrice: null,
      availability: 'all',
      sort: applied.sort,
      page: 1,
    });
  };

  const removeChip = (chip: DiscoveryChip) => {
    const next = removeDiscoveryChip(applied, chip);
    if (chip.kind === 'q') setDraftQuery('');
    pushState(next);
  };

  const onAudienceSelect = (audience: DiscoveryAudience) => {
    // Audience change resets category to All (addendum).
    pushState({
      ...applied,
      audience,
      categories: [],
      page: 1,
    });
  };

  const onCategorySelect = (id: CategoryId | null) => {
    pushState({
      ...applied,
      categories: id ? [id] : [],
      page: 1,
    });
  };

  const shareableActive = Boolean(
    selectedCategoryId || (audienceMode && selectedAudience !== 'all')
  );

  const copyShareLink = async () => {
    try {
      const params = discoveryStateToSearchParams(
        audienceMode ? applied : { ...applied, audience: 'all' }
      );
      // Share the filtered collection view (category / audience), not pagination.
      params.delete('page');
      const qs = params.toString();
      const url =
        typeof window !== 'undefined'
          ? `${window.location.origin}${pathname}${qs ? `?${qs}` : ''}`
          : `${pathname}${qs ? `?${qs}` : ''}`;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      copyResetRef.current = setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
  };

  const onDrawerOpenChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      requestAnimationFrame(() => filtersButtonRef.current?.focus());
    }
  };

  const showCategoryRail =
    catalogCategories.length > 0 || Boolean(selectedCategoryId);
  const showRailDivider = audienceMode || showCategoryRail;

  return (
    <div>
      {audienceMode ? (
        <div className="ca-stack-tight mb-6">
          <AudienceRail
            selected={selectedAudience}
            onSelect={onAudienceSelect}
          />
        </div>
      ) : null}

      <CategoryRail
        eyebrow={exploreEyebrow(activeCollection, selectedAudience)}
        categories={catalogCategories}
        selectedId={selectedCategoryId}
        onSelect={onCategorySelect}
      />

      {showRailDivider ? (
        <div className="mt-6 border-t border-oat pt-6" aria-hidden="true" />
      ) : null}

      {/* Toolbar: search + Filters (Sort lives on the results row — Phase 6B concept) */}
      <div
        className={cn(
          'ca-toolbar',
          catalogCategories.length === 0 && 'mt-0'
        )}
      >
        <div className="relative w-full min-w-0 sm:flex-1 sm:max-w-none">
          <label htmlFor={searchId} className="sr-only">
            Search this collection
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mineral-ink/45"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={draftQuery}
            onChange={(e) => onDraftQueryChange(e.target.value)}
            placeholder="Search this collection"
            autoComplete="off"
            className="ca-input pl-10 pr-10"
          />
          {draftQuery ? (
            <button
              type="button"
              onClick={() => {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                setDraftQuery('');
                pushState({ ...applied, q: null, page: 1 });
              }}
              className="absolute right-2 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-mineral-ink/50 hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:shrink-0">
          <button
            ref={filtersButtonRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-oat bg-linen px-4 font-body text-sm text-mineral-ink transition-colors hover:border-mineral-ink/35 hover:bg-oat/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
          >
            <SlidersHorizontal
              className="h-4 w-4"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            Filters
            {filterCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-mineral-ink px-1.5 font-body text-[0.65rem] text-linen">
                {filterCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      {/* Results summary + Sort (concept meta row) */}
      <div className="ca-stack-tight mt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p
            id={liveId}
            className="font-body text-sm text-mineral-ink"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>{isPending ? 'Updating…' : resultsSummary}</span>
            {!isPending ? (
              <span className="text-mineral-ink/55">
                {` · ${filtered.length} ${filtered.length === 1 ? 'piece' : 'pieces'}`}
              </span>
            ) : null}
            {usingFixtures ? (
              <span className="ml-2 text-xs uppercase tracking-[0.12em] text-dusk-rose">
                Fixture catalog
              </span>
            ) : null}
          </p>

          <div className="flex items-center gap-3">
            {shareableActive ? (
              <button
                type="button"
                onClick={copyShareLink}
                className="min-h-11 px-1 font-body text-xs uppercase tracking-[0.12em] text-mineral-ink/45 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                aria-label={
                  linkCopied ? 'Share link copied' : 'Copy shareable link'
                }
              >
                {linkCopied ? 'Copied' : 'Copy link'}
              </button>
            ) : null}
            {filtersActive ? (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-11 px-1 font-body text-sm text-mineral-ink/60 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                Clear all
              </button>
            ) : null}
            <label htmlFor={`${searchId}-sort`} className="sr-only">
              Sort products
            </label>
            <select
              id={`${searchId}-sort`}
              value={applied.sort}
              onChange={(e) =>
                pushState({
                  ...applied,
                  sort: e.target.value as DiscoverySort,
                  page: 1,
                })
              }
              className="ca-select"
              aria-label="Sort"
            >
              {DISCOVERY_SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.id === 'featured' ? `Sort: ${opt.label}` : opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 ? (
          <ul className="ca-chip-row" aria-label="Active filters">
            {chips.map((chip) => (
              <li key={chip.key} className="shrink-0">
                <button
                  type="button"
                  onClick={() => removeChip(chip)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[6px] border border-oat bg-linen px-3 font-body text-sm text-mineral-ink transition-colors hover:border-mineral-ink/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                >
                  <span>{chip.label}</span>
                  <span aria-hidden="true" className="text-mineral-ink/45">
                    ×
                  </span>
                  <span className="sr-only">Remove {chip.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-8">
        {isPending ? (
          <ProductGridSkeleton
            count={Math.min(8, Math.max(4, visible.length || 4))}
          />
        ) : filtered.length === 0 ? (
          <div className="max-w-lg space-y-5 py-4" role="status">
            <p className="ca-display text-h3">
              No pieces found.
            </p>
            <p className="ca-lede">
              Try a different search or adjust your filters.
            </p>
            <div className="flex flex-wrap gap-3">
              {applied.q ? (
                <button
                  type="button"
                  className={cn('ca-btn-primary', '!rounded-[6px]')}
                  onClick={() => {
                    setDraftQuery('');
                    pushState({ ...applied, q: null, page: 1 });
                  }}
                >
                  Clear search
                </button>
              ) : null}
              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className={cn(
                    applied.q
                      ? 'ca-text-link min-h-11 py-3'
                      : cn('ca-btn-primary', '!rounded-[6px]')
                  )}
                >
                  Clear all filters
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <ProductGrid
              products={visible}
              usingFixtures={usingFixtures}
              showNewBadges={audienceMode}
            />
            {canLoadMore ? (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  className={cn('ca-btn-primary', '!rounded-[6px]')}
                  onClick={() =>
                    pushState({ ...applied, page: applied.page + 1 })
                  }
                >
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onOpenChange={onDrawerOpenChange}
        products={products}
        applied={applied}
        onApply={pushState}
      />
    </div>
  );
}
