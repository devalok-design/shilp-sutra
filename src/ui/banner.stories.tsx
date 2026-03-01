import type { Meta, StoryObj } from '@storybook/react'
import { Banner } from './banner'
import { Button } from './button'

const meta: Meta<typeof Banner> = {
  title: 'UI/Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
    },
    dismissible: { control: 'boolean' },
  },
}
export default meta
type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'A new version of the platform is available.',
  },
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Deployment completed successfully.',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Your subscription expires in 3 days.',
  },
}

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'Service disruption detected. Our team is working on it.',
  },
}

export const WithAction: Story = {
  args: {
    variant: 'info',
    children: 'A newer version is available.',
    action: (
      <Button variant="ghost" size="sm">
        Update Now
      </Button>
    ),
  },
}

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    children: 'Your trial period ends tomorrow.',
    dismissible: true,
    onDismiss: () => {},
  },
}

export const WithActionAndDismissible: Story = {
  args: {
    variant: 'error',
    children: 'Payment failed. Please update your billing info.',
    action: (
      <Button variant="ghost" size="sm">
        Update
      </Button>
    ),
    dismissible: true,
    onDismiss: () => {},
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col">
      <Banner variant="info">Information: System maintenance scheduled for tonight.</Banner>
      <Banner variant="success">Success: All services are running normally.</Banner>
      <Banner variant="warning">Warning: Disk usage is above 80%.</Banner>
      <Banner variant="error">Error: Database connection lost.</Banner>
    </div>
  ),
}
