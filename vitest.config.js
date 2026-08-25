import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.js"],
    css: true,
    // Headroom for CPU contention across 30 parallel files — a few
    // interaction-heavy tests brushed the 5s default, including ones nobody
    // had touched. This is insurance, not a fix: the one reliable flake
    // turned out to be a test re-querying the accessibility tree in a loop,
    // and was fixed at the source rather than waited out. If a test needs
    // anywhere near this long, that's a bug in the test.
    testTimeout: 20000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.config.js",
        "**/index.jsx",
        "**/main.jsx",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
