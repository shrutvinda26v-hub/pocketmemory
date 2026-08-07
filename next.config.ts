import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  // Static export for permanent hosting (Surge / GitHub Pages)
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
