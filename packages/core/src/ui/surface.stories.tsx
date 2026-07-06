import type { Meta, StoryObj } from '@storybook/react-vite'

import { Surface } from './surface'

const meta: Meta<typeof Surface> = {
  title: 'Components/Layout/Surface',
  component: Surface,
  tags: ['autodocs', 'stable'],
  argTypes: {
    elevation: {
      control: 'select',
      options: ['flat', 'raised', 'floating', 'overlay'],
    },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
    radius: {
      control: 'select',
      options: ['none', 'control', 'surface', 'overlay', 'pill'],
    },
    bordered: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The low-level elevated container. Owns background + shadow + radius + optional padding/border only. Card, Popover, Toast, and friends compose it. Use a shadow OR a bordered flat — never both.',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof Surface>

export const Default: Story = {
  args: { elevation: 'raised', padding: 'md' },
  render: (args) => <Surface {...args}>Surface</Surface>,
}

export const Elevations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-ds-06 bg-surface-base p-ds-06">
      {(['flat', 'raised', 'floating', 'overlay'] as const).map((e) => (
        <Surface
          key={e}
          elevation={e}
          padding="md"
          bordered={e === 'flat'}
          className="w-40 text-center text-ds-sm text-surface-fg-subtle"
        >
          {e}
        </Surface>
      ))}
    </div>
  ),
}

export const Padding: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-ds-05">
      {(['none', 'sm', 'md', 'lg'] as const).map((p) => (
        <Surface key={p} elevation="raised" padding={p}>
          <span className="rounded-control-inner bg-accent-3 px-ds-02 py-ds-01 text-ds-sm text-accent-11">
            {p}
          </span>
        </Surface>
      ))}
    </div>
  ),
}

export const BorderedFlat: Story = {
  name: 'Bordered (flat, on-page tile)',
  args: { elevation: 'flat', bordered: true, padding: 'md' },
  render: (args) => (
    <div className="bg-surface-base p-ds-06">
      <Surface {...args} className="w-48">
        On-page tile — border-led, no shadow.
      </Surface>
    </div>
  ),
}

export const AsChildLink: Story = {
  name: 'asChild (renders as a link)',
  render: () => (
    <Surface asChild elevation="raised" padding="md" className="block w-56 no-underline">
      <a href="#upgrade">
        <span className="text-ds-sm font-semibold text-surface-fg">Upgrade to Pro</span>
        <span className="mt-ds-01 block text-ds-sm text-surface-fg-subtle">
          The whole surface is the link.
        </span>
      </a>
    </Surface>
  ),
}
