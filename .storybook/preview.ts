import React from 'react'
import type { Preview } from '@storybook/react'
import type { Decorator } from '@storybook/react'
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

const withThemeToggle: Decorator = (Story, context) => {
  const selectedTheme = (context.globals.theme as string) || 'light'

  return React.createElement(
    ThemeWrapper,
    { theme: selectedTheme },
    React.createElement(Story)
  )
}

const preview: Preview = {
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
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    withThemeToggle,
    (Story) =>
      React.createElement(
        TooltipProvider,
        null,
        React.createElement(
          'div',
          { className: 'story-surface', style: { background: 'var(--color-surface-1)', padding: '2rem', borderRadius: '8px' } },
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
    docs: { theme },
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
            'Core',
            'Layout',
            'Form Controls',
            'Data Display',
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
            'Karm', ['Logo'],
          ],
          'Karm', [
            'Introduction',
            'Board',
            'Tasks',
            'Chat',
            'Dashboard',
            'Client',
            'Admin',
            '*',
          ],
          'Changelog',
        ],
      },
    },
  },
}

export default preview
