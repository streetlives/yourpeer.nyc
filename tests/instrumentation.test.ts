import test from 'node:test';
import assert from 'node:assert/strict';

import { isDatadogTracingEnabled, register } from '../src/instrumentation';
import { redactRequestSpanData, sanitizeUrl } from '../src/instrumentation.redaction';

test('isDatadogTracingEnabled requires app-level opt-in', () => {
  assert.equal(isDatadogTracingEnabled({ YOURPEER_ENABLE_DATADOG_APM: 'true' }), true);
  assert.equal(
    isDatadogTracingEnabled({ YOURPEER_ENABLE_DATADOG_APM: 'false', DD_TRACE_ENABLED: 'true' }),
    false,
  );
  assert.equal(isDatadogTracingEnabled({ DD_TRACE_ENABLED: 'true' }), false);
});

test('isDatadogTracingEnabled honors DD_TRACE_ENABLED=false as hard disable', () => {
  assert.equal(
    isDatadogTracingEnabled({ YOURPEER_ENABLE_DATADOG_APM: 'true', DD_TRACE_ENABLED: 'false' }),
    false,
  );
});

test('register loads instrumentation in node runtime when feature flag is enabled', async () => {
  const previousRuntime = process.env.NEXT_RUNTIME;
  const previousFlag = process.env.YOURPEER_ENABLE_DATADOG_APM;
  const previousDdTraceEnabled = process.env.DD_TRACE_ENABLED;

  try {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.YOURPEER_ENABLE_DATADOG_APM = 'true';
    delete process.env.DD_TRACE_ENABLED;

    const registered = await register();
    assert.equal(registered, true);
  } finally {
    process.env.NEXT_RUNTIME = previousRuntime;
    process.env.YOURPEER_ENABLE_DATADOG_APM = previousFlag;
    process.env.DD_TRACE_ENABLED = previousDdTraceEnabled;
  }
});

test('register is a safe no-op outside node runtime', async () => {
  const previousRuntime = process.env.NEXT_RUNTIME;
  const previousFlag = process.env.YOURPEER_ENABLE_DATADOG_APM;

  try {
    process.env.NEXT_RUNTIME = 'edge';
    process.env.YOURPEER_ENABLE_DATADOG_APM = 'true';

    const registered = await register();
    assert.equal(registered, false);
  } finally {
    process.env.NEXT_RUNTIME = previousRuntime;
    process.env.YOURPEER_ENABLE_DATADOG_APM = previousFlag;
  }
});

test('register is a safe no-op when app-level flag is not enabled', async () => {
  const previousRuntime = process.env.NEXT_RUNTIME;
  const previousFlag = process.env.YOURPEER_ENABLE_DATADOG_APM;

  try {
    process.env.NEXT_RUNTIME = 'nodejs';
    process.env.YOURPEER_ENABLE_DATADOG_APM = 'false';

    const registered = await register();
    assert.equal(registered, false);
  } finally {
    process.env.NEXT_RUNTIME = previousRuntime;
    process.env.YOURPEER_ENABLE_DATADOG_APM = previousFlag;
  }
});

test('sanitizeUrl removes query strings', () => {
  assert.equal(sanitizeUrl('/search?query=nyc&zip=10001'), '/search');
  assert.equal(sanitizeUrl('/health'), '/health');
  assert.equal(sanitizeUrl(undefined), undefined);
});

test('redactRequestSpanData writes sanitized URL and redacted query tag', () => {
  const tags: Record<string, string> = {};
  const span = {
    setTag: (key: string, value: string) => {
      tags[key] = value;
    },
  };

  redactRequestSpanData(span, '/search?query=sensitive&token=abc');

  assert.equal(tags['http.url'], '/search');
  assert.equal(tags['http.query.string'], 'redacted');
});

test('redactRequestSpanData is a no-op when URL is missing', () => {
  const tags: Record<string, string> = {};
  const span = {
    setTag: (key: string, value: string) => {
      tags[key] = value;
    },
  };

  redactRequestSpanData(span, undefined);

  assert.deepEqual(tags, {});
});
