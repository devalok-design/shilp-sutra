import preset from './src/tailwind/preset'
import type { Config } from 'tailwindcss'

export default {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
} satisfies Config
