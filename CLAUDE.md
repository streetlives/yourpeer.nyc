# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

YourPeer.nyc is a Next.js web application for discovering 2,600+ free support services across NYC, built by [Streetlives](https://streetlives.nyc/). Users can search and filter services by category (shelters, food, clothing, healthcare, etc.) and view details on a Google Maps interface.

## Commands

```bash
# Development
npm run dev           # Start dev server with Turbopack
npm run build         # Production build
npm run start         # Start production server

# Code Quality (run all at once with npm run all-checks)
npm run lint          # ESLint
npm run check-types   # TypeScript (tsc --noEmit)
npm run check-format  # Prettier check
npm run format        # Prettier auto-fix
npm run check-translations  # Verify i18n translation keys

# Testing
npx playwright test               # Run all E2E tests
npx playwright test tests/foo.spec.ts  # Run a single test file
npx playwright test --ui          # Open Playwright UI
```

CI runs `check-types`, `check-format`, `lint`, and `check-translations` on every PR.

## Architecture

### Routing (Next.js App Router)

The main URL structure is `/{category}` (e.g., `/shelters-housing`, `/food`, `/health-care`). Each category page uses **parallel routes** via Next.js intercepting route patterns:

```
src/app/[route]/
  @mapContainer/    # Google Maps panel
  @sidePanel/       # Results list panel
  @staticPage/      # Static content (about, etc.)
  layout.tsx        # Assembles the three panels
```

Location details are rendered as intercepted routes (modal-style overlay) at `/{category}/{locationSlug}`.

Valid categories are defined in `src/components/streetlives-api-service.ts` as `YourPeerCategory`.

### Data Flow

1. **Go-Getta API** is the primary backend (`NEXT_PUBLIC_GO_GETTA_PROD_URL`). All service/location data comes from here via `src/lib/streetlives-api-service.ts`.
2. **React Query** (`@tanstack/react-query`) manages server state for location lists, details, comments, and taxonomy.
3. **Zustand** manages client state — `useFilters` (filter panel + search state) and `useViewStore` (map/list toggle, persisted to localStorage).
4. URL search params are the source of truth for active filters; the `useFilters` store syncs with them.

### Key Files

- `src/lib/streetlives-api-service.ts` — All API calls to Go-Getta; start here for data questions
- `src/lib/store.ts` — Zustand stores (`useFilters`, `useViewStore`)
- `src/components/use-location-data.ts` — Main React Query hook for location list
- `src/app/[route]/layout.tsx` — Parallel route assembly
- `src/components/map/` — Google Maps integration via `@vis.gl/react-google-maps`

### Testing

Tests live in `tests/` and use Playwright. A **mock API server** runs on port 4000 during tests (see `tests/mock-server/`); fixtures are in `tests/fixtures/`. The mock server intercepts Go-Getta API calls so tests don't need a real backend.

To add tests, follow the pattern in existing spec files — they use `page.goto()` with the mock server's base URL.

### Translation

Uses Google Translate API. Wrap user-visible strings in `<TranslatableText>` from `src/components/language-translation-provider.tsx`. Run `npm run check-translations` to validate all keys are present.

### Environment Variables

```
NEXT_PUBLIC_GO_GETTA_PROD_URL       # Backend API (local: http://localhost:3001)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY     # Google Maps
NEXT_PUBLIC_GOOGLE_CAPTCHA_SITE_KEY # reCAPTCHA v3
NEXT_PUBLIC_GOOGLE_TAG_MANAGER_API_KEY
GOOGLE_ANALYTICS_MEASUREMENT_ID
SLACK_WEBHOOK_URL                   # Report notifications → Slack
```

### Styling Conventions

- Tailwind CSS for all styling; use `clsx`/`tailwind-merge` via `cn()` from `src/lib/utils.ts` for conditional classes.
- Radix UI for accessible primitives (dialogs, dropdowns, popovers).
- Framer Motion for animations.
- Component variants use `class-variance-authority`.

### Dependency updates

Dependabot version updates are configured in `.github/dependabot.yml` (npm and github-actions, weekly). `.github/workflows/auto-merge-dependency-updates.yml` merges the safe ones automatically; the policy and every gate live in `.github/scripts/auto-merge-dependency-updates.js`, covered by `tests/unit/auto-merge-dependency-updates.test.ts`.

A pull request merges automatically only when it is authored by Dependabot (or is a `snyk-fix-*`/`snyk-upgrade-*` branch **from an account in `SNYK_AUTHORS`** — Snyk opens pull requests through a connected user account, so the branch name is a convention, not an identity), touches nothing but `package.json`/`package-lock.json` (or `.github/workflows/` for action bumps), has no `do-not-merge`/`blocked`/`on-hold` label and no human change-request, and every required check — `check-types`, `check-format`, `check-lint`, `check-translations`, `Unit Tests`, `E2E Tests` — has passed. Size limits: patch and minor for `devDependencies`, patch only for production and transitive dependencies, and a pre-1.0 minor bump counts as major. Everything else waits for a human.

The diff is checked by content, not just by file name: every dependency range that moved must match an update the pull request declares, nothing outside the dependency lists may change (`scripts`, `overrides`, `engines`), and the lockfile may not newly resolve a package from outside the npm registry or swap an integrity hash on a version it left alone. The size policy is then applied to the versions **in the diff** — both ends of every manifest change, typed by the field it sits in, and every lockfile version change, typed from the manifest for direct packages and from npm's `dev` flag otherwise — never to the versions the commit trailer or the title claims. An undeclared major upgrade therefore cannot ride along inside a patch-sized pull request. A lockfile entry may not swap tarballs while keeping its version, and every changed `resolved` URL must be that package at that version, so one registry package cannot be substituted for another. Action bumps are checked the same way: a workflow diff may only rewrite `uses:` references of actions the pull request declares — any other edit, a changed `run:` command above all, stops the merge — and those references are held to patch and minor. The merge is pinned to the commit that was evaluated, so a commit pushed afterwards cannot inherit the earlier commit's green checks.

`codex_auto_approve` is advisory here: Dependabot runs get Dependabot secrets rather than Actions secrets, so `OPENAI_API_KEY` is empty and that job always fails on bot pull requests. CI plus the size policy is the gate instead.

To try a change to the policy without merging anything, run the workflow manually with **Report decisions without merging** checked (`dry_run`), optionally narrowed to one pull request number.
