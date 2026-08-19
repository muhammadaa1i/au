import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pins the workspace root to this project (a sibling package-lock.json one
  // level up, outside this git repo, would otherwise make Turbopack guess).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
