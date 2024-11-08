<p align="center">
  <a href="https://yourpeer.nyc"><img alt="YourPeer Logo" src="https://streetlives-v2-dev-static.s3.amazonaws.com/fabicon.png" /></a>
</p>

This repository contains the source code to [YourPeer.nyc](https://yourpeer.nyc)

YourPeer.nyc allows users to search through 2500+ free support services across NYC.

YourPeer.nyc is developed by [Streetlives](https://www.streetlives.nyc/), a US nonprofit based in New York City.

# Getting started

YourPeer.nyc is a [Next.js](https://nextjs.org/) app.

Create a `.env.local` in your project root directory. It should contain the following entries:

```
NEXT_PUBLIC_GO_GETTA_PROD_URL=https://w6pkliozjh.execute-api.us-east-1.amazonaws.com/Stage
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<insert a google maps API key here or contact us to get a development key>
```

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
