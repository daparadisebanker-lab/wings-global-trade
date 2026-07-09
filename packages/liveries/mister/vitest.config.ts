import { defineConfig } from 'vitest/config'

// Scoped test runner for packages/liveries/mister (the monorepo has no root
// runner yet — mirrors apps/tower/vitest.config.ts's per-package pattern).
export default defineConfig({
  test: {
    include: ['*.test.ts'],
    environment: 'node',
  },
})
