'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { Check, ChevronDown, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  EMPTY_DISCOVERY_STATE,
  collectDiscoveryFacets,
  colorSwatchHex,
  countActiveFilterSelections,
  filterDiscoveryProducts,
  pricePresetActive,
  productsForAudience,
  toggleListValue,
  type DiscoveryState,
  type PricePreset,
} from '@/lib/collection-discovery';
import type { Product } from '@/services/types';
import { cn } from '@/lib/utils';

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  applied: DiscoveryState;
  onApply: (next: DiscoveryState) => void;
}

function OptionChip({
  active,
  onClick,
  children,
  swatch,
  disabled,
  disabledReason,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  swatch?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledReason : undefined}
      className={cn(
        'inline-flex min-h-11 items-center gap-2 rounded-[6px] border px-3 font-body text-sm transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
        'motion-reduce:transition-none',
        active
          ? 'border-mineral-ink bg-mineral-ink text-linen'
          : 'border-oat bg-linen text-mineral-ink hover:border-mineral-ink/40 hover:bg-oat/30',
        disabled &&
          'cursor-not-allowed opacity-40 hover:border-oat hover:bg-linen'
      )}
    >
      {swatch ? (
        <span
          className="h-3.5 w-3.5 shrink-0 rounded-full border border-mineral-ink/20"
          style={{ backgroundColor: swatch }}
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
      {active ? (
        <>
          <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="sr-only">, selected</span>
        </>
      ) : null}
      {disabled ? (
        <span className="sr-only">
          {disabledReason || ', no matching products'}
        </span>
      ) : null}
    </button>
  );
}

function GroupTrigger({
  label,
  count,
}: {
  label: string;
  count: number;
}) {
  return (
    <>
      <span className="flex items-center gap-2 font-body text-sm font-medium text-mineral-ink">
        {label}
        {count > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-oat px-1.5 font-body text-[0.65rem] tabular-nums text-mineral-ink/70">
            {count}
            <span className="sr-only"> selected</span>
          </span>
        ) : null}
      </span>
      <ChevronDown
        className="h-4 w-4 shrink-0 text-mineral-ink/55 transition-transform duration-200 group-data-[state=open]:rotate-180 motion-reduce:transition-none"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </>
  );
}

