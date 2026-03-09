export const COLOR_SCALES = [
  'pink', 'purple', 'neutral', 'green', 'red', 'yellow',
  'blue', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald',
] as const

export type ColorScaleName = (typeof COLOR_SCALES)[number]

export const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** Default primitive colors — sourced from primitives.css */
export const PRIMITIVE_DEFAULTS: Record<string, string> = {
  // Pink
  '--pink-50': '#fcf7f7',
  '--pink-100': '#f7e9e9',
  '--pink-200': '#efd5d9',
  '--pink-300': '#e5b3bf',
  '--pink-400': '#d97195',
  '--pink-500': '#d33163',
  '--pink-600': '#b6204a',
  '--pink-700': '#932044',
  '--pink-800': '#6e1433',
  '--pink-900': '#4d0a1c',
  '--pink-950': '#2a0510',

  // Purple
  '--purple-50': '#f8f6fc',
  '--purple-100': '#f2eff8',
  '--purple-200': '#e6e1f3',
  '--purple-300': '#d3c8ea',
  '--purple-400': '#ab9ded',
  '--purple-500': '#8258a9',
  '--purple-600': '#6a3f91',
  '--purple-700': '#512d75',
  '--purple-800': '#3a274e',
  '--purple-900': '#2a1a3a',
  '--purple-950': '#1e1429',

  // Neutral
  '--neutral-0': '#ffffff',
  '--neutral-50': '#f8f7f7',
  '--neutral-100': '#f2f1f1',
  '--neutral-200': '#e6e4e5',
  '--neutral-300': '#d3ced0',
  '--neutral-400': '#b7afb2',
  '--neutral-500': '#8c8084',
  '--neutral-600': '#6b6164',
  '--neutral-700': '#564e50',
  '--neutral-800': '#403a3c',
  '--neutral-900': '#282425',
  '--neutral-950': '#050505',

  // Green
  '--green-50': '#e1f8e0',
  '--green-100': '#aaffb9',
  '--green-200': '#80e892',
  '--green-300': '#50c96a',
  '--green-400': '#2aa648',
  '--green-500': '#08862a',
  '--green-600': '#007a14',
  '--green-700': '#005c0f',
  '--green-800': '#004109',
  '--green-900': '#002b06',
  '--green-950': '#001a04',

  // Red
  '--red-50': '#ffc5c1',
  '--red-100': '#ff9c95',
  '--red-200': '#ff7e75',
  '--red-300': '#f95a4f',
  '--red-400': '#eb3a2e',
  '--red-500': '#e41a0e',
  '--red-600': '#e00e00',
  '--red-700': '#b30b00',
  '--red-800': '#870800',
  '--red-900': '#5c0500',
  '--red-950': '#380300',

  // Yellow
  '--yellow-50': '#fff585',
  '--yellow-100': '#ffe83f',
  '--yellow-200': '#fdd430',
  '--yellow-300': '#e8b510',
  '--yellow-400': '#cc9600',
  '--yellow-500': '#a36200',
  '--yellow-600': '#9a6b00',
  '--yellow-700': '#7a4900',
  '--yellow-800': '#5c3700',
  '--yellow-900': '#3d2400',
  '--yellow-950': '#251600',

  // Blue
  '--blue-50': '#bee3f9',
  '--blue-100': '#43b2ed',
  '--blue-200': '#38ace6',
  '--blue-300': '#2499d2',
  '--blue-400': '#1d88c8',
  '--blue-500': '#136da3',
  '--blue-600': '#0e537e',
  '--blue-700': '#0a3f60',
  '--blue-800': '#072f4a',
  '--blue-900': '#041f32',
  '--blue-950': '#02131f',

  // Teal
  '--teal-50': '#f0fdfa',
  '--teal-100': '#ccfbf1',
  '--teal-200': '#99f6e4',
  '--teal-300': '#5eead4',
  '--teal-400': '#2dd4bf',
  '--teal-500': '#14b8a6',
  '--teal-600': '#0d9488',
  '--teal-700': '#0f766e',
  '--teal-800': '#115e59',
  '--teal-900': '#134e4a',
  '--teal-950': '#042f2e',

  // Amber
  '--amber-50': '#fffbeb',
  '--amber-100': '#fef3c7',
  '--amber-200': '#fde68a',
  '--amber-300': '#fcd34d',
  '--amber-400': '#fbbf24',
  '--amber-500': '#f59e0b',
  '--amber-600': '#d97706',
  '--amber-700': '#b45309',
  '--amber-800': '#92400e',
  '--amber-900': '#78350f',
  '--amber-950': '#451a03',

  // Slate
  '--slate-50': '#f8fafc',
  '--slate-100': '#f1f5f9',
  '--slate-200': '#e2e8f0',
  '--slate-300': '#cbd5e1',
  '--slate-400': '#94a3b8',
  '--slate-500': '#64748b',
  '--slate-600': '#475569',
  '--slate-700': '#334155',
  '--slate-800': '#1e293b',
  '--slate-900': '#0f172a',
  '--slate-950': '#020617',

  // Indigo
  '--indigo-50': '#eef2ff',
  '--indigo-100': '#e0e7ff',
  '--indigo-200': '#c7d2fe',
  '--indigo-300': '#a5b4fc',
  '--indigo-400': '#818cf8',
  '--indigo-500': '#6366f1',
  '--indigo-600': '#4f46e5',
  '--indigo-700': '#4338ca',
  '--indigo-800': '#3730a3',
  '--indigo-900': '#312e81',
  '--indigo-950': '#1e1b4b',

  // Cyan
  '--cyan-50': '#ecfeff',
  '--cyan-100': '#cffafe',
  '--cyan-200': '#a5f3fc',
  '--cyan-300': '#67e8f9',
  '--cyan-400': '#22d3ee',
  '--cyan-500': '#06b6d4',
  '--cyan-600': '#0891b2',
  '--cyan-700': '#0e7490',
  '--cyan-800': '#155e75',
  '--cyan-900': '#164e63',
  '--cyan-950': '#083344',

  // Orange
  '--orange-50': '#fff7ed',
  '--orange-100': '#ffedd5',
  '--orange-200': '#fed7aa',
  '--orange-300': '#fdba74',
  '--orange-400': '#fb923c',
  '--orange-500': '#f97316',
  '--orange-600': '#ea580c',
  '--orange-700': '#c2410c',
  '--orange-800': '#9a3412',
  '--orange-900': '#7c2d12',
  '--orange-950': '#431407',

  // Emerald
  '--emerald-50': '#ecfdf5',
  '--emerald-100': '#d1fae5',
  '--emerald-200': '#a7f3d0',
  '--emerald-300': '#6ee7b7',
  '--emerald-400': '#34d399',
  '--emerald-500': '#10b981',
  '--emerald-600': '#059669',
  '--emerald-700': '#047857',
  '--emerald-800': '#065f46',
  '--emerald-900': '#064e3b',
  '--emerald-950': '#022c22',
}

