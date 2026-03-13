import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { Chip } from './chip'

const meta: Meta<typeof Chip> = {
  title: 'UI/Data Display/Chip',
  component: Chip,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['subtle', 'outline'],
      description: 'Shape: subtle (surface bg) or outline (border only)',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'success', 'error', 'warning', 'info', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'],
      description: 'Intent/category color. Use color= on Chip (vs variant= on Badge)',
    },
    label: {
      control: 'text',
      description: 'Text label — use this, not children',
    },
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

export const SubtlePrimary: Story = {
  args: {
    label: 'Primary',
    variant: 'subtle',
    color: 'primary',
  },
}

export const OutlinePrimary: Story = {
  args: {
    label: 'Primary',
    variant: 'outline',
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
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Click the chip
    const chip = canvas.getByRole('button', { name: /click me/i })
    await userEvent.click(chip)

    // Verify onClick was called
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Dismissible: Story = {
  args: {
    label: 'Dismissible',
    onDismiss: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Verify the chip and its dismiss button are visible
    await expect(canvas.getByText('Dismissible')).toBeVisible()
    const dismissButton = canvas.getByRole('button', { name: /remove dismissible/i })
    await expect(dismissButton).toBeVisible()

    // Click the dismiss button
    await userEvent.click(dismissButton)

    // Verify onDismiss was called
    await expect(args.onDismiss).toHaveBeenCalledTimes(1)
  },
}

export const DismissiblePrimary: Story = {
  args: {
    label: 'Remove me',
    color: 'primary',
    onDismiss: () => {},
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

const variants = ['subtle', 'outline'] as const
const sizes = ['sm', 'md', 'lg'] as const
const colors = ['default', 'primary', 'success', 'error', 'warning', 'info', 'teal', 'amber', 'slate', 'indigo', 'cyan', 'orange', 'emerald'] as const

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-06">
      {variants.map((variant) => (
        <div key={variant}>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted capitalize">
            {variant}
          </p>
          <div className="flex flex-col gap-ds-04">
            {sizes.map((size) => (
              <div key={size} className="flex flex-wrap items-center gap-ds-03">
                <span className="w-8 text-ds-xs text-surface-fg-muted">{size}</span>
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
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Dismissible</p>
        <div className="flex flex-wrap items-center gap-ds-03">
          {colors.map((color) => (
            <Chip
              key={`dismiss-${color}`}
              label={color}
              color={color}
              onDismiss={() => {}}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Disabled</p>
        <div className="flex flex-wrap items-center gap-ds-03">
          <Chip label="Subtle" variant="subtle" color="primary" disabled onClick={() => {}} />
          <Chip label="Outline" variant="outline" color="primary" disabled onClick={() => {}} />
        </div>
      </div>
    </div>
  ),
}
