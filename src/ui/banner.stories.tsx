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
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Default</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={variant} variant={variant}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">Dismissible</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={`dismiss-${variant}`} variant={variant} dismissible onDismiss={() => {}}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-ds-03 text-ds-sm font-semibold text-text-secondary">With Action</p>
          <div className="flex flex-col">
            {variants.map((variant) => (
              <Banner key={`action-${variant}`} variant={variant} action={<Button variant="ghost" size="sm">Action</Button>}>
                {messages[variant]}
              </Banner>
            ))}
          </div>
        </div>
      </div>
    )
  },
}