export function FilterDrawer({
  open,
  onOpenChange,
  products,
  applied,
  onApply,
}: FilterDrawerProps) {
  const titleId = useId();
  const [draft, setDraft] = useState<DiscoveryState>(applied);
  const [openGroups, setOpenGroups] = useState<string[]>(['color']);
  // Facets scoped to current audience (NA Level 1) so drawer options stay coherent.
  const facetProducts = useMemo(
    () => productsForAudience(products, applied.audience || 'all'),
    [products, applied.audience]
  );
  const facets = useMemo(
    () => collectDiscoveryFacets(facetProducts),
    [facetProducts]
  );

  useEffect(() => {
    if (open) {
      setDraft({ ...applied, page: 1 });
      setOpenGroups(['color']);
    }
  }, [open, applied]);

  const draftResultCount = useMemo(
    () => filterDiscoveryProducts(products, { ...draft, page: 1 }).length,
    [products, draft]
  );

  const draftSelectionCount = countActiveFilterSelections(draft);

  const optionViable = (probe: Partial<DiscoveryState>) =>
    filterDiscoveryProducts(products, {
      ...draft,
      ...probe,
      page: 1,
    }).length > 0;

  const applyPreset = (preset: PricePreset) => {
    setDraft((prev) => {
      if (pricePresetActive(prev, preset)) {
        return { ...prev, minPrice: null, maxPrice: null, page: 1 };
      }
      return {
        ...prev,
        minPrice: preset.minPrice,
        maxPrice: preset.maxPrice,
        page: 1,
      };
    });
  };

  const colorCount = draft.colors.length;
  const sizeCount = draft.sizes.length;
  const priceCount =
    draft.minPrice != null || draft.maxPrice != null ? 1 : 0;
  const availabilityCount = draft.availability === 'in-stock' ? 1 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex h-full w-full flex-col gap-0 border-l border-oat bg-linen p-0 text-mineral-ink shadow-none',
          'sm:max-w-[400px]',
          '[&>button]:hidden'
        )}
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only" id={titleId}>
          Filters
        </SheetTitle>
        <SheetDescription className="sr-only">
          Refine this collection by color, size, price, and availability.
        </SheetDescription>

        <header className="ca-panel-header">
          <div>
            <p className="font-body text-base font-medium text-mineral-ink">
              Filters
            </p>
            {draftSelectionCount > 0 ? (
              <p className="mt-1 font-body text-xs text-mineral-ink/50">
                {draftSelectionCount} selected
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setDraft({
                  ...EMPTY_DISCOVERY_STATE,
                  sort: draft.sort,
                  q: draft.q,
                  // Audience + category are owned by Phase 6B rails — preserve.
                  audience: draft.audience,
                  categories: draft.categories,
                })
              }
              className="min-h-11 px-3 font-body text-sm text-mineral-ink/60 underline-offset-2 hover:text-mineral-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-mineral-ink/70 hover:text-mineral-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue"
              aria-label="Close filters"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="ca-panel-body py-2">
          <AccordionPrimitive.Root
            type="multiple"
            value={openGroups}
            onValueChange={setOpenGroups}
            className="divide-y divide-oat"
          >
            {facets.colorFamilies.length > 0 ? (
              <AccordionPrimitive.Item value="color" className="border-0">
                <AccordionPrimitive.Header>
                  <AccordionPrimitive.Trigger
                    className="group flex w-full min-h-12 items-center justify-between py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
                  >
                    <GroupTrigger label="Color" count={colorCount} />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                  <div className="space-y-4 pb-4">
                    {facets.colorFamilies.map((group) => (
                      <div key={group.family}>
                        <p className="ca-eyebrow">
                          {group.family}
                        </p>
                        <div className="ca-control-row mt-2">
                          {group.colors.map((color) => {
                            const active = draft.colors.includes(color);
                            const viable =
                              active ||
                              optionViable({
                                colors: [color],
                              });
                            return (
                              <OptionChip
                                key={color}
                                active={active}
                                disabled={!viable}
                                disabledReason="No matching pieces for this color with current filters"
                                swatch={colorSwatchHex(
                                  color,
                                  facets.colorHex.get(color)
                                )}
                                onClick={() =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    colors: toggleListValue(prev.colors, color),
                                    page: 1,
                                  }))
                                }
                              >
                                {color}
                              </OptionChip>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ) : null}

            {facets.sizes.length > 0 ? (
              <AccordionPrimitive.Item value="size" className="border-0">
                <AccordionPrimitive.Header>
                  <AccordionPrimitive.Trigger
                    className="group flex w-full min-h-12 items-center justify-between py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
                  >
                    <GroupTrigger label="Size" count={sizeCount} />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                  <div className="ca-control-row pb-4">
                    {facets.sizes.map((size) => {
                      const active = draft.sizes.includes(size);
                      const viable =
                        active ||
                        optionViable({
                          sizes: [size],
                        });
                      return (
                        <OptionChip
                          key={size}
                          active={active}
                          disabled={!viable}
                          disabledReason="No matching pieces for this size with current filters"
                          onClick={() =>
                            setDraft((prev) => ({
                              ...prev,
                              sizes: toggleListValue(prev.sizes, size),
                              page: 1,
                            }))
                          }
                        >
                          {size}
                        </OptionChip>
                      );
                    })}
                  </div>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ) : null}

            <AccordionPrimitive.Item value="price" className="border-0">
              <AccordionPrimitive.Header>
                <AccordionPrimitive.Trigger
                  className="group flex w-full min-h-12 items-center justify-between py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
                >
                  <GroupTrigger label="Price" count={priceCount} />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                <div className="pb-4">
                  <div className="ca-control-row">
                    {facets.pricePresets.map((preset) => {
                      const active = pricePresetActive(draft, preset);
                      const viable =
                        active ||
                        optionViable({
                          minPrice: preset.minPrice,
                          maxPrice: preset.maxPrice,
                        });
                      return (
                        <OptionChip
                          key={preset.id}
                          active={active}
                          disabled={!viable}
                          disabledReason="No matching pieces in this price range"
                          onClick={() => applyPreset(preset)}
                        >
                          {preset.label}
                        </OptionChip>
                      );
                    })}
                  </div>
                  {facets.priceRangeDollars.max > 0 ? (
                    <p className="mt-2 font-body text-xs text-mineral-ink/45">
                      Catalog from ${facets.priceRangeDollars.min}–$
                      {facets.priceRangeDollars.max} (display snapshots)
                    </p>
                  ) : null}
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>

            <AccordionPrimitive.Item value="availability" className="border-0">
              <AccordionPrimitive.Header>
                <AccordionPrimitive.Trigger
                  className="group flex w-full min-h-12 items-center justify-between py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen"
                >
                  <GroupTrigger label="Availability" count={availabilityCount} />
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:animate-none">
                <div className="ca-control-row pb-4">
                  <OptionChip
                    active={draft.availability === 'all'}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        availability: 'all',
                        page: 1,
                      }))
                    }
                  >
                    All products
                  </OptionChip>
                  <OptionChip
                    active={draft.availability === 'in-stock'}
                    onClick={() =>
                      setDraft((prev) => ({
                        ...prev,
                        availability: 'in-stock',
                        page: 1,
                      }))
                    }
                  >
                    In stock
                  </OptionChip>
                </div>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          </AccordionPrimitive.Root>
        </div>

        <footer
          className={cn(
            'ca-panel-footer bg-[color-mix(in_srgb,var(--ca-linen)_75%,var(--ca-oat))]'
          )}
        >
          <button
            type="button"
            className={cn(
              'ca-btn-primary w-full justify-center',
              '!rounded-[6px]'
            )}
            onClick={() => {
              onApply({ ...draft, page: 1 });
              onOpenChange(false);
            }}
          >
            Show {draftResultCount}{' '}
            {draftResultCount === 1 ? 'piece' : 'pieces'}
          </button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
