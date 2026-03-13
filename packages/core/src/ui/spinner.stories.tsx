import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Spinner, type SpinnerProps } from './spinner'
import { Button } from './button'

const meta: Meta<typeof Spinner> = {
  title: 'UI/Feedback/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    state: {
      control: 'select',
      options: ['spinning', 'success', 'error'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'bare'],
    },
    delay: {
      control: 'number',
    },
  },
}
export default meta
type Story = StoryObj<typeof Spinner>

export const Default: Story = {
  args: {
    size: 'md',
    state: 'spinning',
  },
}

export const Small: Story = {
  args: { size: 'sm' },
}

export const Large: Story = {
  args: { size: 'lg' },
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-ds-06">
      <div className="flex flex-col items-center gap-ds-02">
        <Spinner size="sm" />
        <span className="text-ds-xs text-surface-fg-muted">sm (16px)</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Spinner size="md" />
        <span className="text-ds-xs text-surface-fg-muted">md (20px)</span>
      </div>
      <div className="flex flex-col items-center gap-ds-02">
        <Spinner size="lg" />
        <span className="text-ds-xs text-surface-fg-muted">lg (24px)</span>
      </div>
    </div>
  ),
}

export const SuccessState: Story = {
  args: { state: 'success', size: 'lg' },
}

export const ErrorState: Story = {
  args: { state: 'error', size: 'lg' },
}

function StateTransitionDemo() {
  const [state, setState] = React.useState<SpinnerProps['state']>('spinning')

  return (
    <div className="flex flex-col items-start gap-ds-05">
      <Spinner
        size="lg"
        state={state}
        onComplete={() => console.log('Animation complete!')}
      />
      <div className="flex gap-ds-03">
        <Button
          size="sm"
          variant={state === 'spinning' ? 'solid' : 'outline'}
          onClick={() => setState('spinning')}
        >
          Spinning
        </Button>
        <Button
          size="sm"
          variant={state === 'success' ? 'solid' : 'outline'}
          onClick={() => setState('success')}
        >
          Success
        </Button>
        <Button
          size="sm"
          variant={state === 'error' ? 'solid' : 'outline'}
          color="error"
          onClick={() => setState('error')}
        >
          Error
        </Button>
      </div>
      <p className="text-ds-sm text-surface-fg-muted">
        Click a button to transition the spinner to that state.
      </p>
    </div>
  )
}

export const StateTransitions: Story = {
  render: () => <StateTransitionDemo />,
}

function AutoTransitionDemo() {
  const [state, setState] = React.useState<SpinnerProps['state']>('spinning')
  const [message, setMessage] = React.useState('Saving...')

  const run = () => {
    setState('spinning')
    setMessage('Saving...')
    setTimeout(() => {
      setState('success')
      setMessage('Saved!')
    }, 2000)
  }

  return (
    <div className="flex flex-col items-start gap-ds-05">
      <div className="flex items-center gap-ds-03">
        <Spinner size="md" state={state} />
        <span className="text-ds-sm text-surface-fg">{message}</span>
      </div>
      <Button size="sm" onClick={run}>
        Simulate save
      </Button>
    </div>
  )
}

export const AutoTransition: Story = {
  render: () => <AutoTransitionDemo />,
}

export const WithDelay: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <div className="flex items-center gap-ds-03">
        <Spinner delay={0} />
        <span className="text-ds-sm text-surface-fg-muted">delay=0 (immediate)</span>
      </div>
      <div className="flex items-center gap-ds-03">
        <Spinner delay={500} />
        <span className="text-ds-sm text-surface-fg-muted">delay=500ms</span>
      </div>
      <div className="flex items-center gap-ds-03">
        <Spinner delay={1500} />
        <span className="text-ds-sm text-surface-fg-muted">delay=1500ms</span>
      </div>
    </div>
  ),
}

export const InButtonContext: Story = {
  render: () => (
    <div className="flex flex-col gap-ds-04">
      <div className="flex gap-ds-03">
        <Button loading>Saving</Button>
        <Button loading loadingPosition="end">Uploading</Button>
        <Button loading loadingPosition="center">Submit</Button>
      </div>
      <div className="flex gap-ds-03">
        <Button size="sm" loading>Small</Button>
        <Button size="lg" loading>Large</Button>
      </div>
    </div>
  ),
}

function VariantComparisonDemo() {
  const [state, setState] = React.useState<SpinnerProps['state']>('spinning')

  return (
    <div className="flex flex-col items-start gap-ds-06">
      <div className="flex items-center gap-ds-08">
        <div className="flex flex-col items-center gap-ds-02">
          <Spinner size="lg" state={state} variant="filled" />
          <span className="text-ds-xs text-surface-fg-muted">filled</span>
        </div>
        <div className="flex flex-col items-center gap-ds-02">
          <Spinner size="lg" state={state} variant="bare" />
          <span className="text-ds-xs text-surface-fg-muted">bare</span>
        </div>
        <div className="flex flex-col items-center gap-ds-02">
          <span className="text-accent-11">
            <Spinner size="lg" state={state} variant="bare" />
          </span>
          <span className="text-ds-xs text-surface-fg-muted">bare (pink parent)</span>
        </div>
        <div className="flex flex-col items-center gap-ds-02">
          <span className="text-accent-fg bg-accent-9 rounded-ds-md p-ds-02">
            <Spinner size="lg" state={state} variant="bare" />
          </span>
          <span className="text-ds-xs text-surface-fg-muted">bare (white on brand)</span>
        </div>
      </div>
      <div className="flex gap-ds-03">
        <Button size="sm" variant={state === 'spinning' ? 'solid' : 'outline'} onClick={() => setState('spinning')}>
          Spinning
        </Button>
        <Button size="sm" variant={state === 'success' ? 'solid' : 'outline'} onClick={() => setState('success')}>
          Success
        </Button>
        <Button size="sm" variant={state === 'error' ? 'solid' : 'outline'} color="error" onClick={() => setState('error')}>
          Error
        </Button>
      </div>
      <p className="text-ds-sm text-surface-fg-muted">
        <strong>filled</strong>: semantic color fill + white icon (standalone use).{' '}
        <strong>bare</strong>: no fill, icon inherits <code>currentColor</code> from parent (buttons, toolbars).
      </p>
    </div>
  )
}

export const VariantComparison: Story = {
  render: () => <VariantComparisonDemo />,
}
