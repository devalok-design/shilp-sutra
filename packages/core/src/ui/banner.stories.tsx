import type { Meta, StoryObj } from '@storybook/react'
import { Banner } from './banner'
import { Button } from './button'

const meta: Meta<typeof Banner> = {
  title: 'UI/Feedback/Banner',
  component: Banner,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error', 'neutral'],
    },
  },
}
export default meta
type Story = StoryObj<typeof Banner>

export const Info: Story = {
  args: {
    color: 'info',
    children: 'A new version of the platform is available.',
  },
}

export const Success: Story = {
  args: {
    color: 'success',
    children: 'Deployment completed successfully.',
  },
}

export const Warning: Story = {
  args: {
    color: 'warning',
    children: 'Your subscription expires in 3 days.',
  },
}

export const Error: Story = {
  args: {
    color: 'error',
    children: 'Service disruption detected. Our team is working on it.',
  },
}

export const WithAction: Story = {
  args: {
    color: 'info',
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
    color: 'warning',
    children: 'Your trial period ends tomorrow.',
    onDismiss: () => {},
  },
}

export const WithActionAndDismissible: Story = {
  args: {
    color: 'error',
    children: 'Payment failed. Please update your billing info.',
    action: (
      <Button variant="ghost" size="sm">
        Update
      </Button>
    ),
    onDismiss: () => {},
  },
}

export const AllVariants: Story = {
  render: () => {
    const variants = ['info', 'success', 'warning', 'error'] as const
    const messages: Record<typeof variants[number], string> = {
      info: 'System maintenance scheduled for tonight.',
      success: 'All services are running normally.',
      warning: 'Disk usage is above 80%.',
      error: 'Database connection lost.',
    }

    return (
      <div className="flex flex-col gap-ds-06">
        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Default</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={variant} color={variant}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">Dismissible</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={`dismiss-${variant}`} color={variant} onDismiss={() => {}}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-surface-fg-muted">With Action</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={`action-${variant}`} color={variant} action={<Button variant="ghost" size="sm">Action</Button>}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
