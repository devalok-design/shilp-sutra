import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@primitives': resolve(__dirname, '..', 'packages', 'core', 'src', 'primitives'),
      '@': resolve(__dirname, '..', 'packages', 'core', 'src'),
      'next/link': resolve(__dirname, 'mocks', 'next-link.tsx'),
      'next/navigation': resolve(__dirname, 'mocks', 'next-navigation.ts'),
    },
  },
})
