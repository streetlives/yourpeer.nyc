export type SpanTagWriter = {
  setTag: (key: string, value: string) => void;
};

export function sanitizeUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  const [path] = url.split('?');

  return path;
}

export function redactRequestSpanData(span: SpanTagWriter, requestUrl?: string) {
  const sanitizedUrl = sanitizeUrl(requestUrl);

  if (!sanitizedUrl) {
    return;
  }

  span.setTag('http.url', sanitizedUrl);
  span.setTag('http.query.string', 'redacted');
}
