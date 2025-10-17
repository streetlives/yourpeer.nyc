import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test-utils/setupTests.ts'],
    include: ['test/**/*.spec.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': join(fileURLToPath(new URL('.', import.meta.url)), 'src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
});
