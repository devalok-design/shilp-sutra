import type { Meta, StoryObj } from '@storybook/react'
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
    onDismiss: () => {},
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-lg">
      <Alert variant="info" title="Info">
        A new version of the platform is available.
      </Alert>
      <Alert variant="success" title="Success">
        Attendance marked successfully for today.
      </Alert>
      <Alert variant="warning" title="Warning">
        You have 2 pending break requests to review.
      </Alert>
      <Alert variant="error" title="Error">
        Could not connect to the database. Retrying...
      </Alert>
    </div>
  ),
}
