# Website safety warnings

YourPeer reads passive observations made by Streetli's regular website verifier.
The browser preloads cached assessments through `POST /api/website-safety`; only
the YourPeer server calls `streetliWebsiteSafety` in the `streetli` project.
The browser never receives the service credential or private verifier records.

Set `STREETLI_WEBSITE_SAFETY_TOKEN` in the YourPeer **server runtime** to the value
of the same-named Streetli Secret Manager secret. It must never have a
`NEXT_PUBLIC_` prefix or be committed. The fixed upstream endpoint is
`https://us-central1-streetli.cloudfunctions.net/streetliWebsiteSafety`.
Deploy the Streetli endpoint and updated `refreshBrokenLinksByLocation` before
enabling the frontend. Existing website cache entries acquire metadata during
normal audit passes; the endpoint can refresh already registered URLs only.
Streetli's general sweep remains weekly. Assessments expire after 24 hours, so
cached clean results can become unknown before the next scheduled sweep; an
eligible click requests a bounded refresh. Streetli's lookup index also matches
catalog URLs that already contain tracking parameters.

Both endpoints accept `{ urls: string[], refresh?: boolean }`, up to 20 URLs.
Responses contain only `results` with URL, fixed reason codes, status, timestamps,
and staleness. Cache reads return immediately. A separate refresh request performs
bounded revalidation in Streetli, with shared request budgets and per-URL leases.
Missing configuration, cache misses, or failed checks return `unknown`.

Warnings cover HTTP transport, observed HTTPS downgrades, advertised PHP versions
possibly affected by the [PHP advisory](https://www.php.net/archive/2026.php#2026-10-21-5),
and existing verifier indications of compromised content. A `.php` suffix is not
evidence of a vulnerability; version headers do not prove actual patch status.
This does not add a malware reputation subscription or a vulnerability scanner.
No known warning is a limited observation, never a safety guarantee.

The popup displays cached warnings immediately and updates stale evidence without
navigating automatically. Failed or older refreshes retain previous warnings;
fresh conclusive results may clear them. Original destinations and attribution
parameters are preserved for navigation. Only known tracking parameters and URL
fragments are excluded from assessment matching; semantic query encoding remains
unchanged.

Internal YourPeer navigation, calling/email links, and Quick Exit retain their
normal behavior. Ordinary HTTPS links without warning evidence open normally
while eligible metadata is refreshed. Executable URL schemes are rejected.
The popup supports keyboard, touch, middle-click, and modifier-key activation,
and provides an immediate Quick Exit link. Browser context menus, copied links,
and navigation with JavaScript disabled cannot be guaranteed to pass through it.

No interaction tracking is added here; analytics remain scoped separately in
[#769](https://github.com/streetlives/yourpeer.nyc/issues/769).
