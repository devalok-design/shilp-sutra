import type { Meta, StoryObj } from '@storybook/react'
import { IconBold } from '@tabler/icons-react'
import { Toggle } from './toggle'

const meta: Meta<typeof Toggle> = {
  title: 'UI/Form Controls/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Toggle>

export const Default: Story = {
  args: {
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const WithIcon: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <IconBold className="h-4 w-4" />
    </Toggle>
  ),
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'B',
    'aria-label': 'Toggle bold',
  },
}

export const AllVariants: Story = {
  render: () => {
    const variants = ['default', 'outline'] as const
    const sizes = ['sm', 'md', 'lg'] as const

    return (
      <div className="flex flex-col gap-ds-06">
        {variants.map((variant) => (
          <div key={variant}>
            <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">{variant}</p>
            <div className="flex flex-wrap items-center gap-ds-03">
              {sizes.map((size) => (
                <Toggle key={`${variant}-${size}`} variant={variant} size={size} aria-label={`Toggle ${variant} ${size}`}>
                  {size.toUpperCase()}
                </Toggle>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Pressed (on)</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((variant) =>
              sizes.map((size) => (
                <Toggle key={`pressed-${variant}-${size}`} variant={variant} size={size} defaultPressed aria-label={`Toggle pressed ${variant} ${size}`}>
                  {size.toUpperCase()}
                </Toggle>
              ))
            )}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Disabled</p>
          <div className="flex flex-wrap items-center gap-ds-03">
            {variants.map((variant) =>
              sizes.map((size) => (
                <Toggle key={`disabled-${variant}-${size}`} variant={variant} size={size} disabled aria-label={`Toggle disabled ${variant} ${size}`}>
                  {size.toUpperCase()}
                </Toggle>
              ))
            )}
          </div>
        </div>
      </div>
    )
  },
}
