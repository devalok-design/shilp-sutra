import React from 'react'
import type { Preview, Decorator } from '@storybook/react'
import { TooltipProvider } from '../packages/core/src/ui/tooltip'
import theme from './theme'
import '../packages/core/src/tokens/index.css'
import '../storybook.css'

const withThemeToggle: Decorator = (Story, context) => {
  const selectedTheme = (context.globals.theme as string) || 'light'
  const isDark = selectedTheme === 'dark'

  // Toggle .dark on html AND body in the preview iframe
  React.useEffect(() => {
    const html = document.documentElement
    const body = document.body
    if (isDark) {
      html.classList.add('dark')
      body.classList.add('dark')
    } else {
      html.classList.remove('dark')
      body.classList.remove('dark')
    }
  }, [isDark])

  return React.createElement(
    TooltipProvider,
    null,
    React.createElement(
      'div',
      {
        className: isDark ? 'dark story-surface' : 'story-surface',
        style: { background: 'var(--color-background)', padding: '2rem', borderRadius: '8px' },
      },
      React.createElement(Story)
    )
  )
}

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Toggle light / dark mode',
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
    docs: { theme },
    options: {
      storySort: {
        order: [
          'Getting Started',
          'About',
          'Foundations',
          'Iconography',
          'UI', [
            'Introduction',
            'Core',
            'Form Controls',
            'Data Display',
            'Feedback',
            'Navigation',
            'Other',
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
            'CustomButtons',
            'Admin',
            'Other',
            '*',
          ],
        ],
      },
    },
  },
}

export default preview
