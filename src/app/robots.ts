import type { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const environmentIsProd = baseUrl?.startsWith(
    "https://yourpeer.nyc"
  );

  return environmentIsProd
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
