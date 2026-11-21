'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  categoryLabel,
  isCategoryId,
  type CategoryId,
} from '@/lib/category-taxonomy';

export interface CategoryRailOption {
  id: CategoryId;
  label: string;
}

interface CategoryRailProps {
  /** Uppercase eyebrow, e.g. EXPLORE WOMENSWEAR */
  eyebrow: string;
  categories: CategoryRailOption[];
  /** Active stable category ID, or null for All */
  selectedId: string | null;
  onSelect: (id: CategoryId | null) => void;
}

/**
 * Phase 6B shared category navigation rail — Coastal Analog pill chips.
 * Single-select; All is the default. Horizontal scroll on mobile.
 * Deep-linked `?category=` IDs stay visible even when the catalog slice is empty.
 */
export function CategoryRail({
  eyebrow,
  categories,
  selectedId,
  onSelect,
}: CategoryRailProps) {
  const options = useMemo(() => {
    if (
      selectedId &&
      isCategoryId(selectedId) &&
      !categories.some((category) => category.id === selectedId)
    ) {
      return [
        ...categories,
        { id: selectedId, label: categoryLabel(selectedId) },
      ];
    }
    return categories;
  }, [categories, selectedId]);

  // Still render when a deep link selected a category with zero matching products.
  if (!options.length && !selectedId) return null;

  const allSelected = !selectedId;

  return (
    <nav aria-label="Collection categories" className="ca-stack-tight">
      <p className="ca-eyebrow">
        {eyebrow}
      </p>
      <ul
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Filter by category"
        aria-orientation="horizontal"
      >
        <li className="shrink-0">
          <CategoryChip
            label="All"
            selected={allSelected}
            onClick={() => onSelect(null)}
          />
        </li>
        {options.map((category) => {
          const selected = selectedId === category.id;
          return (
            <li key={category.id} className="shrink-0">
              <CategoryChip
                label={category.label}
                selected={selected}
                onClick={() => onSelect(selected ? null : category.id)}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full border px-4 font-body text-sm transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
        'motion-reduce:transition-none',
        selected
          ? 'border-mineral-ink bg-mineral-ink text-linen'
          : 'border-oat bg-linen text-mineral-ink hover:border-mineral-ink/40'
      )}
    >
      {label}
    </button>
  );
}
