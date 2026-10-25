import { defineConfig } from 'vitest/config';

export default defineConfig({
  server: { host: true },
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    environment: 'node',
    // Only the overlay stylesheet is processed, so a test can check its rules.
    css: { include: [/ui-root\.css/] },
  },
});
