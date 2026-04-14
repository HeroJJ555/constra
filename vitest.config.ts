import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@constra/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@constra/stdlib': path.resolve(__dirname, 'packages/stdlib/src/index.ts'),
      '@constra/solver-backtracking': path.resolve(__dirname, 'packages/solver-backtracking/src/index.ts'),
    },
  },
  test: {
    include: ['packages/*/src/**/*.test.ts'],
  },
});
