// Copyright (c) 2024 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

/**
 * Service descriptions and "important info" are free text entered by the
 * street team and rendered as raw HTML. Long website links in that text used
 * to overflow their container on mobile, so #702 gave every anchor in those
 * blocks `word-break: break-all`.
 *
 * That is only correct for anchors whose *visible* text is a URL. An anchor
 * such as `<a href="https://example.org/a/very/long/path">Apply here</a>`
 * shows ordinary words, and break-all chops them mid-word ("App / ly he / re").
 * Phone numbers had the same problem (#727).
 *
 * So instead of styling anchors by href, tag the ones that actually show a URL
 * (or an email address — same unbreakable-token problem) with `break-url`, and
 * let `globals.css` scope `word-break: break-all` to those alone.
 */

const ANCHOR_TAG = /(<a\b[^>]*>)([\s\S]*?)(<\/a>)/gi;

const TEL_HREF = /\shref\s*=\s*(["']?)\s*tel:/i;

const CLASS_ATTRIBUTE = /(\sclass\s*=\s*)(["'])(.*?)\2/i;

/**
 * A URL or email address sitting in visible text: an explicit scheme, a
 * `www.` host, or a bare `host.tld` (optionally with a path/query/fragment).
 * The 2+ character alphabetic TLD keeps ordinary prose like "e.g." and phone
 * numbers like "718.920.2020" from matching.
 */
const VISIBLE_URL =
  /(?:[a-z][a-z0-9+.-]*:\/\/|www\.)[^\s]+|[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,24}(?:[/?#][^\s]*)?/i;

const HTML_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function toVisibleText(innerHtml: string): string {
  return innerHtml
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/gi, (entity) => {
      return HTML_ENTITIES[entity.toLowerCase()] ?? entity;
    });
}

function withClass(openTag: string, className: string): string {
  const existing = openTag.match(CLASS_ATTRIBUTE);

  if (existing) {
    const [, prefix, quote, value] = existing;

    if (value.split(/\s+/).includes(className)) {
      return openTag;
    }

    return openTag.replace(
      CLASS_ATTRIBUTE,
      `${prefix}${quote}${value ? `${value} ` : ""}${className}${quote}`,
    );
  }

  return openTag.replace(/\s*\/?>$/, (end) => ` class="${className}"${end}`);
}

/**
 * Adds the `break-url` class to anchors whose visible text contains a URL or
 * email address. Anchors that link out behind ordinary words — and `tel:`
 * links, which `globals.css` keeps on one line — are returned untouched.
 */
export function markBreakableLinks(html: string): string {
  if (!html) return html;

  return html.replace(ANCHOR_TAG, (anchor, openTag, inner, closeTag) => {
    if (TEL_HREF.test(openTag)) return anchor;
    if (!VISIBLE_URL.test(toVisibleText(inner))) return anchor;

    return `${withClass(openTag, "break-url")}${inner}${closeTag}`;
  });
}
