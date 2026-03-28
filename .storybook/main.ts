import type { StorybookConfig } from '@storybook/react-vite'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  stories: [
    '../packages/*/src/**/*.stories.@(js|jsx|ts|tsx)',
    '../packages/*/src/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-vitest',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-a11y',
    'storybook-dark-mode',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: '.storybook/vite.config.ts',
      },
    },
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  staticDirs: ['../packages/core/fonts'],
  tags: {
    deprecated: { defaultFilterSelection: 'exclude' },
    internal: { defaultFilterSelection: 'exclude' },
  },
}

export default config
