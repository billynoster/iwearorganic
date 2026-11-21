# Project Design Document

## 1. Overview
Central design document for I Wear Organic (`iwearorganic.com`), adapted from the Blend America Coastal Analog shop shell. Phase 1–2 rebuilds the storefront frontend as **Coastal Analog** editorial commerce under the locked creative direction **Option B — Bold Editorial**, while retaining compatible backend services (Firebase, Printify, Stripe via Next.js API routes).

**Visual source of truth:** `/cursor/stores/self/docs/option-b-bold-editorial-mockup.png`  
**Master prompt:** `/cursor/stores/self/docs/option-b-master-prompt.md`

## 2. Tech Stack
*   **Framework**: Next.js (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Coastal Analog tokens (`src/styles/tokens.css`)
*   **UI Components**: shadcn/ui (legacy routes) + Option B coastal components (`src/components/coastal/*`)
*   **Service interfaces**: `src/services/*`
*   **Database & Storage**: Firebase (Firestore, Firebase Storage)
*   **Integrations**: Printify, Stripe Checkout
*   **Hosting**: Firebase App Hosting (`apphosting.yaml`)

## 3. Visual Identity — Coastal Analog 3.2 × Option B
*   **Concept**: The Quiet Editorial × The Living Lookbook
*   **Campaign**: The Art of Everyday.
*   **Tagline**: Easy to wear. Hard to overlook.
*   **Typography** (Phase 8A consolidation — three families only):
    *   **Instrument Serif** — editorial headlines, campaigns, Lookbook storytelling, selective italic accents (`.ca-editorial-display`, `.ca-editorial`). Home: Made for the Moment. / Everyday Uniform / In Motion / Worn Your Way / App Store. Lookbook landing + Style Edit heroes. About chapter/hero clamps may exceed `--text-hero` intentionally.
    *   **DM Sans** (400/500/600/700) — primary functional font for **all** commerce headings, product titles, prices, nav, buttons, labels, body, checkout (`.ca-display`, `.ca-heading`, `.ca-product-title`, `.ca-lede`, `.ca-eyebrow`, …). Legacy `font-display` / `font-headline` aliases map here.
    *   **Outfit** (700) — brand wordmark `i wear organic.` only (`--font-brand`).
    *   **Archivo removed** (Phase 8A) — do not reintroduce.
    *   **Hierarchy roles** (prefer shared utilities):
        *   **editorial display** — Instrument + `.text-hero` / `.text-editorial*` (campaign / storytelling only)
        *   **functional display** — DM Sans `.ca-display` / `.ca-heading` + `.text-collection` / `.text-h2` / `.text-h3` / `.text-pdp-title` (never `.text-hero`)
        *   **title** — `.ca-product-title`; PDP H1 `.ca-display.text-pdp-title`
        *   **body** — `.ca-lede`
        *   **label** — `.ca-eyebrow`, `.ca-field-label`, `.ca-btn-*`
        *   **meta** — `.ca-meta`, `.ca-caption`
    *   Fluid scale: `--text-hero` (44–88 editorial only), `--text-editorial` (42–72), `--text-editorial-section` (32–48), `--text-editorial-promo` (32–48), `--text-collection` (32–56 functional page H1), `--text-h2` (28–44), `--text-pdp-title` (26–36), `--text-product` / `--text-body` (16–18).
    *   PDP color UX: circular swatches (`--ca-swatch-size` ~30px) with catalog/known-name hex only.
*   **Color Palette**:
    *   Linen `#F4F1EB` · Oat `#DDD4C9` · Dusk Rose `#BFA4A1` · Haze Blue `#91A7AF` · Mineral Ink `#303435`
*   **Do not** reintroduce Heritage Crimson / Obsidian Indigo as brand colors.
*   **Homepage**: Match Option B section order, copy, composition, and art-directed desktop (1440) / mobile (390) layouts. Not a generic ecommerce template.

## 4. Homepage section order (locked — Phase 6C)
1. Editorial Navigation  
2. Cinematic Hero — *Made for the Moment.* + **Shop the Collection**  
3. Category Discovery — Menswear / Womenswear / New Arrivals  
4. The Everyday Uniform product gallery (4 curated + Shop all)  
5. Living Lookbook / In Motion — *Not just worn. Lived in.* → Lookbook edit  
6. Worn Your Way — *The Style Edit* (asymmetric shoppable looks)  
7. App Store Signature — compact badge promo (no iOS screenshots)  
8. Editorial Footer — tagline *Easy to wear. Hard to overlook.*

**Removed from homepage:** Just dropped strip (Phase 6C — duplicated Everyday Uniform). `/new-arrivals` and data-driven **New** badges remain.  
Out of Office is no longer a homepage section (draft Style Edit may remain unpublished under `/lookbook`).

## 5. Architecture notes
*   Secrets stay server-side. Do not trust client prices. Do not alter production Stripe webhooks.
*   Fixtures in `src/services/fixtures.ts` are development-only — never production inventory/pricing; do not hardcode mockup sample prices as live truth.
*   `/` = Option B homepage; `/shopping` = catalog (moved from former homepage).
*   `/lookbook` + `/lookbook/[slug]` = Style Edit lookbook (Journal retired; `/journal` redirects). Content: `src/content/lookbook-edits.ts`. Draft edits are not public.
*   `/about` = Phase 6 brand heritage editorial (Chicago 1997 → ecommerce 1998 → today). Instrument Serif chapter headlines; About stays in footer Support only (not primary nav). Spec: `/cursor/stores/self/docs/about-page-phase-6-prompt.md`. Do not present contemporary campaign photos as archival.

## 6. Mobile & Native
*   iOS App Store ID `6811465301`; official badge via `AppStoreBadge` / `APP_STORE_URL`. Homepage App Store Signature is compact (no device mockups). `ios-app-preview.png` retained in assets for future Coastal Analog app UI.

## 7. Optional customer accounts
*   Sign in is **optional** — guest browsing and guest checkout remain primary; never force signup.
*   One `/login` entry (Google, Apple, email link / passwordless). No separate Sign up.
*   After sign-in the storefront looks the same; nav shows a subtle name/avatar + Account menu (Orders, Addresses, Profile/Account, Sign out).
*   Account routes: `/account`, `/account/profile`, `/account/orders`, `/account/addresses`. Wishlist / early access stay out of scope.
*   Profile (`/account/profile`): editable full name, email, phone. Name + phone persist on Firestore `/users/{uid}`; name also updates Auth `displayName`. Email changes use Firebase `verifyBeforeUpdateEmail` (confirm link) — never a silent Auth email swap. Phone is a profile field only (not SMS MFA).
*   Email-link users: ignore leftover Auth/console `displayName` until the customer saves a name (`hasChosenName`); nav falls back to email local-part.
*   Firebase Auth + Firestore `/users/{uid}` (incl. `addresses`, `phone`, `hasChosenName`) and `/orders` where `userId == uid`.

## 8. Ongoing Evolution
Update this file when structural or thematic changes land. Next: live catalog wiring, server-side price revalidation, approved photography, staging payment smoke tests (non-production).
