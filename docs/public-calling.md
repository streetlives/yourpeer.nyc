# Desktop directory calls

This feature is disabled by default and requires the companion `streetlives-api` public-calling change and dedicated LiveKit/Telnyx gateway. Merging the website alone does not activate calls. The API repository's `docs/public-calling.md` contains provider provisioning, migration, gateway networking, budgets and rollout instructions.

On desktop, a published directory phone link opens a draggable call panel and immediately requests microphone access. While permission is pending, visitors may choose to verify a callback number by SMS. Otherwise the call proceeds through YourPeer when microphone access and the security check succeed. Choosing a callback number pauses dialing until verification succeeds or the visitor skips. The number remains with its current provider; this does not port Google Voice or redirect its messages.

The panel supports mute, hangup, DTMF/keypad and an explicit extension button. Position persists; calls do not restart after refresh. A second number asks to end the current call first. Busy destinations queue through the API. Queued users release their microphone and click Call now when their slot becomes available. Mobile, unsupported links, modified clicks and deployments with calling off retain their existing behavior.

After a connected call made through YourPeer, a ten-second snackbar offers callback setup for **future calls**. It cannot change the caller ID of the completed call. Dismissing the prompt once suppresses it on that browser. Verified numbers use a signed HttpOnly SameSite=Strict session cookie; a 30-day persistent cookie is opt-in. A visitor can forget their number from the completed-call panel. No incoming calls, messaging, recording or staff extension changes are included.

## Server environment

Set these in the Next.js **runtime** secret/environment configuration, not `NEXT_PUBLIC_*`, client JavaScript, build logs or checked-in files. Ensure the hosting platform passes runtime secrets to server routes. Only the Turnstile site key is rendered publicly.

| Variable                            | Value                                                                                              |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `PUBLIC_CALLING_ENABLED`            | `false` by default; `true` after gateway/API acceptance                                            |
| `PUBLIC_CALLING_API_URL`            | HTTPS API base including stage, e.g. `https://api.example.org/prod`; no trailing `/public-calling` |
| `PUBLIC_CALLING_SECRET`             | ≥32-character random secret matching API `PUBLIC_CALLING_BFF_SECRET`                               |
| `PUBLIC_CALLING_ORIGIN`             | Exact website origin, e.g. `https://yourpeer.nyc`; not a request-derived host                      |
| `PUBLIC_CALLING_CLIENT_IP_HEADER`   | Trusted ingress-overwritten single IP header, e.g. `cf-connecting-ip`                              |
| `PUBLIC_CALLING_TURNSTILE_SITE_KEY` | Managed Turnstile widget restricted to this website hostname                                       |
| `PUBLIC_CALLING_TURNSTILE_SECRET`   | Widget secret for server-side Siteverify                                                           |

Use separate stage/prod secrets and widgets. The BFF requires same-origin JSON mutations and validates Turnstile success, hostname and action (`public_call`/`public_verify`). It uses an explicit route allowlist, bounded request bodies, and its own session/IP/secret headers. The API determines destination eligibility from DB records; a forged href/referrer cannot authorize an arbitrary phone number. No Telnyx credentials or SIP grants reach the browser.

Cloudflare must overwrite the chosen client-IP header, and the hosting origin must reject bypass traffic, including a platform's default deployment domain. A client-controlled header is not a trusted IP. Configure origin access controls and rate limits on `/api/public-calling/*`; do not cache these routes. If an existing CSP is enforced, allow `https://challenges.cloudflare.com` for scripts/frames and the dedicated LiveKit HTTPS/WSS host for connections; keep `media-src blob:` as needed for playback. Allow microphone for self in Permissions-Policy. Never disable CSP globally for this feature.

The default public caller must be a number approved for displaying as YourPeer, with established callback handling. This PR does not expose an employee's Google Voice number or provision inbound routing. LiveKit host/transfer costs are additional to Telnyx calls/OTP charges. Review the privacy notice before enabling a public rollout: the API temporarily stores call metadata and verified callback numbers; no audio is recorded.

## Validation and activation

```sh
npm run check-types
npx vitest run tests/unit/public-calling.test.tsx tests/unit/public-calling-server.test.ts
PUBLIC_CALLING_E2E=true npx playwright test public-calling.spec.ts
```

On PowerShell set `$env:PUBLIC_CALLING_E2E='true'` first. Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for a system Chrome if needed. The browser test starts the existing fixture API and Next dev server with dummy calling settings, intercepts calling responses and simulates microphone permission. It makes no telephone calls or OTP requests. Backend tests separately cover authorization, real PostgreSQL concurrency in CI, idempotency, quotas, destination binding and provider adapters. Mocked tests do not establish carrier connectivity or caller-ID presentation.

Complete the API guide's controlled two-way-audio, caller-ID/OTP, DTMF, TURN, queue and hangup acceptance checks before enabling this website flag. Calls are not configured/deployed by tests or by creating the PR. Disable API admission first during rollback and leave status/hangup/reaper working until calls drain.
