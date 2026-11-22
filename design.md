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

## 3. Visual Identity — Brand Kit + Digital Style Guide v1.3
*   **Tagline**: Wear Better. Naturally.
*   **Core statement**: Organic isn’t a collection. It’s the entire store.
*   **Typography**: **Sora** only (400 / 500 / 600). No Inter / DM Serif Display as primary.
    *   Semibold (600) — headlines, section titles, logo CSS fallback
    *   Medium (500) — buttons, product titles, active nav, form labels
    *   Regular (400) — body, UI, navigation, secondary
    *   Scale: H1 48/56 · H2 32/40 · H3 24/32 · Body 16/24 · Small 14/20 (mobile H1 36–40)
*   **Color Palette**:
    *   Organic Forest `#294936` · Natural Cotton `#F6F2E8` · Pure White `#FFFFFF`
    *   Soil `#453B32` · Sage `#93A88E` · Clay `#C99467`
    *   Charcoal `#242724` · Secondary text `#686B67` · Border `#E7E8E4` · Surface `#F8F8F5`
*   **Distribution**: ~60–70% White · 15–20% Cotton · 5–10% Charcoal · 5–10% Forest · &lt;5% accents
*   **Avoid**: gradients, heavy shadows, typeface mixing, numbered homepage sections, stereotypical “eco” styling
*   **Homepage**: Brand → Shop → Why Organic → Lifestyle → App → Footer (see §4)

## 4. Homepage section order (refined — fewer sections)
1. Editorial Navigation  
2. Cinematic Hero — *Wear Better. Naturally.* + Shop Women / Shop Men (+ Why Organic?)  
3. Featured Products — *Made for Every Day.* (≈4 desktop / 2 mobile + Shop All)  
4. Brand Proposition — *Organic Isn’t a Collection. It’s the Entire Store.* → Why Organic?  
5. Editorial Lifestyle — *Naturally Your Own.* → Explore the Collection  
6. App Store Signature — compact (Shop Anywhere)  
7. Editorial Footer — tagline *Easy to wear. Hard to overlook.*

**Removed from homepage:** Collection rail, Everyday Uniform / numbered edits, Living Lookbook, Worn Your Way, Just dropped strip, Out of Office. Deeper pages keep lookbook/about storytelling.  
`/new-arrivals` and data-driven **New** badges remain on PLPs.

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
