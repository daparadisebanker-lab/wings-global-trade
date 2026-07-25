import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // most specific first — the subpath must not be swallowed by the barrel
      '@wings/trade-ui/containers': resolve(
        __dirname,
        '../../packages/ui/src/organs/diagrams/containerSpecs.ts',
      ),
      '@wings/trade-ui': resolve(__dirname, '../../packages/ui/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
