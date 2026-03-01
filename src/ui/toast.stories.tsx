import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
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
      options: ['default', 'destructive', 'karam'],
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
    // Verify the toast is visible with its title and description
    await expect(canvas.getByText('Notification')).toBeVisible()
    await expect(canvas.getByText('Your changes have been saved.')).toBeVisible()
    // Verify the close button is present
    const closeButton = canvas.getByRole('button')
    await expect(closeButton).toBeVisible()
  },
}

export const Destructive: Story = {
  render: () => (
    <Toast variant="destructive" open>
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>Something went wrong. Please try again.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const Karam: Story = {
  render: () => (
    <Toast variant="karam" open>
      <div className="grid gap-1">
        <ToastTitle>Task Updated</ToastTitle>
        <ToastDescription>The task was moved to "In Progress".</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
}

export const WithAction: Story = {
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
}

export const DestructiveWithAction: Story = {
  render: () => (
    <Toast variant="destructive" open>
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
      <Toast open variant="destructive" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Destructive</ToastTitle>
          <ToastDescription>Error notification message.</ToastDescription>
        </div>
      </Toast>
      <Toast open variant="karam" className="relative static">
        <div className="grid gap-1">
          <ToastTitle>Karam</ToastTitle>
          <ToastDescription>Karm-style notification message.</ToastDescription>
        </div>
      </Toast>
    </div>
  ),
}
