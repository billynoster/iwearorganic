const MILESTONES = [
  {
    year: '1997',
    description: 'Founded in Chicago. The journey began with beanies.',
  },
  {
    year: '1998',
    description:
      'blendamerica.com was registered. The business moved into ecommerce.',
  },
  {
    year: 'Today',
    description:
      'A contemporary apparel brand shaped by independent beginnings.',
  },
] as const;

/**
 * Restrained heritage annotations — Instrument Serif years, hairline dividers.
 * Not an interactive timeline.
 */
export function HeritageTimeline() {
  return (
    <section
      aria-labelledby="heritage-timeline-heading"
      className="border-t border-oat/70 bg-linen"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <h2 id="heritage-timeline-heading" className="sr-only">
          Heritage timeline
        </h2>
        <ol className="grid grid-cols-1 gap-0 md:grid-cols-3">
          {MILESTONES.map((milestone, index) => (
            <li
              key={milestone.year}
              className={
                index > 0
                  ? 'border-t border-oat pt-8 md:border-l md:border-t-0 md:pt-0 md:pl-8 lg:pl-10'
                  : ''
              }
            >
              <p className="font-editorial text-[clamp(2.5rem,2rem+1.5vw,3.5rem)] leading-none tracking-[-0.02em] text-mineral-ink">
                {milestone.year}
              </p>
              <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-mineral-ink/65 md:text-[0.9375rem]">
                {milestone.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
