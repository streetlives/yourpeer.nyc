// app/robots.txt/route.ts (Next.js 13+)
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  console.log('"IS_PROD" in process.env', "IS_PROD" in process.env);
  const content =
    "IS_PROD" in process.env
      ? `
User-agent: *
Allow: /
Sitemap: ${request.headers.get("host")}/sitemap.xml
    `.trim()
      : `
User-agent: *
Disallow: /
    `.trim();

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
