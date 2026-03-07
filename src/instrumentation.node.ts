const tracer = require('dd-trace');

function sanitizeUrl(url?: string) {
  if (!url) {
    return undefined;
  }

  const [path] = url.split('?');

  return path;
}

function redactRequestSpanData(span: { setTag: (key: string, value: string) => void }, requestUrl?: string) {
  const sanitizedUrl = sanitizeUrl(requestUrl);

  if (!sanitizedUrl) {
    return;
  }

  span.setTag('http.url', sanitizedUrl);
  span.setTag('http.query.string', 'redacted');
}

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
});

tracer.use('http', {
  headers: [],
  hooks: {
    request: (span: { setTag: (key: string, value: string) => void }, req: { url?: string }) => {
      redactRequestSpanData(span, req?.url);
    },
  },
});

tracer.use('next', {
  headers: [],
  hooks: {
    request: (span: { setTag: (key: string, value: string) => void }, req: { url?: string }) => {
      redactRequestSpanData(span, req?.url);
    },
  },
});

export {};
