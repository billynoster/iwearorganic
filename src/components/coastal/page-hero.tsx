interface PageHeroProps {
  eyebrow?: string;
  /**
   * Collection landings — Manrope Medium at `--text-collection` (brand kit v1.4).
   */
  editorial?: boolean;
  title: string;
  description?: string;
  /**
   * Quiet right-column copy on desktop — Soft Minimal support line.
   * Hidden on small screens so the hero stays one job.
   */
  aside?: string;
}

export function PageHero({
  eyebrow,
  editorial = false,
  title,
  description,
  aside,
}: PageHeroProps) {
  return (
    <header className="border-b border-oat/70 bg-cotton">
      <div className="ca-container py-12 sm:py-16 md:py-20">
        <div
          className={
            aside
              ? 'grid gap-10 md:grid-cols-12 md:items-end md:gap-12'
              : undefined
          }
        >
          <div className={aside ? 'md:col-span-7 lg:col-span-6' : undefined}>
            {eyebrow ? <p className="ca-eyebrow mb-3">{eyebrow}</p> : null}
            <h1
              className={
                editorial
                  ? 'ca-display text-collection font-medium'
                  : 'ca-heading text-h3'
              }
            >
              {title}
            </h1>
            {description ? (
              <p className="ca-lede mt-4 max-w-xl sm:mt-5">{description}</p>
            ) : null}
          </div>

          {aside ? (
            <aside className="hidden md:col-span-5 md:block md:pb-1 lg:col-span-5 lg:col-start-8">
              <p className="ca-lede max-w-sm text-mineral-ink/70 md:ml-auto md:text-right">
                {aside}
              </p>
            </aside>
          ) : null}
        </div>
      </div>
    </header>
  );
}
