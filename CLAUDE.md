# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

YourPeer.nyc is a Next.js app that lets users search 2600+ free support services across NYC. Developed by [Streetlives](https://www.streetlives.nyc/).

## Environment Setup

Create `.env.local` in the project root with:

```
NEXT_PUBLIC_GO_GETTA_PROD_URL=https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/Stage
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<google maps API key>
```

Other optional env vars used in the codebase: `NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY`, `NEXT_PUBLIC_DONATION_BANNER`, `NEXT_PUBLIC_DISABLE_FEEDBACK`, `NEXT_PUBLIC_GT_PROD_GUARD`, `NEXT_PUBLIC_BASE_PATH`.

## Commands

```bash
npm run dev          # Start dev server (Turbopack) on port 3000
npm run build        # Production build
npm run lint         # ESLint
npm run check-types  # TypeScript type check
npm run format       # Prettier format (writes)
npm run all-checks   # Format check + type check + lint

# Tests
npm test                    # Playwright e2e tests (requires dev server + mock server)
npm run test:unit           # Vitest unit tests (watch mode)
npm run test:unit:run       # Vitest unit tests (single run)
npx vitest run <file>       # Run a single unit test file
npx playwright test <file>  # Run a single e2e test file

npm run check-translations  # Check translation coverage
```

E2e tests spin up two servers automatically: the Next.js app (port 3000) and a mock API server (`tests/support/mock-server.ts`, port 4000). The mock server proxies `NEXT_PUBLIC_GO_GETTA_PROD_URL` so tests don't hit the real API.

## Architecture

### Routing

The app uses a single dynamic segment `src/app/[route]/` for all main pages. The `route` param is either a **resource route** (service category like `food`, `shelters-housing`, `health-care`, etc.) or a **company route** (static pages like `about-us`, `contact-us`, `donate`). This split is handled in `src/app/[route]/layout.tsx` using `RESOURCE_ROUTES` and `COMPANY_ROUTES` from `src/components/common.ts`.

Resource routes use **parallel routes** (`@mapContainer` and `@sidePanel`) to render the map and list/detail panel simultaneously. A nested `[locationSlugOrPersonalCareSubCategory]` segment handles both location detail pages and personal-care subcategory filtering within each parallel slot.

### Data Flow

- **API client**: `src/components/streetlives-api-service.ts` — all calls to the Go Getta backend (`NEXT_PUBLIC_GO_GETTA_PROD_URL`). Types and category/route mappings live in `src/components/common.ts`.
- **Server components** fetch data directly via the API service; client components use TanStack Query for client-side fetching.
- **Global state**: Zustand stores in `src/lib/store.ts` — `useFilters` (filter panel open/loading state) and `useViewStore` (map vs. list toggle, persisted to localStorage).

### Key Concepts

- **Categories vs. routes**: The backend uses taxonomy category names (e.g. `shelters-housing`) while URL routes may differ (e.g. `other` → `other-services`). `CATEGORY_TO_ROUTE_MAP` / `ROUTE_TO_CATEGORY_MAP` in `common.ts` handle the mapping.
- **Translation**: Google Translate integration via `gtranslate-wrapper.tsx`. Language state is tracked in `LanguageTranslationContext` using the `googtrans` cookie. Static translated content (French, Russian) lives in `src/components/translations/`.
- **Auth**: AWS Amplify (`src/amplify/`) for user authentication; used for comment moderation features.
- **Feedback/comments**: Two API routes (`src/app/api/report/` and `src/app/api/report-comment/`) proxy to SendGrid for email notifications.

### License

Every source file must include this header:

```
// Copyright (c) 2024 Streetlives, Inc., [your name]
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.
```
