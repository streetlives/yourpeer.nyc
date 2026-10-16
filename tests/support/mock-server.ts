import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";

const PORT = 4000;

// process.cwd() is always the project root when launched by Playwright,
// so this path is stable in both CJS (__dirname) and ESM (no __dirname) contexts.
const FIXTURES_DIR = join(process.cwd(), "tests", "fixtures");

function fixture(name: string) {
  return readFileSync(join(FIXTURES_DIR, name), "utf-8");
}

function json(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

/**
 * Slugs that exist in the mock database.
 * Maps slug → fixture file name.
 */
const KNOWN_SLUGS: Record<string, string> = {
  "community-support-nyc-midtown": "location-detail.json",
  "brooklyn-housing-services-brooklyn": "location-detail-2.json",
  "samecare-with-photo": "location-detail-with-photo.json",
};

/**
 * Slugs that have moved. The app calls /location-slug-redirects/:slug when
 * /locations-by-slug/:slug returns a non-200, and expects { slug: "new-slug" }
 * in response to issue a permanentRedirect.
 */
const SLUG_REDIRECTS: Record<string, string> = {
  "old-community-support-nyc-midtown": "community-support-nyc-midtown",
  "oldest-community-support-nyc-midtown": "community-support-nyc-midtown",
  "old-location-with-null-hours": "location-with-null-hours",
  // A backend failure must not be mistaken for an obsolete slug.
  "location-api-error": "community-support-nyc-midtown",
};

let restoredHours = false;

function availabilityFixture(slug: string) {
  const location = JSON.parse(fixture("location-detail.json"));
  location.slug = slug;

  if (slug === "location-with-no-services") {
    location.Services = [];
  } else if (slug === "location-with-no-schedules") {
    location.Services[0].HolidaySchedules = [];
  } else if (slug === "location-with-closed-hours") {
    for (const schedule of location.Services[0].HolidaySchedules) {
      schedule.closed = true;
    }
  } else if (slug === "location-with-closed-status") {
    for (const schedule of location.Services[0].HolidaySchedules) {
      schedule.closed = true;
      schedule.opens_at = null;
      schedule.closes_at = null;
    }
  } else if (slug === "location-with-open-and-closed-hours") {
    const closedService = structuredClone(location.Services[0]);
    closedService.id = "svc-closed-with-hours";
    for (const schedule of closedService.HolidaySchedules) {
      schedule.closed = true;
    }
    location.Services.unshift(closedService);
  } else if (slug === "location-with-partial-hours") {
    // Either recorded time is sufficient for directory eligibility.
    location.Services[0].HolidaySchedules[0].closes_at = null;
    location.Services[0].HolidaySchedules[1].opens_at = null;
  } else if (slug === "location-with-mixed-hours") {
    const serviceWithoutHours = structuredClone(location.Services[0]);
    serviceWithoutHours.id = "svc-without-hours";
    serviceWithoutHours.HolidaySchedules = [];
    location.Services.unshift(serviceWithoutHours);
  } else if (slug === "location-with-midnight-hours") {
    location.Services[0].HolidaySchedules[0].opens_at = "00:00";
  } else if (
    slug === "location-with-null-hours" ||
    (slug === "location-with-restorable-hours" && !restoredHours)
  ) {
    for (const schedule of location.Services[0].HolidaySchedules) {
      schedule.opens_at = null;
      schedule.closes_at = null;
    }
  }

  return JSON.stringify(location);
}

const AVAILABILITY_SLUGS = new Set([
  "location-with-no-services",
  "location-with-no-schedules",
  "location-with-closed-hours",
  "location-with-closed-status",
  "location-with-open-and-closed-hours",
  "location-with-null-hours",
  "location-with-partial-hours",
  "location-with-mixed-hours",
  "location-with-midnight-hours",
  "location-with-restorable-hours",
]);

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "";

  // Test-only state affects one dedicated fixture so parallel tests stay isolated.
  if (url === "/__test/restorable-hours") {
    if (req.method === "POST" || req.method === "DELETE") {
      restoredHours = req.method === "POST";
      json(res, 200, JSON.stringify({ restoredHours }));
    } else {
      json(res, 405, JSON.stringify({ message: "Method not allowed" }));
    }
    return;
  }

  // Health check — Playwright polls this to know the server is ready
  if (url === "/health") {
    res.writeHead(200);
    res.end("ok");
    return;
  }

  // GET /taxonomy
  if (url.startsWith("/taxonomy")) {
    json(res, 200, fixture("taxonomy.json"));
    return;
  }

  // GET /locations-by-slug/:slug
  // Returns 200 for known slugs, 404 otherwise (triggering the redirect lookup).
  if (url.startsWith("/locations-by-slug/")) {
    const slug = url.replace("/locations-by-slug/", "").split("?")[0];
    if (slug === "location-api-error") {
      json(res, 503, JSON.stringify({ message: "Service unavailable" }));
      return;
    }
    if (AVAILABILITY_SLUGS.has(slug)) {
      json(res, 200, availabilityFixture(slug));
      return;
    }
    const fixtureFile = KNOWN_SLUGS[slug];
    if (fixtureFile) {
      json(res, 200, fixture(fixtureFile));
    } else {
      json(res, 404, JSON.stringify({ message: "Not found" }));
    }
    return;
  }

  // GET /location-slug-redirects/:slug
  // Returns { slug } for moved slugs, 404 for truly unknown ones.
  if (url.startsWith("/location-slug-redirects/")) {
    const slug = url.replace("/location-slug-redirects/", "").split("?")[0];
    if (slug === "redirect-api-error") {
      json(res, 503, JSON.stringify({ message: "Service unavailable" }));
      return;
    }
    const newSlug = SLUG_REDIRECTS[slug];
    if (newSlug) {
      json(res, 200, JSON.stringify({ slug: newSlug }));
    } else {
      json(res, 404, JSON.stringify({ message: "Not found" }));
    }
    return;
  }

  // GET /locations?...
  if (url.startsWith("/locations")) {
    const locations = JSON.parse(fixture("locations.json"));
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Pagination-Count": "1",
      "Total-Count": String(locations.length),
    });
    res.end(JSON.stringify(locations));
    return;
  }

  // GET /comment-highlights?locationId=...
  if (url.startsWith("/comment-highlights")) {
    json(
      res,
      200,
      JSON.stringify({
        top_positive_comments: [],
        top_negative_comments: [],
        top_mixed_comments: [],
      }),
    );
    return;
  }

  // GET /comments?locationId=...
  if (url.startsWith("/comments")) {
    json(res, 200, fixture("comments.json"));
    return;
  }

  // GET /services/get-count
  if (url.startsWith("/services/get-count")) {
    json(res, 200, JSON.stringify({ count: 42 }));
    return;
  }

  // Fallback
  json(res, 404, JSON.stringify({ message: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
});
