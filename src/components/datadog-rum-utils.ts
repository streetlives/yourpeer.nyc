const NUMERIC_SEGMENT_PATTERN = /^\d+$/;
const UUID_SEGMENT_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LONG_TOKEN_SEGMENT_PATTERN = /^[a-z0-9_-]{24,}$/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

export const RUM_WINDOW_GUARD_KEY = "__yourPeerRumInitialized__";

type RumGuardWindow = Window & {
  [RUM_WINDOW_GUARD_KEY]?: boolean;
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

      return segment;
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

export const isRumAlreadyInitialized = (windowObject: Window) => {
  return Boolean((windowObject as RumGuardWindow)[RUM_WINDOW_GUARD_KEY]);
};

export const markRumAsInitialized = (windowObject: Window) => {
  (windowObject as RumGuardWindow)[RUM_WINDOW_GUARD_KEY] = true;
};
