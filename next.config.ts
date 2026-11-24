import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16 writes AGENTS.md and CLAUDE.md at the repo root on every run;
  // a repo-root CLAUDE.md silently becomes project instructions.
  agentRules: false,
  // Vercel sets the commit SHA on deploy; locally it is empty and the About box omits the line.
  env: { NEXT_PUBLIC_BUILD_SHA: (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) },
};

export default nextConfig;
