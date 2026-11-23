// Browser stand-in for Node's built-in `assert`, which the app imports and
// Next.js polyfills at build time. Mapped via .design-sync/tsconfig.json paths.
export default function assert(value: unknown, message?: string): asserts value {
  if (!value) throw new Error(message ?? "Assertion failed");
}
