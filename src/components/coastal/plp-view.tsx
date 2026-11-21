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
import type { Product } from '@/services/types';
import { ProductGrid } from '@/components/coastal/product-grid';
import { ProductGridSkeleton } from '@/components/coastal/product-grid-skeleton';
import {
  PRICE_BANDS,
  SORT_OPTIONS,
  TOP_COLOR_COUNT,
  buildRefineSuggestions,
  collectPlpFacets,
  filterAndSortProducts,
  hasActivePlpFilters,
  parsePlpSearchParams,
  plpStateToSearchParams,
  visibleColorFacets,
  type PlpQueryState,
  type PlpSort,
  type PriceBand,
  type RefineSuggestion,
} from '@/lib/plp-query';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 4;

interface PlpViewProps {
  products: Product[];
  usingFixtures?: boolean;
  /** Optional collection nav chips (All / Men / Women / New Arrivals). */
  collectionLinks?: Array<{ href: string; label: string; active?: boolean }>;
}

function Chip({
  active,
  children,
  onClick,
  disabled,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center border px-3 font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
        active
          ? 'border-mineral-ink bg-mineral-ink text-linen'
          : 'border-oat bg-linen text-mineral-ink hover:border-mineral-ink/40 hover:bg-oat/30',
        disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      {children}
    </button>
  );
}

