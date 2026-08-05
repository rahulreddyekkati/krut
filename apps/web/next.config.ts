import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  // This app lives at apps/web inside an npm-workspaces monorepo with a shared
  // root prisma/ and root node_modules. Without this, Next's file tracing for
  // the standalone build only looks inside apps/web and misses those.
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
