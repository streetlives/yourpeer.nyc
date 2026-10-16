// Copyright (c) 2026 Streetlives, Inc.
//
// Use of this source code is governed by an MIT-style
// license that can be found in the LICENSE file or at
// https://opensource.org/licenses/MIT.

// Consume complete tags so a quoted attribute containing "<a ...>" cannot be
// mistaken for an anchor. Comments and raw-text elements are left alone too.
const HTML_TAG =
  /<!--[\s\S]*?(?:-->|$)|<(script|style|textarea|title)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?(?:<\/\1\s*>|$)|<\/?[a-z][^\s/>]*(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi;
const ATTRIBUTE =
  /(\s+)([^\s"'<>/=]+)(?:([\t\n\f\r ]*=[\t\n\f\r ]*)(?:"([^"]*)"|'([^']*)'|([^\s"'<>`]+)))?/g;
const ENTITY =
  /&(?:#([xX][\da-fA-F]+|\d+);?|(amp|AMP|colon|sol|quest|num|equals|lowbar|Tab|NewLine);)/g;
const URL_PUNCTUATION = new RegExp(`${ENTITY.source}|[?&#]`, "g");
const URL_ENTITIES: Record<string, string> = {
  amp: "&",
  AMP: "&",
  colon: ":",
  sol: "/",
  quest: "?",
  num: "#",
  equals: "=",
  lowbar: "_",
  Tab: "\t",
  NewLine: "\n",
};

function decodeUrlEntities(value: string): string {
  return value.replace(ENTITY, (entity, numeric: string, named: string) => {
    if (!numeric) return URL_ENTITIES[named] ?? entity;
    const code =
      numeric[0].toLowerCase() === "x"
        ? parseInt(numeric.slice(1), 16)
        : parseInt(numeric, 10);
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "\ufffd";
  });
}

function trackWebsiteHref(href: string): string {
  const [, leading, value, trailing] = href.match(/^(\s*)([\s\S]*?)(\s*)$/)!;
  const decoded = decodeUrlEntities(value);
  if (!/^https?:\/\//i.test(decoded)) return href;

  try {
    // Inspect with URL, but edit the original text so existing queries,
    // percent escapes, and the existing HTML entity encoding stay intact.
    const url = new URL(decoded);
    const hostname = url.hostname.replace(/\.$/, "");
    if (hostname === "yourpeer.nyc" || hostname.endsWith(".yourpeer.nyc"))
      return href;
    const sources = url.searchParams.getAll("utm_source");
    if (sources.length === 1 && sources[0] === "yourpeer.nyc") return href;
  } catch {
    return href;
  }

  // Locate real URL punctuation, consuming entities as complete tokens so the
  // ampersand in e.g. "&#35;" is never treated as a query separator.
  const punctuation = [...value.matchAll(URL_PUNCTUATION)].map((match) => ({
    start: match.index!,
    end: match.index! + match[0].length,
    raw: match[0],
    decoded: decodeUrlEntities(match[0]),
  }));
  const fragment =
    punctuation.find((token) => token.decoded === "#")?.start ?? value.length;
  const query = punctuation.find(
    (token) => token.decoded === "?" && token.start < fragment,
  );
  const beforeFragment = value.slice(0, fragment);
  const suffix = `${value.slice(fragment)}${trailing}`;
  if (!query)
    return `${leading}${beforeFragment}?utm_source=yourpeer.nyc${suffix}`;

  const separators = punctuation.filter(
    (token) =>
      token.decoded === "&" &&
      token.start >= query.end &&
      token.start < fragment,
  );
  const parts = [query, ...separators].map((separator, index, all) => ({
    separator: separator.raw,
    raw: value.slice(separator.end, all[index + 1]?.start ?? fragment),
  }));
  let hasSource = false;
  const tracked = parts.flatMap((part) => {
    // Prefix a separator so a literal leading "?" remains part of the key.
    const params = new URLSearchParams(`&${decodeUrlEntities(part.raw)}`);
    if (!params.has("utm_source")) return [part];
    if (hasSource) return [];
    hasSource = true;
    // Preserve the original key (including percent/entity escapes).
    const equals = [...part.raw.matchAll(URL_PUNCTUATION)].find(
      (match) => decodeUrlEntities(match[0]) === "=",
    );
    const plainEquals = part.raw.indexOf("=");
    const encodedEquals =
      equals && (plainEquals < 0 || equals.index! < plainEquals);
    const keyEnd = encodedEquals ? equals.index! : plainEquals;
    const key = keyEnd < 0 ? part.raw : part.raw.slice(0, keyEnd);
    return [
      {
        ...part,
        raw: `${key}${encodedEquals ? equals[0] : "="}yourpeer.nyc`,
      },
    ];
  });

  if (!hasSource) {
    // A final empty query parameter already provides the separator we need.
    const last = tracked[tracked.length - 1];
    if (last.raw === "") last.raw = "utm_source=yourpeer.nyc";
    else tracked.push({ separator: "&amp;", raw: "utm_source=yourpeer.nyc" });
  }
  const trackedQuery = tracked
    .map(
      (part, index) => `${index === 0 ? query.raw : part.separator}${part.raw}`,
    )
    .join("");
  return `${leading}${value.slice(0, query.start)}${trackedQuery}${suffix}`;
}

/**
 * Track absolute HTTP(S) anchors in the HTML stored in free-text descriptions.
 * Ensure one utm_source=yourpeer.nyc value per external website link.
 * Preserve YourPeer links, visible text, other attributes,
 * and non-web links. Works during server rendering and in the browser.
 */
export function trackDescriptionLinks(html: string | null | undefined): string {
  if (html == null) return "";

  return html.replace(HTML_TAG, (tag) => {
    if (!/^<a(?:\s|\/?>)/i.test(tag)) return tag;

    for (const attribute of tag.slice(2, -1).matchAll(ATTRIBUTE)) {
      const [, space, name, equals, doubleQuoted, singleQuoted, bare] =
        attribute;
      if (name.toLowerCase() !== "href") continue;
      const value = doubleQuoted ?? singleQuoted ?? bare;
      if (value === undefined) return tag;
      const tracked = trackWebsiteHref(value);
      if (tracked === value) return tag;

      const quote = singleQuoted !== undefined ? "'" : '"';
      const start = 2 + attribute.index!;
      return `${tag.slice(0, start)}${space}${name}${equals}${quote}${tracked}${quote}${tag.slice(start + attribute[0].length)}`;
    }
    return tag;
  });
}