/** Token groups for the editor UI */
export interface TokenGroup {
  label: string
  description: string
  tokens: TokenDef[]
}

export interface TokenDef {
  name: string          // CSS custom property name
  label: string         // Human-readable label
  defaultValue: string  // Default value from semantic.css
  type: 'color' | 'size' | 'select' | 'number'
  unit?: string         // px, rem, em, etc.
  min?: number
  max?: number
  step?: number
  options?: string[]    // For select type
}

export const SEMANTIC_GROUPS: TokenGroup[] = [
  {
    label: 'Background & Layers',
    description: 'Page background, card surfaces, and field colors',
    tokens: [
      { name: '--color-background', label: 'Background', defaultValue: 'var(--neutral-0)', type: 'color' },
      { name: '--color-layer-01', label: 'Layer 01', defaultValue: 'var(--neutral-0)', type: 'color' },
      { name: '--color-layer-02', label: 'Layer 02', defaultValue: 'var(--neutral-50)', type: 'color' },
      { name: '--color-layer-03', label: 'Layer 03', defaultValue: 'var(--neutral-100)', type: 'color' },
      { name: '--color-field', label: 'Field', defaultValue: 'var(--neutral-50)', type: 'color' },
      { name: '--color-field-hover', label: 'Field Hover', defaultValue: 'var(--neutral-100)', type: 'color' },
    ],
  },
  {
    label: 'Text Colors',
    description: 'Primary, secondary, and status text colors',
    tokens: [
      { name: '--color-text-primary', label: 'Primary', defaultValue: 'var(--neutral-900)', type: 'color' },
      { name: '--color-text-secondary', label: 'Secondary', defaultValue: 'var(--neutral-700)', type: 'color' },
      { name: '--color-text-tertiary', label: 'Tertiary', defaultValue: 'var(--neutral-600)', type: 'color' },
      { name: '--color-text-placeholder', label: 'Placeholder', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-text-disabled', label: 'Disabled', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-text-error', label: 'Error', defaultValue: 'var(--red-600)', type: 'color' },
      { name: '--color-text-success', label: 'Success', defaultValue: 'var(--green-600)', type: 'color' },
      { name: '--color-text-warning', label: 'Warning', defaultValue: 'var(--yellow-600)', type: 'color' },
      { name: '--color-text-link', label: 'Link', defaultValue: 'var(--blue-600)', type: 'color' },
    ],
  },
  {
    label: 'Border Colors',
    description: 'Borders for cards, inputs, and interactive elements',
    tokens: [
      { name: '--color-border-subtle', label: 'Subtle', defaultValue: 'var(--neutral-200)', type: 'color' },
      { name: '--color-border', label: 'Default', defaultValue: 'var(--neutral-300)', type: 'color' },
      { name: '--color-border-strong', label: 'Strong', defaultValue: 'var(--neutral-400)', type: 'color' },
      { name: '--color-border-interactive', label: 'Interactive', defaultValue: 'var(--pink-500)', type: 'color' },
      { name: '--color-border-error', label: 'Error', defaultValue: 'var(--red-500)', type: 'color' },
      { name: '--color-border-success', label: 'Success', defaultValue: 'var(--green-500)', type: 'color' },
    ],
  },
  {
    label: 'Spacing',
    description: 'Spacing scale used for padding, margins, and gaps',
    tokens: [
      { name: '--spacing-01', label: 'spacing-01', defaultValue: '2px', type: 'size', unit: 'px', min: 0, max: 16, step: 1 },
      { name: '--spacing-02', label: 'spacing-02', defaultValue: '4px', type: 'size', unit: 'px', min: 0, max: 24, step: 1 },
      { name: '--spacing-02b', label: 'spacing-02b', defaultValue: '6px', type: 'size', unit: 'px', min: 0, max: 24, step: 1 },
      { name: '--spacing-03', label: 'spacing-03', defaultValue: '8px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--spacing-04', label: 'spacing-04', defaultValue: '12px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--spacing-05', label: 'spacing-05', defaultValue: '16px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--spacing-05b', label: 'spacing-05b', defaultValue: '20px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--spacing-06', label: 'spacing-06', defaultValue: '24px', type: 'size', unit: 'px', min: 0, max: 80, step: 1 },
      { name: '--spacing-07', label: 'spacing-07', defaultValue: '32px', type: 'size', unit: 'px', min: 0, max: 96, step: 1 },
      { name: '--spacing-08', label: 'spacing-08', defaultValue: '40px', type: 'size', unit: 'px', min: 0, max: 120, step: 1 },
      { name: '--spacing-09', label: 'spacing-09', defaultValue: '48px', type: 'size', unit: 'px', min: 0, max: 128, step: 1 },
      { name: '--spacing-10', label: 'spacing-10', defaultValue: '64px', type: 'size', unit: 'px', min: 0, max: 160, step: 1 },
      { name: '--spacing-16', label: 'spacing-16', defaultValue: '160px', type: 'size', unit: 'px', min: 0, max: 320, step: 4 },
    ],
  },
  {
    label: 'Border Radius',
    description: 'Corner rounding for cards, buttons, and inputs',
    tokens: [
      { name: '--radius-none', label: 'None', defaultValue: '0', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-sm', label: 'Small', defaultValue: '2px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-default', label: 'Default', defaultValue: '4px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-md', label: 'Medium', defaultValue: '6px', type: 'size', unit: 'px', min: 0, max: 32, step: 1 },
      { name: '--radius-lg', label: 'Large', defaultValue: '8px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--radius-xl', label: 'Extra Large', defaultValue: '12px', type: 'size', unit: 'px', min: 0, max: 48, step: 1 },
      { name: '--radius-2xl', label: '2XL', defaultValue: '16px', type: 'size', unit: 'px', min: 0, max: 64, step: 1 },
      { name: '--radius-full', label: 'Full', defaultValue: '9999px', type: 'size', unit: 'px', min: 0, max: 9999, step: 1 },
    ],
  },
  {
    label: 'Typography',
    description: 'Font sizes, weights, and line heights',
    tokens: [
      { name: '--font-size-xs', label: 'XS', defaultValue: '0.625rem', type: 'size', unit: 'rem', min: 0.5, max: 1, step: 0.0625 },
      { name: '--font-size-sm', label: 'SM', defaultValue: '0.75rem', type: 'size', unit: 'rem', min: 0.5, max: 1.5, step: 0.0625 },
      { name: '--font-size-md', label: 'MD', defaultValue: '0.875rem', type: 'size', unit: 'rem', min: 0.5, max: 2, step: 0.0625 },
      { name: '--font-size-base', label: 'Base', defaultValue: '1rem', type: 'size', unit: 'rem', min: 0.75, max: 2, step: 0.0625 },
      { name: '--font-size-lg', label: 'LG', defaultValue: '1.125rem', type: 'size', unit: 'rem', min: 0.75, max: 3, step: 0.0625 },
      { name: '--font-size-xl', label: 'XL', defaultValue: '1.25rem', type: 'size', unit: 'rem', min: 1, max: 4, step: 0.125 },
      { name: '--font-size-2xl', label: '2XL', defaultValue: '1.5rem', type: 'size', unit: 'rem', min: 1, max: 5, step: 0.125 },
      { name: '--font-weight-light', label: 'Light', defaultValue: '300', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-regular', label: 'Regular', defaultValue: '400', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-medium', label: 'Medium', defaultValue: '500', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-semibold', label: 'Semibold', defaultValue: '600', type: 'number', min: 100, max: 900, step: 100 },
      { name: '--font-weight-bold', label: 'Bold', defaultValue: '700', type: 'number', min: 100, max: 900, step: 100 },
    ],
  },
]
