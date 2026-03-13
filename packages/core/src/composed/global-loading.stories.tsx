import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { GlobalLoading } from './global-loading'

const meta: Meta<typeof GlobalLoading> = {
  title: 'Composed/GlobalLoading',
  component: GlobalLoading,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
}
export default meta
type Story = StoryObj<typeof GlobalLoading>

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const NotLoading: Story = {
  args: {
    isLoading: false,
  },
}

export const Interactive: Story = {
  render: () => {
    const InteractiveDemo = () => {
      const [loading, setLoading] = useState(false)

      const simulateNavigation = () => {
        setLoading(true)
        setTimeout(() => setLoading(false), 2000)
      }

      return (
        <div>
          <GlobalLoading isLoading={loading} />
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: 'var(--color-surface-fg-muted)' }}>
              Click the button to simulate a page navigation. The loading bar appears at the top of the viewport and animates to completion over 2 seconds.
            </p>
            <div>
              <button
                onClick={simulateNavigation}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: loading ? '#888' : '#D33163',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Loading...' : 'Simulate Navigation'}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-surface-fg-subtle)' }}>
              Status: {loading ? 'Loading' : 'Idle'}
            </p>
          </div>
        </div>
      )
    }
    return <InteractiveDemo />
  },
}

export const AlwaysLoading: Story = {
  render: () => (
    <div>
      <GlobalLoading isLoading={true} />
      <div style={{ padding: 32 }}>
        <p style={{ fontSize: 14, color: 'var(--color-surface-fg-muted)' }}>
          The loading bar is pinned at 80% width while <code>isLoading</code> is true. It animates to 100% and fades out when set to false.
        </p>
      </div>
    </div>
  ),
}
