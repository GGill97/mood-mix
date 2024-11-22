/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  //  handle build errors
  typescript: {
    // This will show errors in development but allow production builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // This will still show errors in development but allow production builds
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      issuer: { and: [/\.(js|ts|md)x?$/] },
      type: "asset/resource",
    });
    return config;
  },
};

module.exports = nextConfig;
