import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    server: {
      deps: {
        // PNG imports are bundled by Vite at test time
        inline: [/\.png$/],
      },
    },
  },
  // PNG / image assets: treat as empty modules for tests — components don't
  // render real pixels in jsdom, only the path string is checked.
  assetsInclude: ['**/*.png', '**/*.svg'],
})
