import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    environment: "node",
    setupFiles: ["tests/setup.ts"],
  },
  // fileURLToPath, not .pathname: the repo lives under "Personal Projects" and .pathname keeps %20.
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
