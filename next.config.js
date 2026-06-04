/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx"],
  transpilePackages: ["@tanstack/react-query", "@tanstack/query-core"],
  // Optional: helps client-side traces too
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
