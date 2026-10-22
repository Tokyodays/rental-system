import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // e2e/ は Playwright のテストなので vitest では読み込まない
    include: ['tests/**/*.test.ts']
  }
})
