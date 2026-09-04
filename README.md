<p align="center">
  <a href="https://yourpeer.nyc"><img alt="YourPeer Logo" src="./public/img/fabicon.png" /></a>
</p>

This repository contains the source code to [YourPeer.nyc](https://yourpeer.nyc)

YourPeer.nyc allows users to search through 2600+ free support services across NYC.

YourPeer.nyc is developed by [Streetlives](https://www.streetlives.nyc/), a US nonprofit based in New York City.

# Getting started

YourPeer.nyc is a [Next.js](https://nextjs.org/) app.

Create a `.env.local` in your project root directory. It should contain the following entries:

```
NEXT_PUBLIC_GO_GETTA_PROD_URL=https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/Stage
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<insert a google maps API key here or contact us to get a development key>
```

## Feature flags

`AI_SEARCH_ENABLED` controls the experimental AI search ("AI mode") feature. It
is **off unless explicitly set to `true`**, so production deploys that do not
define it get the regular keyword search: the AI mode toggle is not rendered, and
an `aiSearch=true` URL param is ignored. To work on the feature locally, add this
to `.env.local`:

```
AI_SEARCH_ENABLED=true
```

Note the deliberate absence of a `NEXT_PUBLIC_` prefix. Next.js inlines
`NEXT_PUBLIC_` variables into the compiled output at build time — in server
components as well as client ones — so such a flag can only be changed by
rebuilding, and a build/runtime mismatch makes the server and the browser
disagree (the toggle renders server-side, then vanishes on hydration).
`AI_SEARCH_ENABLED` is read from the real environment on every request, so
changing it takes effect on restart.

It is read on the server only. Server code calls `isAiSearchEnabled()`; the value
reaches client components through `AiSearchEnabledProvider` in the root layout,
which they consume with `useAiSearchEnabled()`. Client components must never read
the flag from `process.env` directly.

Then run:

```
# npm install
# npm run build
# npm run dev
```

# Contributing

Please open a pull request. Ensure that each source file includes the correct license header template, like this:

```
Copyright (c) 2024 Streetlives, Inc., [your name]

Use of this source code is governed by an MIT-style
license that can be found in the LICENSE file or at
https://opensource.org/licenses/MIT.
```
