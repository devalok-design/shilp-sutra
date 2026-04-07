import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '..', 'packages', 'core', 'src', 'primitives'),
      '@': resolve(__dirname, '..', 'packages', 'core', 'src'),
      '#.storybook': resolve(__dirname),
      'next/link': resolve(__dirname, 'mocks', 'next-link.tsx'),
      'next/navigation': resolve(__dirname, 'mocks', 'next-navigation.ts'),
    },
  },
  build: {
    // Suppress "use client" directive warnings from dependencies (react-pdf, etc.)
    // These are harmless in a Storybook build context
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.message?.includes('Module level directives')) return
        warn(warning)
      },
    },
  },
})
