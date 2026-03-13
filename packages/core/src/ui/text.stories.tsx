import type { Meta, StoryObj } from '@storybook/react'
import { Text } from './text'

const meta = {
  title: 'UI/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'heading-2xl', 'heading-xl', 'heading-lg', 'heading-md', 'heading-sm', 'heading-xs',
        'body-lg', 'body-md', 'body-sm', 'body-xs',
        'label-lg', 'label-md', 'label-sm', 'label-xs',
        'caption', 'overline',
      ],
    },
    as: {
      control: 'select',
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'label'],
    },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-05">
      <Text variant="heading-2xl">Heading 2XL (h1)</Text>
      <Text variant="heading-xl">Heading XL (h2)</Text>
      <Text variant="heading-lg">Heading LG (h3)</Text>
      <Text variant="heading-md">Heading MD (h4)</Text>
      <Text variant="heading-sm">Heading SM (h5)</Text>
      <Text variant="heading-xs">Heading XS (h6)</Text>
      <hr className="border-surface-border" />
      <Text variant="body-lg">Body LG — 16px primary body text for reading</Text>
      <Text variant="body-md">Body MD — 14px default body text for UI</Text>
      <Text variant="body-sm">Body SM — 12px secondary text and captions</Text>
      <Text variant="body-xs">Body XS — 10px fine print</Text>
      <hr className="border-surface-border" />
      <Text variant="label-lg">Label LG</Text>
      <Text variant="label-md">Label MD</Text>
      <Text variant="label-sm">Label SM</Text>
      <Text variant="label-xs">Label XS</Text>
      <hr className="border-surface-border" />
      <Text variant="caption">Caption text</Text>
      <Text variant="overline">Overline text</Text>
    </div>
  ),
}

export const CustomElement: Story = {
  args: {
    variant: 'heading-lg',
    as: 'span',
    children: 'H3 styles on a <span>',
  },
}

export const WithColor: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-03">
      <Text variant="heading-sm" className="text-surface-fg">Primary heading</Text>
      <Text variant="body-md" className="text-surface-fg-muted">Secondary body text</Text>
      <Text variant="body-sm" className="text-surface-fg-subtle">Tertiary small text</Text>
      <Text variant="body-md" className="text-accent-11">Brand colored text</Text>
      <Text variant="body-md" className="text-error-11">Error text</Text>
    </div>
  ),
}
