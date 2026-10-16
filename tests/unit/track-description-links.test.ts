import { describe, expect, it } from "vitest";
import { trackDescriptionLinks } from "@/lib/track-description-links";
import { markBreakableLinks } from "@/lib/break-links";

describe("trackDescriptionLinks", () => {
  it.each([
    ["https://example.org", "https://example.org?utm_source=yourpeer.nyc"],
    [
      "http://example.org/apply#form",
      "http://example.org/apply?utm_source=yourpeer.nyc#form",
    ],
    [
      "https://example.org?a=1&amp;b=two%20words#form",
      "https://example.org?a=1&amp;b=two%20words&amp;utm_source=yourpeer.nyc#form",
    ],
    [
      "https://example.org?a=1&b=2",
      "https://example.org?a=1&b=2&amp;utm_source=yourpeer.nyc",
    ],
    ["https://example.org?", "https://example.org?utm_source=yourpeer.nyc"],
    [
      "https://example.org?a=1&amp;",
      "https://example.org?a=1&amp;utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org#utm_source=elsewhere",
      "https://example.org?utm_source=yourpeer.nyc#utm_source=elsewhere",
    ],
    [
      "https://example.org?q=utm_source%3Dother",
      "https://example.org?q=utm_source%3Dother&amp;utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org??utm_source=other",
      "https://example.org??utm_source=other&amp;utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?foo=1&#38;bar=2&#35;form",
      "https://example.org?foo=1&#38;bar=2&amp;utm_source=yourpeer.nyc&#35;form",
    ],
    [
      "https://example.org&#63;x=1&num;form",
      "https://example.org&#63;x=1&amp;utm_source=yourpeer.nyc&num;form",
    ],
    [
      " HTTPS://example.org/apply ",
      " HTTPS://example.org/apply?utm_source=yourpeer.nyc ",
    ],
    [
      "https://yourpeer.nyc.example.org",
      "https://yourpeer.nyc.example.org?utm_source=yourpeer.nyc",
    ],
    [
      "https://notyourpeer.nyc",
      "https://notyourpeer.nyc?utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?utm_source=another-campaign",
      "https://example.org?utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?utm_source=",
      "https://example.org?utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?%75tm_source=another-campaign",
      "https://example.org?%75tm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?utm_source",
      "https://example.org?utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?x=1&amp;utm_source=other&amp;y=2#form",
      "https://example.org?x=1&amp;utm_source=yourpeer.nyc&amp;y=2#form",
    ],
    [
      "https://example.org?utm_source=other&amp;x=1&#38;utm_source=yourpeer.nyc&amp;y=two%20words#form",
      "https://example.org?utm_source=yourpeer.nyc&amp;x=1&amp;y=two%20words#form",
    ],
    [
      "https://example.org?utm_source=yourpeer.nyc&amp;utm_source=yourpeer.nyc",
      "https://example.org?utm_source=yourpeer.nyc",
    ],
    [
      "https://example.org?x=1&#38;utm&#95;source&#61;other&#35;form",
      "https://example.org?x=1&#38;utm&#95;source&#61;yourpeer.nyc&#35;form",
    ],
  ])("tracks %s while preserving the existing URL text", (href, expected) => {
    expect(trackDescriptionLinks(`<a href="${href}">Apply here</a>`)).toBe(
      `<a href="${expected}">Apply here</a>`,
    );
  });

  it.each([
    "https://example.org?utm_source=yourpeer.nyc",
    "https://example.org?x=1&amp;utm_source=yourpeer.nyc#form",
    "https://example.org?x=1&#38;utm&#95;source=yourpeer.nyc",
    "https://example.org?utm_source=yourpeer%2Enyc",
    "https://yourpeer.nyc/food",
    "http://www.yourpeer.nyc/locations?search=food#hours",
    "https://staging.yourpeer.nyc:8443/food",
    "HTTPS://YOURPEER.NYC:443/locations",
    "https://www.yourpeer.nyc./food",
    "https://yourpeer.nyc/food?utm_source=another-campaign",
  ])(
    "preserves existing YourPeer attribution or internal link in %s",
    (href) => {
      const html = `<a href="${href}">Apply</a>`;
      expect(trackDescriptionLinks(html)).toBe(html);
    },
  );

  it.each([
    "mailto:help@example.org",
    "tel:2125551234",
    "sms:2125551234",
    "ftp://example.org/file",
    "javascript:void(0)",
    "data:text/plain,hello",
    "/apply?x=1",
    "apply.html",
    "//example.org/apply",
    "#hours",
    "https://",
    "https://[broken",
    "",
  ])("leaves non-web, relative, and malformed hrefs unchanged: %s", (href) => {
    const html = `<a href="${href}">Link</a>`;
    expect(trackDescriptionLinks(html)).toBe(html);
  });

  it("handles quoted and unquoted attributes without touching other attributes", () => {
    const html = `<A title='Apply > here' HREF = 'https://example.org?a=1&amp;b=2' class="text-blue">Apply</A> <a href=https://example.org>Visit</a> <a href=https://example.org?a=1&b=2#form>Query</a>`;
    expect(trackDescriptionLinks(html)).toBe(
      `<A title='Apply > here' HREF = 'https://example.org?a=1&amp;b=2&amp;utm_source=yourpeer.nyc' class="text-blue">Apply</A> <a href="https://example.org?utm_source=yourpeer.nyc">Visit</a> <a href="https://example.org?a=1&b=2&amp;utm_source=yourpeer.nyc#form">Query</a>`,
    );
  });

  it("matches only actual href attributes on anchors", () => {
    const html = `<a data-href="https://example.org" title=' href="https://example.org"'>Info</a><div title='<a href="https://example.org">'>Text</div><!-- <a href="https://example.org"> --><script>const link = '<a href="https://example.org">';</script><textarea><a href="https://example.org"></textarea>`;
    expect(trackDescriptionLinks(html)).toBe(html);
  });

  it("uses the first href, matching browser handling of duplicate attributes", () => {
    const html =
      '<a href="mailto:help@example.org" href="https://example.org">Help</a>';
    expect(trackDescriptionLinks(html)).toBe(html);
  });

  it("tracks each website anchor, preserves visible text, and is idempotent", () => {
    const html =
      'Apply at <a href="https://example.org">example.org</a> or <a href="https://other.org">another office</a>. Call <a href="tel:2125551234">212-555-1234</a>.';
    const tracked = trackDescriptionLinks(html);
    const element = document.createElement("div");
    element.innerHTML = tracked;
    expect(
      [...element.querySelectorAll("a")].map((a) => a.getAttribute("href")),
    ).toEqual([
      "https://example.org?utm_source=yourpeer.nyc",
      "https://other.org?utm_source=yourpeer.nyc",
      "tel:2125551234",
    ]);
    expect(element.textContent).toBe(
      "Apply at example.org or another office. Call 212-555-1234.",
    );
    expect(trackDescriptionLinks(tracked)).toBe(tracked);
    expect(markBreakableLinks(tracked)).toContain('class="break-url"');
  });

  it("passes empty input and plain text through", () => {
    expect(trackDescriptionLinks("")).toBe("");
    expect(trackDescriptionLinks("Apply at https://example.org")).toBe(
      "Apply at https://example.org",
    );
  });
});
