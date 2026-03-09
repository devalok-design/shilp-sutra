import preset from '../../packages/core/src/tailwind/preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/core/src/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
} satisfies Config
