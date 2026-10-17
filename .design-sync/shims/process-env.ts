// Next.js inlines process.env.* at build time; outside Next (the design-sync
// bundle) those reads would throw "process is not defined". Imported first
// from .design-sync/entry.ts so it runs before any app or next/* module.
const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } };
if (!g.process) g.process = { env: {} };
