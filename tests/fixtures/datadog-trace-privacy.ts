import http from 'node:http';
import zlib from 'node:zlib';
import msgpack from 'msgpack-lite';

const QUERY_MARKER = 'pii_marker_12345';
const QUERY_STRING = `token=${QUERY_MARKER}&email=${QUERY_MARKER}@example.com`;

type SpanRecord = {
  name?: string;
  resource?: string;
  meta?: Record<string, string | undefined>;
};

function decodePayload(body: Buffer, contentEncoding: string | undefined) {
  if (contentEncoding === 'gzip') {
    return zlib.gunzipSync(body as unknown as Uint8Array) as unknown as Buffer;
  }

  if (contentEncoding === 'deflate') {
    return zlib.inflateSync(body as unknown as Uint8Array) as unknown as Buffer;
  }

  return body;
}

function containsQueryString(value: string | undefined) {
  if (!value) {
    return false;
  }

  return value.includes('?') || value.includes(QUERY_MARKER) || value.includes(QUERY_STRING);
}

function findQueryLeak(value: unknown): string | undefined {
  if (typeof value === 'string' && containsQueryString(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const leak = findQueryLeak(item);
      if (leak) {
        return leak;
      }
    }
    return undefined;
  }

  if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      const leak = findQueryLeak(nested);
      if (leak) {
        return leak;
      }
    }
  }

  return undefined;
}

async function run() {
  const payloads: Array<{ url: string; body: Buffer }> = [];

  const agentServer = http.createServer((req, res) => {
    const chunks: Uint8Array[] = [];

    req.on('data', (chunk) => chunks.push(chunk as Uint8Array));
    req.on('end', () => {
      if (req.url?.startsWith('/v0.')) {
        payloads.push({
          url: req.url,
          body: decodePayload(Buffer.concat(chunks), req.headers['content-encoding']),
        });
      }
      res.end('{}');
    });
  });

  const appServer = http.createServer((req, res) => {
    res.statusCode = 200;
    res.end(JSON.stringify({ url: req.url ?? null }));
  });

  try {
    await new Promise<void>((resolve) => agentServer.listen(0, '127.0.0.1', () => resolve()));
    const agentAddr = agentServer.address();
    if (!agentAddr || typeof agentAddr === 'string') {
      throw new Error('Agent server address unavailable');
    }

    process.env.DD_TRACE_AGENT_URL = `http://127.0.0.1:${agentAddr.port}`;
    process.env.DD_TRACE_ENABLED = 'true';
    process.env.DD_SERVICE = 'instrumentation-privacy-test';
    process.env.DD_ENV = 'test';

    await import('../../src/instrumentation.node');

    await new Promise<void>((resolve) => appServer.listen(0, '127.0.0.1', () => resolve()));
    const appAddr = appServer.address();
    if (!appAddr || typeof appAddr === 'string') {
      throw new Error('App server address unavailable');
    }

    await new Promise<void>((resolve, reject) => {
      const req = http.get(`http://127.0.0.1:${appAddr.port}/trace-test?${QUERY_STRING}`, (res) => {
        res.resume();
        res.on('end', resolve);
      });
      req.on('error', reject);
    });


    const tracer = require('dd-trace');
    tracer?._tracer?._exporter?.flush?.();

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const tracePayloads = payloads.filter((entry) => entry.url.includes('/traces'));
    if (tracePayloads.length === 0) {
      throw new Error('No Datadog /traces payload received by mock agent');
    }

    const decodedTraces = tracePayloads.map((entry) => msgpack.decode(entry.body));
    const deepLeak = decodedTraces.map((trace) => findQueryLeak(trace)).find(Boolean);
    if (deepLeak) {
      throw new Error(`Trace payload contains leaked query data in field value: ${deepLeak}`);
    }

    const spans = decodedTraces
      .flatMap((trace) => (Array.isArray(trace) ? trace : []))
      .flatMap((chunk) => (Array.isArray(chunk) ? chunk : [])) as SpanRecord[];

    if (spans.length === 0) {
      throw new Error('No spans decoded from Datadog traces payload');
    }

    for (const span of spans) {
      if (containsQueryString(span.name) || containsQueryString(span.resource)) {
        throw new Error('Span name/resource contains query-string data');
      }

      if (containsQueryString(span.meta?.['http.url'])) {
        throw new Error('http.url tag contains query-string data');
      }

      if (span.meta?.['http.query.string'] && span.meta['http.query.string'] !== 'redacted') {
        throw new Error(`http.query.string is not redacted: ${span.meta['http.query.string']}`);
      }
    }
  } finally {
    if (appServer.listening) {
      await new Promise<void>((resolve) => appServer.close(() => resolve()));
    }
    if (agentServer.listening) {
      await new Promise<void>((resolve) => agentServer.close(() => resolve()));
    }
  }
}

run();
