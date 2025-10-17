# Error handling and translation fallbacks

## Reproducing the DOMException

1. Start the local dev server with `npm run dev`.
2. Open the app in the browser and navigate to any map-enabled route (e.g. `/locations`).
3. In the browser console, run:
   ```js
   const map = document.getElementById('map_container');
   if (map?.firstElementChild) {
     map.removeChild(map.firstElementChild);
   }
   ```
   Running it twice forces `removeChild` to throw a `NotFoundError`, the same DOMException we see when Google Translate mutates the DOM.

The global boundary now catches the exception and renders the fallback UI instead of blanking the entire shell. You can click **“Reload this section”** to re-render the affected segment without a full page refresh.

## What the fallback looks like

* **Global error** &mdash; Displays a simple page with the message “Something went wrong” and a button labelled “Reload this section”. In development the digest and stack trace are shown for debugging.
* **Map panel error** &mdash; Shows a card telling the user that the map is temporarily unavailable and offers a “Try again” action.
* **Results list error** &mdash; Explains that the list could not load and lets the user reload just the panel.
* **Static page error** &mdash; Provides a friendly recovery button while we retry the content render.

## Testing with the Google Translate simulators

* **Playwright** &mdash; Import `simulateGoogleTranslate` from `tests/utils/simulateTranslate` and call it before `page.goto`. This wraps text nodes the same way Google Translate does so E2E coverage exercises the guard rails.
* **JSDOM / unit tests** &mdash; Use `simulateTranslateInJSDOM` from `test-utils/gtSim` against the root element before triggering state updates. The included `TranslatableText` regression test demonstrates the expected usage.
