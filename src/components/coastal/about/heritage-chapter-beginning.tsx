import { HeritageLogoPanel } from '@/components/coastal/about/heritage-logo-panel';

const PARAGRAPHS = [
  'blend america began in Chicago in 1997 with a simple idea, a collection of beanies, and a dream of opening a clothing store.',
  'That same year, I designed the original BLEND logo—a bold, distinctive mark that would become the visual identity of the brand.',
  'Before there was an online store, there was a name, a logo, and the ambition to create something of my own.',
  'What started small would soon take an unexpected direction.',
] as const;

/**
 * Chapter 01 — Chicago, 1997.
 * Desktop: logo left / story right, vertically centered.
 * Mobile: eyebrow → heading → story → logo → caption.
 */
export function HeritageChapterBeginning() {
  return (
    <section
      id="chapter-beginning"
      aria-labelledby="chapter-beginning-heading"
      className="border-t border-oat/70 bg-linen"
    >
      <div className="ca-container py-16 sm:py-20 md:py-24">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-10 lg:gap-14">
          {/* Story — first on mobile; right column on desktop */}
          <div className="order-1 flex flex-col justify-center md:order-2 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
            <p className="ca-eyebrow mb-3 text-haze-blue">01 / The Beginning</p>
            <h2
              id="chapter-beginning-heading"
              className="ca-editorial-display max-w-[16ch] text-[clamp(2.125rem,1.55rem+2.2vw,4rem)] leading-[1.02] tracking-[-0.015em] text-mineral-ink"
            >
              Chicago, 1997.
            </h2>
            <div className="mt-6 max-w-xl space-y-5 sm:mt-7">
              {PARAGRAPHS.map((p) => (
                <p key={p.slice(0, 40)} className="ca-lede">
                  {p}
                </p>
              ))}
            </div>
          </div>

          {/* Logo — after story on mobile; left column on desktop */}
          <div className="order-2 md:order-1 md:col-span-5 lg:col-span-5">
            <HeritageLogoPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
