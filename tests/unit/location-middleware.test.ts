import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

describe("location request slug forwarding", () => {
  it("forwards the actual URL slug instead of an incoming spoofed value", () => {
    const response = middleware(
      new NextRequest("https://yourpeer.nyc/locations/current-slug?foo=bar", {
        headers: { "x-yourpeer-location-slug": "another-location" },
      }),
    );
    expect(
      response.headers.get("x-middleware-request-x-yourpeer-location-slug"),
    ).toBe("current-slug");
  });

  it.each(["/locations", "/locations/a/b"])(
    "clears the forwarded slug when the path is not a location detail: %s",
    (path) => {
      const response = middleware(
        new NextRequest(`https://yourpeer.nyc${path}`, {
          headers: { "x-yourpeer-location-slug": "spoofed" },
        }),
      );
      expect(
        response.headers.get("x-middleware-request-x-yourpeer-location-slug"),
      ).toBeNull();
    },
  );
});
