import type { Meta, StoryObj } from '@storybook/react'
import { ErrorDisplay } from './error-boundary'

const meta: Meta<typeof ErrorDisplay> = {
  title: 'Composed/ErrorDisplay',
  component: ErrorDisplay,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: 640, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof ErrorDisplay>

export const Default: Story = {
  args: {
    error: new Error('An unexpected error occurred'),
  },
}

export const NotFound: Story = {
  args: {
    error: { status: 404, data: { message: 'Page not found' } },
  },
}

export const Forbidden: Story = {
  args: {
    error: { status: 403, data: { message: 'You do not have access to this resource.' } },
  },
}

export const ServerError: Story = {
  args: {
    error: { status: 500, data: { message: 'Internal server error' } },
  },
}

export const WithResetButton: Story = {
  args: {
    error: { status: 500, data: { message: 'Something went wrong while loading the dashboard.' } },
    onReset: () => alert('Reset clicked'),
  },
}

export const NotFoundWithReset: Story = {
  args: {
    error: { status: 404, data: { message: 'The project you are looking for does not exist.' } },
    onReset: () => alert('Reset clicked'),
  },
}

export const ForbiddenWithReset: Story = {
  args: {
    error: { status: 403, data: { message: 'Only admins can access the payroll section.' } },
    onReset: () => alert('Reset clicked'),
  },
}

export const GenericError: Story = {
  args: {
    error: 'Something went wrong, please try again.',
  },
}

export const ErrorWithCustomMessage: Story = {
  args: {
    error: new Error('Failed to fetch attendance records for the current month.'),
    onReset: () => alert('Retry'),
  },
}

export const UnknownError: Story = {
  args: {
    error: { status: 502, data: 'Bad Gateway' },
  },
}

export const AllErrorTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          404 - Not Found
        </p>
        <ErrorDisplay error={{ status: 404 }} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          403 - Forbidden
        </p>
        <ErrorDisplay error={{ status: 403 }} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          500 - Server Error
        </p>
        <ErrorDisplay error={{ status: 500 }} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)' }}>
          Unknown Error
        </p>
        <ErrorDisplay error={new Error('Unexpected failure')} onReset={() => {}} />
      </div>
    </div>
  ),
}
