import type { Meta, StoryObj } from '@storybook/react'
import { Link } from './link'

const meta: Meta<typeof Link> = {
  title: 'UI/Core/Link',
  component: Link,
  tags: ['autodocs'],
  argTypes: {
    inline: { control: 'boolean' },
    href: { control: 'text' },
    target: {
      control: 'select',
      options: ['_self', '_blank'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Link>

export const Default: Story = {
  args: {
    href: '#',
    children: 'Click here',
  },
}

export const Inline: Story = {
  render: () => (
    <p className="text-sm">
      Read our <Link href="#">terms of service</Link> and{' '}
      <Link href="#">privacy policy</Link> before continuing.
    </p>
  ),
}

export const Block: Story = {
  args: {
    href: '#',
    inline: false,
    children: 'View all projects',
  },
}

export const ExternalLink: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'External link (opens in new tab)',
  },
}

export const InParagraph: Story = {
  render: () => (
    <p className="text-sm max-w-md text-text-secondary">
      For more information about the Devalok design system, visit our{' '}
      <Link href="#">documentation</Link>. If you have questions, reach out
      on <Link href="#">Slack</Link> or file an{' '}
      <Link href="#">issue on GitHub</Link>.
    </p>
  ),
}
