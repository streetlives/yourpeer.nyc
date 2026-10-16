import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  // Overwrite incoming values: only the actual URL may select a location.
  headers.delete("x-yourpeer-location-slug");
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  if (segments.length === 2 && segments[0] === "locations") {
    headers.set("x-yourpeer-location-slug", segments[1]);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ["/locations/:path*"] };
