import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './container'

const meta: Meta<typeof Container> = {
  title: 'UI/Layout/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    maxWidth: {
      control: 'select',
      options: ['default', 'body', 'full'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Container>

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-ds-md border border-dashed border-border bg-layer-02 px-ds-05 py-ds-06 text-center text-ds-sm text-text-secondary">
    {label}
  </div>
)

export const Default: Story = {
  args: {
    maxWidth: 'default',
    children: <Placeholder label="max-w: default (layout)" />,
  },
}

export const Body: Story = {
  args: {
    maxWidth: 'body',
    children: <Placeholder label="max-w: body (layout-body)" />,
  },
}

export const Full: Story = {
  args: {
    maxWidth: 'full',
    children: <Placeholder label="max-w: full" />,
  },
}

export const AsSection: Story = {
  args: {
    as: 'section',
    maxWidth: 'default',
    children: <Placeholder label="Rendered as <section>" />,
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {(['default', 'body', 'full'] as const).map((maxWidth) => (
        <div key={maxWidth}>
          <p className="mb-ds-02 text-ds-sm font-semibold text-text-secondary">
            maxWidth: {maxWidth}
          </p>
          <div className="rounded-ds-md border border-border bg-layer-01">
            <Container maxWidth={maxWidth}>
              <div className="rounded-ds-md border border-dashed border-border-interactive bg-layer-02 px-ds-05 py-ds-04 text-center text-ds-sm text-text-primary">
                Container content ({maxWidth})
              </div>
            </Container>
          </div>
        </div>
      ))}
    </div>
  ),
}
