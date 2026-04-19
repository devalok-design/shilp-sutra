import type { Config } from 'tailwindcss'
import shilpSutraPreset from '@devalok/shilp-sutra/tailwind'

const config: Config = {
  presets: [shilpSutraPreset as unknown as Config],
  content: [
    './app/**/*.{ts,tsx}',
    './node_modules/@devalok/shilp-sutra/dist/**/*.js',
  ],
}

export default config
