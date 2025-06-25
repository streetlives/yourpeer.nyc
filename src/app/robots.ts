import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export const fetchCache = "default-no-store";

export default function robots(): MetadataRoute.Robots {
  console.log('"IS_PROD" in process.env', "IS_PROD" in process.env);
  return "IS_PROD" in process.env
    ? {
        rules: [
          {
            userAgent: "*",
            allow: ["/"], // Allow all paths for all crawlers
          },
        ],
        sitemap: `https://yourpeer.nyc/sitemap.xml`,
      }
    : {
        rules: [
          {
            userAgent: "*",
            disallow: ["/"],
          },
        ],
        sitemap: "", // Optionally, you can remove the sitemap reference if you don't want it exposed.
      };
}
