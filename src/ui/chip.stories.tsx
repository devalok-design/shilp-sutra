import type { Meta, StoryObj } from '@storybook/react'
import { Chip } from './chip'

const meta: Meta<typeof Chip> = {
  title: 'UI/Data Display/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'success', 'error', 'warning'],
    },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Chip>

export const Default: Story = {
  args: {
    label: 'Chip',
  },
}

export const FilledPrimary: Story = {
  args: {
    label: 'Primary',
    variant: 'filled',
    color: 'primary',
  },
}

export const OutlinedPrimary: Story = {
  args: {
    label: 'Primary',
    variant: 'outlined',
    color: 'primary',
  },
}

export const Small: Story = {
  args: {
    label: 'Small',
    size: 'sm',
  },
}

export const Clickable: Story = {
  args: {
    label: 'Click me',
    color: 'primary',
    onClick: () => {},
  },
}

export const Dismissible: Story = {
  args: {
    label: 'Dismissible',
    onDelete: () => {},
  },
}

export const DismissiblePrimary: Story = {
  args: {
    label: 'Remove me',
    color: 'primary',
    onDelete: () => {},
  },
}

export const WithIcon: Story = {
  args: {
    label: 'With icon',
    color: 'success',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
}

export const Disabled: Story = {
  args: {
    label: 'Disabled',
    disabled: true,
    onClick: () => {},
  },
}

const variants = ['filled', 'outlined'] as const
const sizes = ['sm', 'md'] as const
const colors = ['default', 'primary', 'success', 'error', 'warning'] as const

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {variants.map((variant) => (
        <div key={variant}>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary capitalize">
            {variant}
          </p>
          <div className="flex flex-col gap-ds-04">
            {sizes.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-ds-03">
                <span className="w-8 text-ds-xs text-text-secondary">{size}</span>
                {colors.map((color) => (
                  <Chip
                    key={`${variant}-${size}-${color}`}
                    label={color}
                    variant={variant}
                    size={size}
                    color={color}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Dismissible</p>
        <div className="flex flex-wrap items-center gap-ds-03">
          {colors.map((color) => (
            <Chip
              key={`dismiss-${color}`}
              label={color}
              color={color}
              onDelete={() => {}}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Disabled</p>
        <div className="flex flex-wrap items-center gap-ds-03">
          <Chip label="Filled" variant="filled" color="primary" disabled onClick={() => {}} />
          <Chip label="Outlined" variant="outlined" color="primary" disabled onClick={() => {}} />
        </div>
      </div>
    </div>
  ),
}
