import preset from './packages/core/src/tailwind/preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: ['./packages/*/src/**/*.{ts,tsx}'],
  // TW4: darkMode configured via @variant in CSS
} satisfies Config
