import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Exclude Playwright E2E specs — they run under `npm run test:e2e`, not Vitest.
    exclude: ["e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      '@shared': './shared',
    },
  },
});
