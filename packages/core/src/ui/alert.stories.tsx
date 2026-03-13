import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { Alert } from './alert'

const meta: Meta<typeof Alert> = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'neutral'],
    },
    title: { control: 'text' },
  },
}
export default meta
type Story = StoryObj<typeof Alert>

export const Info: Story = {
  args: {
    color: 'info',
    title: 'Information',
    children: 'This is an informational alert with helpful context.',
  },
}

export const Success: Story = {
  args: {
    color: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
}

export const Warning: Story = {
  args: {
    color: 'warning',
    title: 'Warning',
    children: 'Your session will expire in 5 minutes. Save your work.',
  },
}

export const Error: Story = {
  args: {
    color: 'error',
    title: 'Error',
    children: 'Failed to save changes. Please try again.',
  },
}

export const WithoutTitle: Story = {
  args: {
    color: 'info',
    children: 'This alert has no title, just a message.',
  },
}

export const Dismissible: Story = {
  args: {
    color: 'warning',
    title: 'Dismissible Alert',
    children: 'You can dismiss this alert by clicking the X button.',
    onDismiss: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)

    // Verify the alert content is visible
    await expect(canvas.getByText('Dismissible Alert')).toBeVisible()
    await expect(canvas.getByText('You can dismiss this alert by clicking the X button.')).toBeVisible()

    // Click the dismiss button
    const dismissButton = canvas.getByRole('button', { name: /dismiss/i })
    await expect(dismissButton).toBeVisible()
    await userEvent.click(dismissButton)

    // Verify onDismiss was called
    await expect(args.onDismiss).toHaveBeenCalledTimes(1)
  },
}

export const AllVariants: Story = {
  render: () => {
    const variants = ['info', 'success', 'warning', 'error'] as const
    const messages: Record<typeof variants[number], string> = {
      info: 'A new version of the platform is available.',
      success: 'Attendance marked successfully for today.',
      warning: 'You have 2 pending break requests to review.',
      error: 'Could not connect to the database. Retrying...',
    }

    return (
      <div className="flex flex-col gap-ds-06 max-w-lg">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">With Title</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={variant} color={variant} title={variant.charAt(0).toUpperCase() + variant.slice(1)}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Without Title</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={`no-title-${variant}`} color={variant}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Dismissible</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={`dismiss-${variant}`} color={variant} title={variant.charAt(0).toUpperCase() + variant.slice(1)} onDismiss={() => {}}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
