import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { Alert } from './alert'

const meta: Meta<typeof Alert> = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Alert>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational alert with helpful context.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    children: 'Your changes have been saved successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Your session will expire in 5 minutes. Save your work.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'Failed to save changes. Please try again.',
  },
}

export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    children: 'This alert has no title, just a message.',
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissible Alert',
    children: 'You can dismiss this alert by clicking the X button.',
    dismissible: true,
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
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">With Title</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={variant} variant={variant} title={variant.charAt(0).toUpperCase() + variant.slice(1)}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Without Title</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={`no-title-${variant}`} variant={variant}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Dismissible</p>
          <div className="flex flex-col gap-ds-03">
            {variants.map((variant) => (
              <Alert key={`dismiss-${variant}`} variant={variant} title={variant.charAt(0).toUpperCase() + variant.slice(1)} dismissible onDismiss={() => {}}>
                {messages[variant]}
              </Alert>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
