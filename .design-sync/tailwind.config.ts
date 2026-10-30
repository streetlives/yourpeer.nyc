// Tailwind config for the /design-sync stylesheet. Extends the app's own
// tailwind.config.ts (same theme, same plugins) and adds:
//  - content: the curated entry, the provider, and authored previews
//  - safelist: brand-color and core layout utilities, so designs built in
//    claude.ai/design can use the yourpeer vocabulary even when the app's own
//    source doesn't happen to use a given class.
import type { Config } from "tailwindcss";
import base from "../tailwind.config";

const brandColors =
  "primary|yellow|amber-300|dark|danger|success|info|blue|purple|muted|pink-200|grey-100|grey-700|grey-900|neutral-50|neutral-100|neutral-200|neutral-500|neutral-600|white|black|transparent|gray-50|gray-100|gray-200|gray-300|gray-400|gray-500|gray-600|gray-700|gray-800|gray-900";
const space = "0|0\\.5|1|1\\.5|2|2\\.5|3|4|5|6|7|8|10|12|14|16|20|24";

const config: Config = {
  ...base,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./.design-sync/*.tsx",
    "./.design-sync/previews/**/*.tsx",
  ],
  safelist: [
    { pattern: new RegExp(`^(bg|text|border)-(${brandColors})$`) },
    { pattern: new RegExp(`^(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(${space})$`) },
    { pattern: /^(text)-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/ },
    { pattern: /^font-(light|normal|medium|semibold|bold|extrabold)$/ },
    { pattern: /^rounded(-(none|sm|md|lg|xl|2xl|3xl|full))?$/ },
    { pattern: /^(flex|inline-flex|grid|block|inline-block|hidden|contents)$/ },
    { pattern: /^(flex-(row|col|wrap|1|none|shrink-0)|items-(start|center|end|stretch)|justify-(start|center|end|between))$/ },
    { pattern: /^grid-cols-(1|2|3|4|6|12)$/ },
    { pattern: /^(w|h)-(full|screen|auto|4|5|6|8|10|12|16|20|24|32|48|64)$/ },
    { pattern: /^max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|full)$/ },
    { pattern: /^(border|border-[tblrxy]|border-2|divide-y|divide-x|divide-dotted|border-dotted|border-dashed)$/ },
    { pattern: /^shadow(-(sm|md|lg|xl|none|service))?$/ },
    { pattern: /^(truncate|underline|uppercase|leading-(tight|snug|normal|relaxed)|text-(left|center|right))$/ },
    "primary-button",
    "outline-button",
    "secondary-button",
    "link",
  ],
};

export default config;
