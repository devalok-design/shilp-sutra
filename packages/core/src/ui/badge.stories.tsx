import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta: Meta<typeof Badge> = {
  title: 'UI/Data Display/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'neutral',
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
    variant: 'info',
    children: 'In Progress',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Completed',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Urgent',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Pending',
  },
}

export const Brand: Story = {
  args: {
    variant: 'brand',
    children: 'Review',
  },
}

export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Design',
  },
}

export const WithDot: Story = {
  args: {
    variant: 'success',
    dot: true,
    children: 'Active',
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'info',
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
    const variants = ['neutral', 'info', 'success', 'error', 'warning', 'brand', 'accent', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'] as const
    const sizes = ['sm', 'md', 'lg'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        {sizes.map((size) => (
          <div key={size}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary capitalize">Size: {size}</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {variants.map((variant) => (
                <Badge key={`${size}-${variant}`} variant={variant} size={size}>{variant}</Badge>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">With Dot</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((variant) => (
              <Badge key={`dot-${variant}`} variant={variant} dot>{variant}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Dismissible</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((variant) => (
              <Badge key={`dismiss-${variant}`} variant={variant} onDismiss={() => {}}>{variant}</Badge>
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
      <Badge variant="success" dot>Online</Badge>
      <Badge variant="warning" dot>Away</Badge>
      <Badge variant="error" dot>Busy</Badge>
      <Badge variant="neutral" dot>Offline</Badge>
    </div>
  ),
}
