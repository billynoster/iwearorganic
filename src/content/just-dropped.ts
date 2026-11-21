/**
 * Explicit Just dropped merchandising — used only when catalog products lack
 * release-date metadata. No title/photo guessing.
 *
 * Live Printify rows with `releasedAt` (from `created_at`) take priority.
 */
export const JUST_DROPPED_MERCHANDISING_IDS = [
  'fixture-classic-tee',
  'fixture-everyday-crew',
  'fixture-heritage-crew',
  'fixture-logo-muscle-tee',
] as const;

/** Products newer than this (by releasedAt) earn a subtle “New” badge on NA. */
export const NEW_BADGE_MAX_AGE_DAYS = 45;

export const JUST_DROPPED_TAG = 'just-dropped';
