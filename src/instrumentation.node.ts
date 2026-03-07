import { redactRequestSpanData, type SpanTagWriter } from './instrumentation.redaction';

const tracer = require('dd-trace');

tracer.init({
  logInjection: true,
  runtimeMetrics: true,
});

tracer.use('http', {
  headers: [],
  hooks: {
    request: (span: SpanTagWriter, req: { url?: string }) => {
      redactRequestSpanData(span, req?.url);
    },
  },
});

tracer.use('next', {
  headers: [],
  hooks: {
    request: (span: SpanTagWriter, req: { url?: string }) => {
      redactRequestSpanData(span, req?.url);
    },
  },
});

export {};
