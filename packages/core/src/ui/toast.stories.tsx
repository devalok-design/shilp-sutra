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
    color: {
      control: 'select',
      options: ['neutral', 'success', 'warning', 'error', 'info'],
    },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
        <ToastViewport className="relative top-auto right-auto bottom-auto left-auto flex w-full max-w-[420px] flex-col gap-ds-03 p-0" />
      </ToastProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof Toast>

export const Default: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-ds-02">
        <ToastTitle>Notification</ToastTitle>
        <ToastDescription>Your changes have been saved.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Notification')).toBeVisible()
    await expect(
      canvas.getByText('Your changes have been saved.'),
    ).toBeVisible()
    const closeButton = canvas.getByRole('button')
    await expect(closeButton).toBeVisible()
  },
}

export const Success: Story = {
  render: () => (
    <Toast color="success" open>
      <div className="grid gap-ds-02">
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>Operation completed successfully.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Success')).toBeVisible()
  },
}

export const Warning: Story = {
  render: () => (
    <Toast color="warning" open>
      <div className="grid gap-ds-02">
        <ToastTitle>Warning</ToastTitle>
        <ToastDescription>Please review before proceeding.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Warning')).toBeVisible()
  },
}

export const Error: Story = {
  render: () => (
    <Toast color="error" open>
      <div className="grid gap-ds-02">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>
          Something went wrong. Please try again.
        </ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Error')).toBeVisible()
  },
}

export const Info: Story = {
  render: () => (
    <Toast color="info" open>
      <div className="grid gap-ds-02">
        <ToastTitle>Information</ToastTitle>
        <ToastDescription>A new update is available.</ToastDescription>
      </div>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Information')).toBeVisible()
  },
}

export const WithAction: Story = {
  render: () => (
    <Toast open>
      <div className="grid gap-ds-02">
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
    await expect(
      canvas.getByText('Devsabha starts in 15 minutes.'),
    ).toBeVisible()
    const actionButton = canvas.getByRole('button', { name: /join/i })
    await expect(actionButton).toBeVisible()
  },
}

export const ErrorWithAction: Story = {
  render: () => (
    <Toast color="error" open>
      <div className="grid gap-ds-02">
        <ToastTitle>Deletion Failed</ToastTitle>
        <ToastDescription>
          Could not delete the project. Try again?
        </ToastDescription>
      </div>
      <ToastAction altText="Try again">Retry</ToastAction>
      <ToastClose />
    </Toast>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByText('Deletion Failed')).toBeVisible()
    const retryButton = canvas.getByRole('button', { name: /retry/i })
    await expect(retryButton).toBeVisible()
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <Toast open color="neutral">
        <div className="grid gap-ds-02">
          <ToastTitle>Default</ToastTitle>
          <ToastDescription>Standard notification message.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open color="success">
        <div className="grid gap-ds-02">
          <ToastTitle>Success</ToastTitle>
          <ToastDescription>
            Operation completed successfully.
          </ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open color="warning">
        <div className="grid gap-ds-02">
          <ToastTitle>Warning</ToastTitle>
          <ToastDescription>Please review before proceeding.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open color="error">
        <div className="grid gap-ds-02">
          <ToastTitle>Error</ToastTitle>
          <ToastDescription>Error notification message.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <Toast open color="info">
        <div className="grid gap-ds-02">
          <ToastTitle>Info</ToastTitle>
          <ToastDescription>Informational notification.</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
    </div>
  ),
}
