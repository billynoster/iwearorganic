# I Wear Organic
## Brand Kit + Digital Style Guide
**Version 1.4**

Source of truth for iwearorganic.com, ecommerce UI, future iOS, marketing, and brand communications.

## Typography lock (critical)

### Logo
**Soft Minimal** Core Sans–style wordmark — use approved SVG/vector artwork only.

Do **not** recreate the logo with:
- Manrope
- Sora
- Inter
- Arial
- system fonts

Primary mark: lowercase `i wear organic` (optional `™`) in Organic Forest `#294936`.

Site implementation: `public/brand/logos/iwo-wordmark-*.svg` via `<Logo />`.

### Digital UI
**Manrope** is the primary digital typeface (400 / 500 / 600).

- Headlines: Manrope **Medium** (500)
- Body: Manrope Regular (400)
- Buttons / nav / labels: Manrope Medium (500)
- Semibold (600) only selectively

Remove Sora and Inter from the active primary system.

Optional campaign-only: Neue Haas Grotesk or Instrument Sans — never mix multiple editorial faces on a standard ecommerce page.

## Color (unchanged)

Organic Forest `#294936` · Natural Cotton `#F6F2E8` · Pure White `#FFFFFF` · Soil `#453B32` · Sage `#93A88E` · Clay `#C99467` · Charcoal `#242724` · Secondary `#686B67` · Border `#E7E8E4` · Surface `#F8F8F5`

## Homepage flow

Brand → Shop → Why Organic → Lifestyle → App → Footer

## CSS tokens

```css
:root {
  --iwo-forest: #294936;
  --iwo-cotton: #F6F2E8;
  --iwo-white: #FFFFFF;
  --iwo-soil: #453B32;
  --iwo-sage: #93A88E;
  --iwo-clay: #C99467;
  --iwo-text: #242724;
  --iwo-text-secondary: #686B67;
  --iwo-border: #E7E8E4;
  --iwo-surface: #F8F8F5;
  --font-ui: "Manrope", sans-serif;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Cursor rules (abbrev.)

1. Approved SVG for wordmark — never Manrope/Sora/Inter live text for the logo.
2. Manrope for digital UI; Medium headlines; Regular body.
3. Remove Sora from active design system.
4. Fashion-first, calm, White + Cotton dominant, Forest intentional.
5. Keep homepage section count limited.

Full paste: conversation Brand Kit v1.4 (sections 1–61).

---

# I Wear Organic

## Wear Better. Naturally.

**Organic isn’t a collection. It’s the entire store.**
