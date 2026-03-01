import React from 'react'
import type { Preview } from '@storybook/react'
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
  },
}

export default preview
