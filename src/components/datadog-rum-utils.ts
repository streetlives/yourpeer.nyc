const NUMERIC_SEGMENT_PATTERN = /^\d+$/;
const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LONG_TOKEN_SEGMENT_PATTERN = /^[a-z0-9_-]{24,}$/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const SAFE_VIEW_SEGMENTS = new Set([
  "about-us",
  "comment-guidelines",
  "contact-us",
  "donate",
  "login",
  "privacy",
  "statement",
  "terms",
]);
export const RUM_WINDOW_GUARD_KEY = "__yourPeerRumInitialized__";

export type RumGuardWindow = Window & {
  [RUM_WINDOW_GUARD_KEY]?: boolean;
};

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const sanitizeUnknown = (
  value: unknown,
  seen = new WeakSet<object>(),
): unknown => {
  if (typeof value === "string") {
    return sanitizeStringValue(value);
  }

  if (!isObjectLike(value)) {
    return value;
  }

  if (seen.has(value)) {
    return value;
  }

  seen.add(value);

  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      value[index] = sanitizeUnknown(value[index], seen);
    }

    return value;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    value[key] = sanitizeUnknown(nestedValue, seen);
  }

  return value;
};

export const normalizePathnameForViewName = (pathname: string) => {
  const normalizedSegments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (
        NUMERIC_SEGMENT_PATTERN.test(segment) ||
        UUID_SEGMENT_PATTERN.test(segment) ||
        LONG_TOKEN_SEGMENT_PATTERN.test(segment)
      ) {
        return ":id";
      }

      if (SAFE_VIEW_SEGMENTS.has(segment)) {
        return segment;
      }

      return ":slug";
    });

  if (normalizedSegments.length === 0) {
    return "route:/";
  }

  if (normalizedSegments.length > 4) {
    return `route:/${normalizedSegments.slice(0, 4).join("/")}/*`;
  }

  return `route:/${normalizedSegments.join("/")}`;
};

export const stripQueryAndHash = (value: string) => {
  const [pathWithoutQuery] = value.split("?");
  return pathWithoutQuery.split("#")[0] ?? pathWithoutQuery;
};

export const sanitizeStringValue = (value: string) => {
  return stripQueryAndHash(value).replace(EMAIL_PATTERN, "[redacted-email]");
};

export const sanitizeRumEvent = (event: unknown) => {
  sanitizeUnknown(event);
};

export const parseCookieValue = (windowObject: Window, cookieName: string) => {
  const cookies = windowObject.document.cookie
    .split(";")
    .map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    if (!cookie.startsWith(`${cookieName}=`)) {
      continue;
    }

    const encodedValue = cookie.slice(cookieName.length + 1);

    try {
      return decodeURIComponent(encodedValue).toLowerCase();
    } catch {
      return encodedValue.toLowerCase();
    }
  }

  return "";
};

export const hasDatadogConsent = (windowObject: Window, cookieName: string) => {
  const consentValue = parseCookieValue(windowObject, cookieName);
  return ["true", "1", "yes", "granted"].includes(consentValue);
};

export const isRumAlreadyInitialized = (windowObject: Window) => {
  return Boolean((windowObject as RumGuardWindow)[RUM_WINDOW_GUARD_KEY]);
};

export const markRumAsInitialized = (windowObject: Window) => {
  (windowObject as RumGuardWindow)[RUM_WINDOW_GUARD_KEY] = true;
};
