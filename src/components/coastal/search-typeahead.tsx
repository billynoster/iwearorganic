'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import type { Product } from '@/services/types';
import { loadSearchCatalog, rankSearchResults } from '@/lib/search-catalog';
import { cn } from '@/lib/utils';

const SUGGESTION_LIMIT = 6;

interface SearchTypeaheadProps {
  /** Called when the panel opens/closes so the parent can adjust layout (e.g. close mobile nav). */
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

/**
 * Masthead predictive search.
 * Opens only on user activation — does not steal focus on page load.
 * Combobox pattern: arrow keys move active option; Enter activates; Esc closes.
 */
export function SearchTypeahead({ onOpenChange, className }: SearchTypeaheadProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [usingFixtures, setUsingFixtures] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions =
    query.trim().length >= 1
      ? rankSearchResults(products, query).slice(0, SUGGESTION_LIMIT)
      : [];

  const setPanelOpen = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
      if (!next) {
        setActiveIndex(-1);
        triggerRef.current?.focus();
      }
    },
    [onOpenChange]
  );

  useEffect(() => {
    if (!open || loaded) return;
    let cancelled = false;
    (async () => {
      const result = await loadSearchCatalog();
      if (!cancelled) {
        setProducts(result.products);
        setUsingFixtures(result.usingFixtures);
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, loaded]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, setPanelOpen]);

  const goToSearchPage = (value = query) => {
    const q = value.trim();
    setPanelOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  };

  const activateSuggestion = (product: Product) => {
    setPanelOpen(false);
    router.push(`/shopping/${product.id}`);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((i) => (i + 1) % suggestions.length);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (suggestions.length === 0) return;
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        activateSuggestion(suggestions[activeIndex]);
      } else {
        goToSearchPage();
      }
      return;
    }
    if (event.key === 'Home' && suggestions.length) {
      event.preventDefault();
      setActiveIndex(0);
    }
    if (event.key === 'End' && suggestions.length) {
      event.preventDefault();
      setActiveIndex(suggestions.length - 1);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink/80 transition-colors hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
        aria-label="Search products"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-haspopup="listbox"
        onClick={() => setPanelOpen(!open)}
      >
        <SearchIcon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.5} />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-[min(22rem,calc(100vw-2rem))] border border-oat bg-linen p-4 shadow-none sm:w-96"
          role="dialog"
          aria-label="Search the collection"
        >
          <div className="flex items-center gap-2 border-b border-oat pb-4">
            <SearchIcon
              className="h-4 w-4 shrink-0 text-mineral-ink/45"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <label htmlFor={inputId} className="sr-only">
              Search products
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="search"
              value={query}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search tees, hoodies, menswear…"
              className="min-h-11 w-full bg-transparent font-body text-sm text-mineral-ink placeholder:text-mineral-ink/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listboxId}
              aria-expanded={suggestions.length > 0}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined
              }
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(-1);
              }}
              onKeyDown={onInputKeyDown}
            />
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink/60 hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              aria-label="Close search"
              onClick={() => setPanelOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          {usingFixtures ? (
            <p className="mt-2 font-body text-[0.65rem] uppercase tracking-[0.14em] text-dusk-rose">
              Fixture catalog
            </p>
          ) : null}

          <ul
            id={listboxId}
            role="listbox"
            aria-label="Suggested products"
            className="mt-2 max-h-72 overflow-y-auto"
          >
            {query.trim() && suggestions.length === 0 && loaded ? (
              <li className="px-1 py-3 font-body text-sm text-mineral-ink/60">
                No quick matches.{' '}
                <button
                  type="button"
                  className="underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
                  onClick={() => goToSearchPage()}
                >
                  Search all results
                </button>
              </li>
            ) : null}

            {suggestions.map((product, index) => {
              const active = index === activeIndex;
              const image =
                product.images.find((i) => i.isDefault) ?? product.images[0];
              return (
                <li key={product.id} role="presentation">
                  <button
                    type="button"
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={active}
                    className={cn(
                      'flex w-full items-center gap-3 px-2 py-2 text-left font-body text-sm transition-colors focus-visible:outline-none',
                      active
                        ? 'bg-oat/50 text-mineral-ink'
                        : 'text-mineral-ink hover:bg-oat/30'
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => activateSuggestion(product)}
                  >
                    <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-[#ebe6df]">
                      {image?.src &&
                      (image.src.startsWith('http') || image.src.startsWith('data:')) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image.src}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span
                          className="absolute inset-0 bg-[linear-gradient(150deg,#e8e2d8,#d5cec4)]"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-body text-sm font-medium">
                        {product.title}
                      </span>
                      <span className="block truncate text-xs text-mineral-ink/50">
                        View product
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t border-oat pt-4">
            <button
              type="button"
              onClick={() => goToSearchPage()}
              className="ca-text-link min-h-11 w-full justify-between py-2"
            >
              {query.trim() ? `Search for “${query.trim()}”` : 'Open search page'}
              <span aria-hidden="true">→</span>
            </button>
            <Link
              href="/shopping"
              onClick={() => setPanelOpen(false)}
              className="mt-1 inline-flex min-h-11 items-center font-body text-xs text-mineral-ink/55 underline-offset-2 hover:text-mineral-ink hover:underline"
            >
              Browse the collection
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
