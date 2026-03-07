const APP_DATADOG_FLAG = 'YOURPEER_ENABLE_DATADOG_APM';

type Environment = Record<string, string | undefined>;

export function isDatadogTracingEnabled(env: Environment = process.env): boolean {
  return env[APP_DATADOG_FLAG] === 'true' && env.DD_TRACE_ENABLED !== 'false';
}

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') {
    return false;
  }

  if (!isDatadogTracingEnabled()) {
    return false;
  }

  await import('./instrumentation.node');

  return true;
}
