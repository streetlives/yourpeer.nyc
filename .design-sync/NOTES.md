# design-sync notes: yourpeer.nyc-nextjs

Claude Design project: "YourPeer NYC Design System" (`projectId` in config.json).
First sync: 2026-10-06, from `main` @ 470a57a. 22 components, all with authored previews graded good.

## How this repo is synced (it is an app, not a package)

- There's no `dist/` and no `.d.ts`. `.design-sync/entry.ts` is a curated barrel that re-exports the app's own reusable components. Add a component by adding it there **and** to `cfg.componentSrcMap`.
- Data-bound pieces (map, filters, search, reviews, location detail) are deliberately excluded: they need react-query, zustand, Google Maps and Next routing.
- `YouAreNotAlone` is excluded because it loads `/img/icons/unity-icon.svg` (a site-relative public asset), which doesn't exist in Claude Design.
- Props contracts are hand-written in `cfg.dtsPropsFor`, because the converter only reads shipped `.d.ts` and there are none. **When a component's props change in `src/`, update its `dtsPropsFor` entry.**
- Usage docs and card groups come from `.design-sync/docs/<Name>.md` (frontmatter `category`). `LocationDetailLoadingSkeleton` stays in group `location-detail` (from its source folder).
- `YourPeerProvider` (`.design-sync/YourPeerProvider.tsx`) is sync-only glue. It supplies `LanguageTranslationContext` with `en|en`, because the app's `LanguageTranslationProvider` needs `next-client-cookies`.

## Build quirks (each cost a debugging cycle)

- **Node 24** is pinned (`engines.node`). This machine's PATH puts Node 26 first, so run with `PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`. `nvm use` alone did not take effect in the agent shell.
- npm 11 blocks install scripts. The `esbuild` binary still works; `sharp` and others don't matter here.
- **Node built-in `assert`** is imported by `src/components/common.ts` and `use-translated-text-hook.tsx`. Next.js polyfills it; esbuild doesn't. It's mapped to `.design-sync/shims/assert.ts` through `.design-sync/tsconfig.json` `paths` (`cfg.tsconfig`).
- The converter strips comments from tsconfig with a regex. In `.design-sync/tsconfig.json`, never add a `"//"` key or any string containing `**/` (such as `include` globs): `"@/*"` opens a fake block comment and `**/` closes it, which silently drops `paths`.
- **`process is not defined`**: Next inlines `process.env.*` at build time. `.design-sync/shims/process-env.ts` is imported first in `entry.ts` to define `globalThis.process`.
- **CSS** is the app's Tailwind build. `cfg.buildCmd` compiles `.design-sync/styles.input.css` (Google Fonts Inter `@import` + `src/app/globals.css`) with `.design-sync/tailwind.config.ts`. That config extends the repo config, scans `src/`, `.design-sync/*.tsx` and previews, and adds a safelist of brand-color and layout utilities so designs can use them. **Run `buildCmd` before `package-build.mjs`**; the output goes to the gitignored `.design-sync/.cache/yourpeer.css`.
- Inter loads at runtime from Google Fonts (`[FONT_REMOTE]`), the same family the app gets via `next/font`.
- Playwright: install `playwright@1.63.0` into `.ds-sync/`; it matches the cached chromium-1243 in `~/Library/Caches/ms-playwright`.

## Re-sync commands

```sh
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm ci
npx tailwindcss -c .design-sync/tailwind.config.ts -i .design-sync/styles.input.css -o .design-sync/.cache/yourpeer.css
node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules \
  --entry ./.design-sync/entry.ts --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json
```

## Known render warns

- None after authoring. (Before authoring, the icon floor cards flagged `[RENDER_THIN]` and Badge `[RENDER_BLANK]`.)

## Re-sync risks

- `dtsPropsFor` is hand-copied from source; it goes stale silently if a shadcn component is regenerated or props change.
- `docs/*.md` describe visuals (radii, colors, Footer columns, MultiSelect behavior) from the current source. Re-check them after UI changes.
- The safelist in `.design-sync/tailwind.config.ts` hardcodes brand color names from `tailwind.config.ts`. A new or renamed theme color won't be safelisted.
- The `assert` and `process` shims assume no other Node built-ins or `process.*` reads are reachable from the entry. A new import could reintroduce `[UNRESOLVED_IMPORT]` or a runtime `process` error.
- `next/link` is bundled and renders outside a Next router (Footer). A Next.js major upgrade could change that.
- The bundle includes ~60 npm packages (952 KB), largely Next client internals pulled in by `next/link`.
