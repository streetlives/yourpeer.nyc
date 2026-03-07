import test from 'node:test';
import assert from 'node:assert/strict';

import { isDatadogTracingEnabled, register } from '../src/instrumentation';

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

test('register is a safe no-op outside node runtime', async () => {
  const previousRuntime = process.env.NEXT_RUNTIME;
  const previousFlag = process.env.YOURPEER_ENABLE_DATADOG_APM;

  process.env.NEXT_RUNTIME = 'edge';
  process.env.YOURPEER_ENABLE_DATADOG_APM = 'true';

  const registered = await register();
  assert.equal(registered, false);

  process.env.NEXT_RUNTIME = previousRuntime;
  process.env.YOURPEER_ENABLE_DATADOG_APM = previousFlag;
});

test('register is a safe no-op when app-level flag is not enabled', async () => {
  const previousRuntime = process.env.NEXT_RUNTIME;
  const previousFlag = process.env.YOURPEER_ENABLE_DATADOG_APM;

  process.env.NEXT_RUNTIME = 'nodejs';
  process.env.YOURPEER_ENABLE_DATADOG_APM = 'false';

  const registered = await register();
  assert.equal(registered, false);

  process.env.NEXT_RUNTIME = previousRuntime;
  process.env.YOURPEER_ENABLE_DATADOG_APM = previousFlag;
});
