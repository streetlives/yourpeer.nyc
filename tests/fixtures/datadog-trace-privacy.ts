import http from 'node:http';
import { once } from 'node:events';
import zlib from 'node:zlib';

const QUERY_MARKER = 'pii_marker_12345';
const QUERY_STRING = `token=${QUERY_MARKER}&email=${QUERY_MARKER}@example.com`;

function listen(server: http.Server) {
  return new Promise<number>((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        throw new Error('Failed to resolve server address');
      }

      resolve(address.port);
    });
  });
}

function close(server: http.Server) {
  return new Promise<void>((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function decodePayload(body: Buffer, contentEncoding: string | undefined) {
  if (contentEncoding === 'gzip') {
    return zlib.gunzipSync(body as unknown as Uint8Array) as unknown as Buffer;
  }

  if (contentEncoding === 'deflate') {
    return zlib.inflateSync(body as unknown as Uint8Array) as unknown as Buffer;
  }

  return body;
}

async function run() {
  let receivedPayload = '';

  const agentServer = http.createServer((req, res) => {
    const chunks: Uint8Array[] = [];

    req.on('data', (chunk) => {
      chunks.push(chunk as Uint8Array);
    });

    req.on('end', () => {
      if (req.method === 'POST' && req.url?.startsWith('/v0.')) {
        const rawBody = Buffer.concat(chunks);
        const decodedBody = decodePayload(rawBody, req.headers['content-encoding']);
        receivedPayload += decodedBody.toString('latin1');
      }

      res.statusCode = 200;
      res.end('{}');
    });
  });

  const appServer = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: true, path: req.url ?? null }));
  });

  try {
    const agentPort = await listen(agentServer);
    process.env.DD_TRACE_AGENT_URL = `http://127.0.0.1:${agentPort}`;
    process.env.DD_TRACE_ENABLED = 'true';
    process.env.DD_SERVICE = 'instrumentation-privacy-test';
    process.env.DD_ENV = 'test';

    await import('../../src/instrumentation.node');

    const appPort = await listen(appServer);

    http.get(`http://127.0.0.1:${appPort}/trace-test?${QUERY_STRING}`);

    await once(appServer, 'request');

    const tracer = require('dd-trace');
    tracer._tracer._exporter.flush();

    await new Promise((resolve) => setTimeout(resolve, 250));

    if (!receivedPayload) {
      throw new Error('No Datadog trace payload received by mock agent');
    }

    if (receivedPayload.includes(QUERY_MARKER) || receivedPayload.includes(QUERY_STRING)) {
      throw new Error('Trace payload contains raw query values');
    }

    if (receivedPayload.includes('/trace-test?')) {
      throw new Error('Trace payload contains URL query string in path');
    }
  } finally {
    await close(appServer);
    await close(agentServer);
  }
}

run();
