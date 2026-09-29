import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    setupFiles: ['test/setup.ts'],
    // Integration and API tests share one database; run files one at a time.
    fileParallelism: false,
    testTimeout: 20000,
  },
});
