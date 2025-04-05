import checker from 'vite-plugin-checker'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react({
        jsxRuntime: 'automatic'
      }),
      checker({
        typescript: true,
        eslint: {
          lintCommand: 'eslint . --ext .ts,.tsx,.js,.jsx'
        },
        overlay: false // Optional: Disable browser overlay for errors
      })
    ],
    server: {
      port: 3000
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      setupFiles: './vitest.setup.ts',
      exclude: [...configDefaults.exclude, '**/e2e/**'], // Example: Exclude e2e tests
      coverage: {
        provider: 'v8', // Use Vite's default coverage provider
        reporter: ['text', 'json', 'html']
      }
    }
  }
})
