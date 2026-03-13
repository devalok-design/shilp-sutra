import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'solid', 'outline'],
    },
    color: {
      control: 'select',
      options: [
        'default',
        'info',
        'success',
        'error',
        'warning',
        'brand',
        'accent',
        'teal',
        'amber',
        'slate',
        'indigo',
        'cyan',
        'orange',
        'emerald',
      ],
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    dot: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Info: Story = {
  args: {
    color: 'info',
    children: 'In Progress',
  },
}

export const Success: Story = {
  args: {
    color: 'success',
    children: 'Completed',
  },
}

export const Error: Story = {
  args: {
    color: 'error',
    children: 'Urgent',
  },
}

export const Warning: Story = {
  args: {
    color: 'warning',
    children: 'Pending',
  },
}

export const Brand: Story = {
  args: {
    color: 'brand',
    children: 'Review',
  },
}

export const Accent: Story = {
  args: {
    color: 'accent',
    children: 'Design',
  },
}

export const WithDot: Story = {
  args: {
    color: 'success',
    dot: true,
    children: 'Active',
  },
}

export const Dismissible: Story = {
  args: {
    color: 'info',
    children: 'Tag',
    onDismiss: () => {},
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const AllVariants: Story = {
  render: () => {
    const colors = ['default', 'info', 'success', 'error', 'warning', 'brand', 'accent', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'] as const
    const variants = ['subtle', 'solid', 'outline'] as const
    const sizes = ['sm', 'md', 'lg'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        {variants.map((variant) => (
          <div key={variant}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">Variant: {variant}</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {colors.map((color) => (
                <Badge key={`${variant}-${color}`} variant={variant} color={color} size="md">{color}</Badge>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Sizes (subtle)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {sizes.map((size) => (
              <Badge key={size} size={size}>{size}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">With Dot</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {colors.map((color) => (
              <Badge key={`dot-${color}`} color={color} dot>{color}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Dismissible</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {colors.map((color) => (
              <Badge key={`dismiss-${color}`} color={color} onDismiss={() => {}}>{color}</Badge>
            ))}
          </div>
        </div>
      </div>
    )
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-03">
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
}

export const WithDots: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-ds-02">
      <Badge color="success" dot>Online</Badge>
      <Badge color="warning" dot>Away</Badge>
      <Badge color="error" dot>Busy</Badge>
      <Badge dot>Offline</Badge>
    </div>
  ),
}
