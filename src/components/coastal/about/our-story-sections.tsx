import Link from 'next/link';

const SECTIONS = [
  {
    id: 'fashion-first',
    title: 'Fashion First',
    paragraphs: [
      'We believe clothing should be desirable before anything else.',
      'It should fit well.',
      'Feel good.',
      'Look modern.',
      'And become something you actually want to wear again and again.',
      'Organic materials are part of that experience — not a separate story layered on top of it.',
    ],
  },
  {
    id: 'everyday',
    title: 'Made for Everyday Life',
    paragraphs: [
      'I Wear Organic is designed around the pieces people reach for most:',
      'soft hoodies, comfortable layers, everyday tees, relaxed essentials, and clothing that moves easily between home, work, travel, weekends, and everything in between.',
      'We focus on clean silhouettes, comfortable construction, natural color, and simple details that make each piece easy to live in.',
    ],
  },
  {
    id: 'materials',
    title: 'Better Starts with the Material',
    paragraphs: [
      'What touches your skin matters.',
      "That's why materials are central to how we think about every product.",
      'We prioritize organic fibers and carefully selected supporting materials while keeping the clothing practical, comfortable, and wearable.',
      "You'll always find material information clearly presented on each product page.",
      'No digging.',
      'No vague language.',
    ],
  },
  {
    id: 'less-noise',
    title: 'Less Noise. Better Choices.',
    paragraphs: [
      "We don't believe better clothing needs to come with complicated messaging.",
      'Our approach is simple:',
      'Make thoughtful clothing.',
      'Use better materials.',
      "Be clear about what's in each product.",
      'Design it to be worn.',
      "That's I Wear Organic.",
    ],
  },
] as const;

/**
 * Our Story body — Brand Kit v1.4 voice.
 * One job per section; no numbered magazine labels.
 */
export function OurStorySections() {
  return (
    <div className="bg-white">
      <section
        aria-labelledby="our-story-intro-heading"
        className="border-b border-oat/70"
      >
        <div className="ca-container py-14 sm:py-16 md:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 id="our-story-intro-heading" className="sr-only">
              Why I Wear Organic
            </h2>
            <p className="ca-lede text-lg text-mineral-ink sm:text-xl">
              I Wear Organic was created around a simple idea:
            </p>
            <p className="ca-editorial-display mt-6 text-editorial-section text-mineral-ink">
              Organic shouldn&apos;t be a special collection. It should be the
              standard.
            </p>
            <div className="ca-lede mt-8 space-y-5">
              <p>
                Too often, better materials are treated as an upgrade, a limited
                capsule, or something you have to search for. We wanted to build
                a clothing brand where that choice was already made for you.
              </p>
              <p>
                At I Wear Organic, every piece begins with a focus on organic
                materials, everyday comfort, and thoughtful design.
              </p>
              <p>
                The result is clothing made to feel easy, modern, and natural
                from the moment you put it on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          className="border-b border-oat/70 last:border-b-0"
        >
          <div className="ca-container py-14 sm:py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <h2
                id={`${section.id}-heading`}
                className="ca-editorial-display text-editorial-section text-mineral-ink"
              >
                {section.title}
              </h2>
              <div className="ca-lede mt-6 space-y-4 sm:mt-8">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.id === 'materials' ? (
                <div className="mt-8">
                  <Link href="/shopping" className="ca-text-link">
                    Shop the collection
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
