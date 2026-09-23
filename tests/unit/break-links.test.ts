import { describe, expect, it } from "vitest";
import { markBreakableLinks } from "@/lib/break-links";

describe("markBreakableLinks", () => {
  it("marks anchors whose visible text is a URL", () => {
    expect(
      markBreakableLinks(
        '<a href="https://example.org/a/very/long/path">https://example.org/a/very/long/path</a>',
      ),
    ).toContain('class="break-url"');
  });

  it("marks bare hosts and www hosts shown as text", () => {
    expect(
      markBreakableLinks(
        '<a href="https://www.nyc.gov/hra">www.nyc.gov/hra</a>',
      ),
    ).toContain("break-url");
    expect(
      markBreakableLinks('<a href="https://example.org">example.org</a>'),
    ).toContain("break-url");
  });

  it("marks anchors showing an email address", () => {
    expect(
      markBreakableLinks(
        '<a href="mailto:intake@some-long-organization.org">intake@some-long-organization.org</a>',
      ),
    ).toContain("break-url");
  });

  it("leaves anchors whose body is ordinary words untouched", () => {
    const html =
      '<a href="https://example.org/a/very/long/path">Apply here for benefits</a>';
    expect(markBreakableLinks(html)).toBe(html);
  });

  it("leaves tel: anchors untouched", () => {
    const html = '<a href="tel:7189202020">(718) 920-2020</a>';
    expect(markBreakableLinks(html)).toBe(html);
  });

  it("does not mistake prose abbreviations or phone numbers for URLs", () => {
    const html =
      '<a href="https://example.org">Walk-ins welcome, e.g. Mon. and Tue.</a>';
    expect(markBreakableLinks(html)).toBe(html);
    const phone = '<a href="https://example.org">Call 718.920.2020</a>';
    expect(markBreakableLinks(phone)).toBe(phone);
  });

  it("preserves an existing class attribute", () => {
    const marked = markBreakableLinks(
      '<a class="text-blue" href="https://example.org">example.org</a>',
    );
    expect(marked).toContain('class="text-blue break-url"');
  });

  it("is idempotent", () => {
    const once = markBreakableLinks(
      '<a href="https://example.org">example.org</a>',
    );
    expect(markBreakableLinks(once)).toBe(once);
  });

  it("handles markup and entities inside the anchor body", () => {
    expect(
      markBreakableLinks(
        '<a href="https://example.org"><strong>example.org/apply?a=1&amp;b=2</strong></a>',
      ),
    ).toContain("break-url");
    expect(
      markBreakableLinks(
        '<a href="https://example.org"><strong>Apply</strong> here</a>',
      ),
    ).not.toContain("break-url");
  });

  it("marks each anchor independently and leaves surrounding text alone", () => {
    const marked = markBreakableLinks(
      'Visit <a href="https://example.org">example.org</a> or ' +
        '<a href="https://example.org/apply">apply online</a> or call ' +
        '<a href="tel:7189202020">(718) 920-2020</a>.',
    );
    expect(marked).toContain(
      '<a href="https://example.org" class="break-url">',
    );
    expect(marked).toContain(
      '<a href="https://example.org/apply">apply online</a>',
    );
    expect(marked).toContain('<a href="tel:7189202020">(718) 920-2020</a>');
    expect(marked.startsWith("Visit ")).toBe(true);
  });

  it("passes empty input through", () => {
    expect(markBreakableLinks("")).toBe("");
    expect(markBreakableLinks("no links here")).toBe("no links here");
  });
});
