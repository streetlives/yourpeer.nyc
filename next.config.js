/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
  pageExtensions: ["ts", "tsx"],
  transpilePackages: ["@tanstack/react-query", "@tanstack/query-core"],

  // Optional: helps client-side traces too
  productionBrowserSourceMaps: true,
};

module.exports = nextConfig;
