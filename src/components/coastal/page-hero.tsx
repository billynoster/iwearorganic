interface PageHeroProps {
  eyebrow?: string;
  /**
   * Collection landings — DM Sans Bold at `--text-collection` (32–56).
   * Instrument Serif reserved for campaign / Lookbook storytelling headlines.
   */
  editorial?: boolean;
  title: string;
  description?: string;
}

export function PageHero({
  eyebrow,
  editorial = false,
  title,
  description,
}: PageHeroProps) {
  return (
    <header className="border-b border-oat/70 bg-cotton">
      <div className="ca-container py-12 sm:py-16 md:py-20">
        {eyebrow ? <p className="ca-eyebrow mb-3">{eyebrow}</p> : null}
        <h1
          className={
            editorial
              ? 'ca-display text-collection font-bold'
              : 'ca-heading text-h3'
          }
        >
          {title}
        </h1>
        {description ? (
          <p className="ca-lede mt-4 max-w-xl sm:mt-5">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
