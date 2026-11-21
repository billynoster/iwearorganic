# I Wear Organic

Next.js storefront for **[iwearorganic.com](https://iwearorganic.com)** — guest checkout, Printify catalog, Stripe payments, Firebase App Hosting / Firestore.

Cloned from the Blend America shop stack (`billynoster/oldglory`) as a **new** repo (not a fork). Printify, Stripe, and Firebase are **not** wired yet — use placeholders and local mocks until credentials are ready.

## Local run

```bash
npm install
cp .env.example .env.local   # fill what you have; leave the rest blank for mock/fixture mode
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Printify / Stripe / Firebase secrets, the shop shell still runs: catalog falls back to **development fixtures** (`ALLOW_CATALOG_FIXTURES` defaults on outside production). Checkout and live webhooks will fail until those secrets are set.

Useful scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js on `0.0.0.0:3000` |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | TypeScript check |
| `npm run feed:chatgpt` | Build ChatGPT product feed CSV (needs Printify or fixtures) |

## Secrets checklist

Keep these **names**; values come from tonight’s Printify / Stripe / Firebase setup (or Firebase App Hosting secret bindings). Do **not** commit real values — `.env*` is gitignored.

### Printify

| Variable | Notes |
| --- | --- |
| `PRINTIFY_API_TOKEN` or `PRINTIFY_API_KEY` | Shop API token |
| *(shop id)* | Resolved via Printify API when token is present |

### Stripe

| Variable | Notes |
| --- | --- |
| `STRIPE_SECRET_KEY` | Prefer `sk_test_*` until go-live |
| `STRIPE_WEBHOOK_SECRET` | `whsec_*` for `/api/webhook/stripe` |
| `NEXT_PUBLIC_BASE_URL` | Public site URL (e.g. `https://iwearorganic.com`) |
| `ALLOW_LIVE_STRIPE_CHECKOUT` | Must be `true` only when intentionally using `sk_live_*` |

### Firebase (isolated project — do not reuse Blend)

| Variable | Notes |
| --- | --- |
| Client config | Fill `firebase-applet-config.json` + `.firebaserc` after creating the new project |
| `FIREBASE_SERVICE_ACCOUNT_KEY` or `FIREBASE_SERVICE_ACCOUNT_KEY_FILE` | Admin JSON path or one-line JSON (guest checkout / webhooks) |
| `FIREBASE_FIRESTORE_DATABASE_ID` | Named DB id (must match client `firestoreDatabaseId`) |
| `FIREBASE_PROJECT_ID` | Optional override |
| `GOOGLE_APPLICATION_CREDENTIALS` | Alternate Admin credential path |

Committed Firebase config currently uses **placeholders** (`YOUR_FIREBASE_*`). Replace when the new project exists. App Hosting can also inject client config at runtime via `initializeApp()` with no args.

### Optional / local

| Variable | Notes |
| --- | --- |
| `ALLOW_CATALOG_FIXTURES` | `true`/`false` — fixture catalog when Printify is missing |
| `NEXT_PUBLIC_APP_ENV` | Set `production` to disable local-only auth previews |

## Domain / hosting (deferred)

- **DNS:** iwearorganic.com parked on Cloudflare — point to Firebase App Hosting tonight.
- **Brand kit / Printify shop / Stripe / Firebase project:** not in this import; placeholders only.

## License

See `LICENSE`.