export function PlpView({ products, usingFixtures, collectionLinks }: PlpViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [colorsExpanded, setColorsExpanded] = useState(false);
  const [draftQuery, setDraftQuery] = useState('');
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchId = useId();
  const listboxId = `${searchId}-suggestions`;

  const state = useMemo(
    () => parsePlpSearchParams(searchParams),
    [searchParams]
  );

  // Keep local draft in sync when URL q changes (back/forward, clear-all).
  useEffect(() => {
    setDraftQuery(state.q || '');
  }, [state.q]);

  const facets = useMemo(() => collectPlpFacets(products), [products]);
  const filtered = useMemo(
    () => filterAndSortProducts(products, state),
    [products, state]
  );
  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;
  const filtersActive = hasActivePlpFilters(state);

  const colorFacet = useMemo(
    () =>
      visibleColorFacets({
        products,
        selected: state.color,
        query: draftQuery || state.q,
        expanded: colorsExpanded,
        limit: TOP_COLOR_COUNT,
      }),
    [products, state.color, state.q, draftQuery, colorsExpanded]
  );

  const suggestions = useMemo(
    () => buildRefineSuggestions(products, draftQuery, 8),
    [products, draftQuery]
  );

  const pushState = useCallback(
    (next: PlpQueryState) => {
      setVisibleCount(PAGE_SIZE);
      const params = plpStateToSearchParams(next);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router]
  );

  const clearAll = () => {
    setColorsExpanded(false);
    setDraftQuery('');
    setSuggestionsOpen(false);
    pushState({
      color: null,
      size: null,
      price: null,
      sort: 'featured',
      q: null,
    });
  };

  const commitQuery = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      pushState({
        ...state,
        q: trimmed || null,
      });
    },
    [pushState, state]
  );

  const onDraftChange = (value: string) => {
    setDraftQuery(value);
    setSuggestionsOpen(true);
    setActiveSuggestion(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      commitQuery(value);
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, []);

  const applySuggestion = (suggestion: RefineSuggestion) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    if (suggestion.kind === 'color') {
      setDraftQuery('');
      pushState({ ...state, color: suggestion.value, q: null });
      return;
    }
    if (suggestion.kind === 'size') {
      setDraftQuery('');
      pushState({ ...state, size: suggestion.value, q: null });
      return;
    }
    setDraftQuery('');
    pushState({ ...state, price: suggestion.value, q: null });
  };

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen || suggestions.length === 0) {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        commitQuery(draftQuery);
        setSuggestionsOpen(false);
      }
      if (event.key === 'Escape') {
        setSuggestionsOpen(false);
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeSuggestion >= 0) {
        applySuggestion(suggestions[activeSuggestion]);
      } else {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        commitQuery(draftQuery);
        setSuggestionsOpen(false);
      }
    } else if (event.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  };

  // Sizes stay compact — filter list lightly when refine query looks size-like.
  const visibleSizes = useMemo(() => {
    const needle = (draftQuery || state.q || '').trim().toLowerCase();
    if (!needle) return facets.sizes;
    const matched = facets.sizes.filter(
      (s) =>
        s.toLowerCase().includes(needle) ||
        `size ${s}`.toLowerCase().includes(needle)
    );
    if (matched.length === 0) return facets.sizes;
    if (state.size && !matched.includes(state.size)) {
      return [state.size, ...matched];
    }
    return matched;
  }, [facets.sizes, draftQuery, state.q, state.size]);

  return (
    <div>
      {collectionLinks && collectionLinks.length > 0 ? (
        <nav
          className="mb-8 flex flex-wrap gap-x-6 gap-y-2 border-b border-oat pb-4"
          aria-label="Shop collections"
        >
          {collectionLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'font-body text-sm transition-colors',
                link.active
                  ? 'font-medium text-mineral-ink'
                  : 'text-mineral-ink/60 hover:text-mineral-ink'
              )}
              aria-current={link.active ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="mb-8 space-y-5 border-b border-oat pb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="ca-eyebrow">
              Refine
            </p>
            <p className="ca-meta mt-1">
              {isPending ? 'Updating…' : `${filtered.length} of ${products.length} pieces`}
              {usingFixtures ? (
                <span className="ca-caption ml-2 text-dusk-rose">
                  Fixture catalog
                </span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="plp-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="plp-sort"
              value={state.sort}
              onChange={(e) =>
                pushState({ ...state, sort: e.target.value as PlpSort })
              }
              className="min-h-11 border border-oat bg-linen px-3 font-body text-sm text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearAll}
                className="min-h-11 px-3 font-body text-sm text-mineral-ink/60 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                Clear all
              </button>
            ) : null}
          </div>
        </div>

        {/* Single refine search — typeahead facets + text query on products */}
        <div ref={searchWrapRef} className="relative max-w-xl">
          <label
            htmlFor={searchId}
            className="font-body text-sm font-medium text-mineral-ink"
          >
            Search pieces & filters
          </label>
          <div className="relative mt-2">
            <input
              id={searchId}
              type="search"
              value={draftQuery}
              onChange={(e) => onDraftChange(e.target.value)}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={onSearchKeyDown}
              placeholder="Try a color, size, price, or piece name"
              autoComplete="off"
              role="combobox"
              aria-expanded={suggestionsOpen && suggestions.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeSuggestion >= 0
                  ? `${listboxId}-${activeSuggestion}`
                  : undefined
              }
              className="min-h-11 w-full border border-oat bg-linen px-3 font-body text-sm text-mineral-ink placeholder:text-mineral-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            />
            {draftQuery ? (
              <button
                type="button"
                onClick={() => {
                  if (debounceRef.current) clearTimeout(debounceRef.current);
                  setDraftQuery('');
                  setSuggestionsOpen(false);
                  pushState({ ...state, q: null });
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-h-9 px-2 font-body text-xs text-mineral-ink/55 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              >
                Clear
              </button>
            ) : null}
          </div>
          <p className="mt-1.5 font-body text-xs text-mineral-ink/45">
            Narrows the grid and highlights matching colors & sizes.
          </p>

          {suggestionsOpen && suggestions.length > 0 ? (
            <ul
              id={listboxId}
              role="listbox"
              className="absolute z-30 mt-1 max-h-64 w-full overflow-auto border border-oat bg-linen shadow-[0_12px_40px_-20px_rgba(48,52,53,0.35)]"
            >
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.kind}-${suggestion.value}`} role="presentation">
                  <button
                    type="button"
                    id={`${listboxId}-${index}`}
                    role="option"
                    aria-selected={index === activeSuggestion}
                    className={cn(
                      'flex min-h-11 w-full items-center px-3 text-left font-body text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-haze-blue',
                      index === activeSuggestion
                        ? 'bg-oat/50 text-mineral-ink'
                        : 'text-mineral-ink hover:bg-oat/35'
                    )}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onClick={() => applySuggestion(suggestion)}
                  >
                    {suggestion.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {facets.colors.length > 0 ? (
          <fieldset>
            <legend className="font-body text-sm font-medium text-mineral-ink">
              Color
              {colorFacet.total > TOP_COLOR_COUNT ? (
                <span className="ml-2 font-normal text-mineral-ink/45">
                  {colorFacet.total} available
                </span>
              ) : null}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {colorFacet.visible.map((color) => (
                <Chip
                  key={color}
                  active={state.color === color}
                  onClick={() =>
                    pushState({
                      ...state,
                      color: state.color === color ? null : color,
                    })
                  }
                >
                  {color}
                </Chip>
              ))}
              {!colorsExpanded &&
              !draftQuery &&
              colorFacet.hiddenCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setColorsExpanded(true)}
                  className="inline-flex min-h-11 items-center border border-dashed border-oat px-3 font-body text-sm text-mineral-ink/70 transition-colors hover:border-mineral-ink/40 hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                >
                  More colors (+{colorFacet.hiddenCount})
                </button>
              ) : null}
              {colorsExpanded && colorFacet.total > TOP_COLOR_COUNT ? (
                <button
                  type="button"
                  onClick={() => setColorsExpanded(false)}
                  className="inline-flex min-h-11 items-center px-3 font-body text-sm text-mineral-ink/60 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                >
                  Show fewer
                </button>
              ) : null}
            </div>
            {!colorsExpanded && !draftQuery && colorFacet.hiddenCount > 0 ? (
              <p className="mt-2 font-body text-xs text-mineral-ink/45">
                Showing top colors — search above or open more.
              </p>
            ) : null}
          </fieldset>
        ) : null}

        {facets.sizes.length > 0 ? (
          <fieldset>
            <legend className="font-body text-sm font-medium text-mineral-ink">Size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {visibleSizes.map((size) => (
                <Chip
                  key={size}
                  active={state.size === size}
                  onClick={() =>
                    pushState({
                      ...state,
                      size: state.size === size ? null : size,
                    })
                  }
                >
                  {size}
                </Chip>
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset>
          <legend className="font-body text-sm font-medium text-mineral-ink">Price</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRICE_BANDS.map((band) => (
              <Chip
                key={band.id}
                active={state.price === band.id}
                onClick={() =>
                  pushState({
                    ...state,
                    price: state.price === band.id ? null : (band.id as PriceBand),
                  })
                }
              >
                {band.label}
              </Chip>
            ))}
          </div>
        </fieldset>
      </div>

      {isPending ? (
        <ProductGridSkeleton count={Math.min(8, Math.max(4, visible.length || 4))} />
      ) : filtered.length === 0 ? (
        <div className="max-w-lg space-y-5 py-6" role="status">
          <p className="ca-display text-h3">
            No pieces match.
          </p>
          <p className="ca-lede">
            Try clearing a filter or browse the full Everyday Collection.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={clearAll} className="ca-btn-primary">
              Clear filters
            </button>
            <a href="/shopping" className="ca-text-link min-h-11 py-3">
              Shop all
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      ) : (
        <>
          <ProductGrid products={visible} usingFixtures={usingFixtures} />
          {canLoadMore ? (
            <div className="mt-12 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="ca-btn-primary"
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
