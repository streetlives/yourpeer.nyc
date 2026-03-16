import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync } from "fs";
import { join } from "path";

const PORT = 4000;

function fixture(name: string) {
  return readFileSync(join(__dirname, "fixtures", name), "utf-8");
}

function json(res: ServerResponse, status: number, body: string) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(body);
}

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
  if (url.startsWith("/locations-by-slug/")) {
    json(res, 200, fixture("location-detail.json"));
    return;
  }

  // GET /location-slug-redirects/:slug  (called when /locations-by-slug 404s)
  if (url.startsWith("/location-slug-redirects/")) {
    json(res, 404, JSON.stringify({ message: "Not found" }));
    return;
  }

  // GET /locations?...  (returns array + pagination headers)
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
