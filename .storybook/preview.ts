import React from 'react'
import { definePreview } from '@storybook/react-vite'
import { parameters as docsParameters } from '@storybook/addon-docs/preview'
import { TooltipProvider } from '../packages/core/src/ui/tooltip'
import theme from './theme'
// Single CSS entry — storybook.css @imports tailwindcss + shilp-sutra.css
// (our TW4-native token bundle). The legacy tokens/index.css import that
// used to live here was removed in 0.37 (avoided double-loading tokens).
import '../storybook.css'

/* ── Dark-mode toolbar decorator ──────────────────────────────────
   Toggles the `.dark` class on <html> based on the toolbar selection.
   Works alongside the storybook-dark-mode addon, which handles the
   Storybook UI chrome theme.  This decorator controls the *preview*
   iframe so components render with the correct CSS custom-property set. */
function ThemeWrapper({ theme: selectedTheme, children }: { theme: string; children: React.ReactNode }) {
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', selectedTheme === 'dark')
    return () => {
      document.documentElement.classList.remove('dark')
    }
  }, [selectedTheme])

  return React.createElement(React.Fragment, null, children)
}

const withThemeToggle = (Story: any, context: any) => {
  const selectedTheme = (context.globals.theme as string) || 'light'

  return React.createElement(
    ThemeWrapper,
    { theme: selectedTheme },
    React.createElement(Story)
  )
}

/* ── Viewport toolbar decorator ──────────────────────────────────
   Constrains the story container width to simulate common device sizes.
   Controlled via the viewport toolbar global. */
const viewportSizes: Record<string, string | undefined> = {
  responsive: undefined,
  mobile: '375px',
  tablet: '768px',
  desktop: '1280px',
}

const withViewport = (Story: any, context: any) => {
  const viewport = context.globals.viewport as string
  const width = viewportSizes[viewport]

  if (!width) return React.createElement(Story)

  return React.createElement(
    'div',
    { style: { width, margin: '0 auto' } },
    React.createElement(Story)
  )
}

export const preview = definePreview({
  addons: [],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Toggle light / dark mode for component preview',
      toolbar: {
        icon: 'sun',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
    viewport: {
      name: 'Viewport',
      description: 'Preview viewport size',
      toolbar: {
        icon: 'mobile',
        items: [
          { value: 'responsive', title: 'Responsive' },
          { value: 'mobile', title: 'Mobile (375px)' },
          { value: 'tablet', title: 'Tablet (768px)' },
          { value: 'desktop', title: 'Desktop (1280px)' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    viewport: 'responsive',
  },
  decorators: [
    withViewport,
    withThemeToggle,
    (Story: any) =>
      React.createElement(
        TooltipProvider,
        null,
        React.createElement(
          'div',
          { className: 'story-surface', style: { background: 'var(--color-surface-base)', padding: '2rem', borderRadius: '8px' } },
          React.createElement(Story)
        )
      ),
  ],
  parameters: {
    backgrounds: { disable: true },
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    darkMode: {
      darkClass: ['dark'],
      lightClass: [],
      stylePreview: true,
      classTarget: 'html',
    },
    docs: { ...docsParameters.docs, theme },
    options: {
      storySort: {
        order: [
          'Getting Started',
          'Foundations', [
            'Color',
            'Typography',
            'Spacing',
            'Surfaces & Elevation',
            'Motion',
            'Motion Overview',
            'Motion Primitives',
            'Motion Showcase',
            'Iconography',
          ],
          'Components', [
            'Buttons', ['Button', 'IconButton', 'SplitButton', 'ButtonGroup', 'Toggle', 'ToggleGroup', 'SegmentedControl'],
            'Inputs', ['Input', 'Textarea', 'SearchInput', 'NumberInput', 'ColorInput', 'ColorSwatch', 'InputOTP', 'Slider', 'Switch', 'Checkbox', 'Radio'],
            'Selectors', ['Select', 'Combobox', 'Autocomplete', '*'],
            'Typography',
            'Layout',
            'Data Display',
            'Navigation',
            'Feedback',
            'Overlays',
            'Forms',
            'Charts',
            'Chat',
          ],
          'Patterns',
          'Shell',
          'AI',
          'Hooks',
          'Utilities',
          'Brand',
          'Changelog',
        ],
      },
    },
  },
})

export default preview
