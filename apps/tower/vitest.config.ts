import { defineConfig } from 'vitest/config'

// Scoped test runner for apps/tower (the monorepo has no root runner yet).
// Wave 1 covers the archetypes module; feature waves add their own specs.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
})
