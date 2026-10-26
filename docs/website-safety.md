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

The browser calls YourPeer with `{ urls: string[], refresh?: boolean }`, up to 20 URLs.
The YourPeer server removes known attribution/fragment fields and computes a
SHA-256 digest of each remaining URL, including its exact semantic query.
Streetli accepts only `{ keys: string[], refresh?: boolean }` with 64-character
lowercase hex keys. No submitted URL, hostname, path or query value is forwarded
to Streetli. Streetli resolves the digest against its existing verifier registry
and returns only that key, fixed reason codes, status, timestamps and staleness;
YourPeer maps the key back to the visitor's already-known link. A digest is a
lookup identifier, not a guarantee of anonymity for guessable public URLs.
Neither server logs the request payload, URL or query; the browser keeps its
cache in memory only. The bounded server cache holds at most 1,000 digests and
their metadata, with a 60-second fresh response TTL and retained warnings as a
conservative fallback. Raw URLs are not retained in that server cache or its
refresh throttles. Cache reads return immediately. A separate refresh request performs
bounded revalidation in Streetli, with shared request budgets and per-URL leases.
Missing configuration, cache misses, or failed checks return `unknown`.

The gateway limits each short-lived client bucket to 30 requests and six refresh
requests per minute, plus 90 requests/minute per running instance and four
concurrent upstream calls. It coalesces repeat destination refreshes for 30 seconds.
Client buckets contain only an in-memory keyed digest of the proxy address,
discarded after a minute; raw addresses are not stored or sent to Streetli.
Forwarding headers are best-effort buckets, so rotating them cannot bypass the
instance-wide cap. Streetli's shared database budget independently caps all
instances at 120 accepted requests/minute and 40 website refreshes/minute, with
five-minute URL leases. A quota denial never clears an existing warning.
Incoming request bodies are read with a 48 KB streaming limit, including when
Content-Length is absent or inaccurate. Prefetching is capped per DOM scan, with
bounded remembered entries, so new pages continue receiving cached assessments
after the first 200 links in a browser session.

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
