import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@akiba/shared-types"],
  reactStrictMode: true,
  // Standalone output produces a self-contained build for Docker deployments.
  // See: apps/admin/Dockerfile
  output: "standalone",
};

export default nextConfig;
