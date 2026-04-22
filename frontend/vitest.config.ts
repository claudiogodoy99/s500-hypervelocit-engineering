/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "node:path";

// Note: Vitest's esbuild transform handles TSX using tsconfig "jsx": "react-jsx".
// The Vite React plugin is intentionally omitted to avoid a type conflict between
// the top-level `vite` package and vitest's pinned nested `vite`.
export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    css: false,
    include: ["tests/unit/**/*.test.ts", "tests/component/**/*.test.tsx"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
});
