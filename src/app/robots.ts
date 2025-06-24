import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return process.env.NODE_ENV === 'production'
    ? {
        rules: [
          {
            userAgent: "*",
            allow: ["/"], // Allow all paths for all crawlers
          },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
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
