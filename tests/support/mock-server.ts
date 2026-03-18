import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";

const PORT = 4000;

function fixture(name: string) {
  return readFileSync(join(__dirname, "..", "fixtures", name), "utf-8");
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
  "brooklyn-housing-services-brooklyn": "location-detail.json",
};

/**
 * Slugs that have moved. The app calls /location-slug-redirects/:slug when
 * /locations-by-slug/:slug returns a non-200, and expects { slug: "new-slug" }
 * in response to issue a permanentRedirect.
 */
const SLUG_REDIRECTS: Record<string, string> = {
  "old-community-support-nyc-midtown": "community-support-nyc-midtown",
};

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  const url = req.url ?? "";

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
