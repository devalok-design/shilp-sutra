import React from 'react'
import type { Preview } from '@storybook/react'
import theme from './theme'
import '../src/tokens/index.css'
import '../storybook.css'

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        { className: 'story-surface', style: { background: 'var(--color-background)', padding: '2rem', borderRadius: '8px' } },
        React.createElement(Story)
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
          'Foundations',
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
          'Shared', ['Introduction', '*'],
          'Layout', ['Introduction', '*'],
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
