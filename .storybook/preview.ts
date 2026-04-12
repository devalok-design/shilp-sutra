import React from 'react'
import { definePreview } from '@storybook/react-vite'
import { parameters as docsParameters } from '@storybook/addon-docs/preview'
import { TooltipProvider } from '../packages/core/src/ui/tooltip'
import theme from './theme'
import '../packages/core/src/tokens/index.css'
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
          'About',
          'Foundations', [
            'Motion',
            'Motion Overview',
            'Motion Primitives',
            'Motion Showcase',
          ],
          'Iconography',
          'Guides', [
            'Import Paths',
            'Coming from shadcn',
          ],
          'UI', [
            'Introduction',
            'Core', [
              'Button',
              'ButtonGroup',
              'ButtonProcessing',
              'SplitButton',
              'Badge',
              'BadgeGroup',
              'BadgeIndicator',
              'Toggle',
              'ToggleGroup',
              'Icon',
              'IconButton',
              'IconGroup',
              'Avatar',
              'AvatarGroup',
              '*',
            ],
            'Layout',
            'Form Controls',
            'Data Display', [
              'DataTable',
              'DataTableToolbar',
              '*',
            ],
            'Navigation',
            'Feedback',
            'Charts',
            '*',
          ],
          'Composed', ['Introduction', '*'],
          'Shell', ['Introduction', '*'],
          'Brand', [
            'Introduction',
            'Devalok', ['Logo'],
          ],
          'Changelog',
        ],
      },
    },
  },
})

export default preview
