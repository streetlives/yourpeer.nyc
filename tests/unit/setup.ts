import "@testing-library/jest-dom";

// The AI search feature flag is off by default (see src/components/feature-flags.ts).
// Existing specs describe the behaviour of the feature when it is turned on, so
// enable it globally; the specs that cover the disabled state override this
// themselves.
process.env.NEXT_PUBLIC_AI_SEARCH_ENABLED = "true";
