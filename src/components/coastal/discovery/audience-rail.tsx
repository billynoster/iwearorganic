'use client';

import { cn } from '@/lib/utils';
import type { DiscoveryAudience } from '@/lib/audience-taxonomy';

const AUDIENCE_OPTIONS: Array<{ id: DiscoveryAudience; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'women', label: 'Women' },
  { id: 'men', label: 'Men' },
];

interface AudienceRailProps {
  selected: DiscoveryAudience;
  onSelect: (audience: DiscoveryAudience) => void;
}

/**
 * Phase 6B New Arrivals Level 1 — All | Women | Men.
 * Audience change is handled by the parent (resets category).
 */
export function AudienceRail({ selected, onSelect }: AudienceRailProps) {
  return (
    <nav aria-label="Audience" className="ca-stack-tight">
      <p className="ca-eyebrow">
        Shop by audience
      </p>
      <ul
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="listbox"
        aria-label="Filter by audience"
        aria-orientation="horizontal"
      >
        {AUDIENCE_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <li key={option.id} className="shrink-0">
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => onSelect(option.id)}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 font-body text-sm transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-haze-blue focus-visible:ring-offset-2 focus-visible:ring-offset-linen',
                  'motion-reduce:transition-none',
                  isSelected
                    ? 'border-mineral-ink bg-mineral-ink text-linen'
                    : 'border-oat bg-linen text-mineral-ink hover:border-mineral-ink/40'
                )}
              >
                {option.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
