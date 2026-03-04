import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast'

const meta: Meta<typeof Toast> = {
  title: 'UI/Feedback/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'error', 'info'],
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport />
      </ToastProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Your changes have been saved.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Notification')).toBeVisible()
    await expect(canvas.getByText('Your changes have been saved.')).toBeVisible()
    const closeButton = canvas.getByRole('button')
    await expect(closeButton).toBeVisible()
  },
}

export const Error: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast variant="error" open>
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const Success: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast variant="success" open>
      <div className="grid gap-1">
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>Operation completed successfully.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const Warning: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast variant="warning" open>
      <div className="grid gap-1">
        <ToastTitle>Warning</ToastTitle>
        <ToastDescription>Please review before proceeding.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const Info: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast variant="info" open>
      <div className="grid gap-1">
        <ToastTitle>Information</ToastTitle>
        <ToastDescription>A new update is available.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const WithAction: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast open>
      <div className="grid gap-1">
        <ToastTitle>Meeting Reminder</ToastTitle>
        <ToastDescription>Devsabha starts in 15 minutes.</ToastDescription>
      </div>
      <ToastAction altText="Join now">Join</ToastAction>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Meeting Reminder')).toBeVisible()
    await expect(canvas.getByText('Devsabha starts in 15 minutes.')).toBeVisible()
    const actionButton = canvas.getByRole('button', { name: /join/i })
    await expect(actionButton).toBeVisible()
  },
}

export const ErrorWithAction: Story = {
  tags: ['!autodocs'],
  render: () => (
    <Toast variant="error" open>
      <div className="grid gap-1">
        <ToastTitle>Deletion Failed</ToastTitle>
        <ToastDescription>Could not delete the project. Try again?</ToastDescription>
      </div>
      <ToastAction altText="Try again">Retry</ToastAction>
      <ToastClose />
    </Toast>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Toast open variant="default" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Default</ToastTitle>
          <ToastDescription>Standard notification message.</ToastDescription>
        </div>
      </Toast>
      <Toast open variant="success" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Success</ToastTitle>
          <ToastDescription>Operation completed successfully.</ToastDescription>
        </div>
      </Toast>
      <Toast open variant="warning" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Warning</ToastTitle>
          <ToastDescription>Please review before proceeding.</ToastDescription>
        </div>
      </Toast>
      <Toast open variant="error" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>Error notification message.</ToastDescription>
        </div>
      </Toast>
      <Toast open variant="info" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Info</ToastTitle>
          <ToastDescription>Informational notification.</ToastDescription>
        </div>
      </Toast>
    </div>
  ),
}
