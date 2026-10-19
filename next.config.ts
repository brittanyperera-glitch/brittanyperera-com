import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 writes AGENTS.md and CLAUDE.md at the repo root on every run;
  // a repo-root CLAUDE.md silently becomes project instructions.
  agentRules: false,
};

export default nextConfig;
