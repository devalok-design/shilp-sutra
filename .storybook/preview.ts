import type { Preview } from '@storybook/react'
import '../src/tokens/index.css'
import '../storybook.css'

const preview: Preview = {
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
      darkClass: 'dark',
      lightClass: '',
      stylePreview: true,
      classTarget: 'html',
    },
  },
}

export default preview
