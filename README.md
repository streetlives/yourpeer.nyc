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
NEXT_PUBLIC_DATADOG_APPLICATION_ID=<required for Browser RUM>
NEXT_PUBLIC_DATADOG_CLIENT_TOKEN=<required for Browser RUM>
NEXT_PUBLIC_DATADOG_SITE=datadoghq.com
NEXT_PUBLIC_DATADOG_SERVICE=yourpeer-frontend
NEXT_PUBLIC_DATADOG_ENV=production
NEXT_PUBLIC_DATADOG_VERSION=<set to release/version identifier>
NEXT_PUBLIC_DATADOG_APP_NAME=yourpeer.nyc
NEXT_PUBLIC_DATADOG_TRACING_ORIGINS=https://yourpeer.nyc,https://<api-gateway-domain>
NEXT_PUBLIC_DATADOG_ENABLED=false
NEXT_PUBLIC_DATADOG_REQUIRE_CONSENT=true
NEXT_PUBLIC_DATADOG_CONSENT_COOKIE_NAME=analytics_consent
NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE=100
NEXT_PUBLIC_DATADOG_SESSION_REPLAY_ENABLED=false
NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE=0
```

Datadog Browser RUM only initializes in the browser and is a no-op unless all of the following are true: `NEXT_PUBLIC_DATADOG_ENABLED=true`, required Datadog tokens are present, and consent is granted when `NEXT_PUBLIC_DATADOG_REQUIRE_CONSENT=true` (read from `NEXT_PUBLIC_DATADOG_CONSENT_COOKIE_NAME`).

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
