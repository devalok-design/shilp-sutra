import type { Meta, StoryObj } from '@storybook/react'
import * as React from 'react'
import { DevadootIcon, type DevadootState } from './devadoot-icon'
import { CommandBar } from './command-bar'
import { AIConversation } from './conversation'
import type { ConversationMessage } from './types'

const meta: Meta<typeof DevadootIcon> = {
  title: 'AI/DevadootIcon',
  component: DevadootIcon,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '**Package:** `@devalok/shilp-sutra` · **Import:** `import { DevadootIcon } from "@devalok/shilp-sutra/ai"`\n\nAnimated Devalok chakra icon for the AI command system. Animates based on state: slow rotation (idle), pulsing glow (processing), pop (responded), shake (error).',
      },
    },
  },
}
export default meta
type Story = StoryObj<typeof DevadootIcon>

// ── Individual states ──────────────────────────────────────────

export const Idle: Story = {
  args: { state: 'idle', size: 32 },
}

export const Processing: Story = {
  args: { state: 'processing', size: 32 },
  parameters: {
    docs: {
      description: {
        story: 'Faster rotation + pulsing scale + radiating glow ring.',
      },
    },
  },
}

export const Responded: Story = {
  args: { state: 'responded', size: 32 },
  parameters: {
    docs: {
      description: {
        story: 'Gentle pop on arrival, then settles static.',
      },
    },
  },
}

export const Error: Story = {
  args: { state: 'error', size: 32 },
  parameters: {
    docs: {
      description: {
        story: 'Red tint + horizontal shake.',
      },
    },
  },
}

// ── All states side by side ────────────────────────────────────

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
      {(['idle', 'processing', 'responded', 'error'] as const).map((s) => (
        <div
          key={s}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <DevadootIcon state={s} size={40} />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'monospace',
              color: 'var(--color-surface-fg-subtle)',
            }}
          >
            {s}
          </span>
        </div>
      ))}
    </div>
  ),
}

// ── Sizes ──────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {[16, 20, 24, 32, 48].map((s) => (
        <div
          key={s}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <DevadootIcon state="processing" size={s} />
          <span
            style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: 'var(--color-surface-fg-subtle)',
            }}
          >
            {s}px
          </span>
        </div>
      ))}
    </div>
  ),
}

// ── Interactive state switcher ─────────────────────────────────

export const Interactive: Story = {
  render: () => {
    const [state, setState] = React.useState<DevadootState>('idle')
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        <DevadootIcon state={state} size={48} />
        <div style={{ display: 'flex', gap: 8 }}>
          {(['idle', 'processing', 'responded', 'error'] as const).map(
            (s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border:
                    state === s
                      ? '2px solid var(--color-accent-9)'
                      : '1px solid var(--color-surface-border-strong)',
                  background:
                    state === s
                      ? 'var(--color-accent-3)'
                      : 'var(--color-surface-raised)',
                  color: 'var(--color-surface-fg)',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontWeight: state === s ? 600 : 400,
                }}
              >
                {s}
              </button>
            ),
          )}
        </div>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Click buttons to switch between states and see the animation transitions.',
      },
    },
  },
}

// ── As CommandBar agent icon ───────────────────────────────────

export const InCommandBar: Story = {
  render: () => {
    const [state, setState] = React.useState<
      'idle' | 'typing' | 'processing' | 'responded'
    >('idle')
    const [messages, setMessages] = React.useState<ConversationMessage[]>([])

    // Track the icon state separately so it can transition: processing → responded → idle
    const [iconState, setIconState] = React.useState<DevadootState>('idle')

    const handleSubmit = (query: string) => {
      setState('processing')
      setIconState('processing')
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', content: query, createdAt: new Date() },
      ])
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            blocks: [
              {
                type: 'text',
                data: {
                  content: `Processed your request: **${query}**. Here are the results.`,
                },
              },
              {
                type: 'stat_row',
                data: {
                  stats: [
                    { label: 'Found', value: 12 },
                    { label: 'Updated', value: 8 },
                    { label: 'Skipped', value: 4 },
                  ],
                },
              },
            ],
            createdAt: new Date(),
          },
        ])
        setState('responded')
        // Brief "responded" pop, then settle to idle
        setIconState('responded')
        setTimeout(() => setIconState('idle'), 600)
      }, 2500)
    }

    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>
        <CommandBar
          variant="hero"
          greeting="Good morning, Mudit."
          hints={[
            'Add Arundhati to all projects',
            "Who's on PIERA?",
            'Show pending corrections',
          ]}
          placeholder="What would you like to do?"
          onSubmit={handleSubmit}
          state={state}
          agentName="Devadoot"
          agentIcon={<DevadootIcon state={iconState} size={18} />}
        >
          {messages.length > 0 && (
            <AIConversation
              messages={messages}
              isProcessing={state === 'processing'}
              agent={{
                name: 'Devadoot',
                icon: <DevadootIcon state={iconState} size={16} />,
              }}
              maxHeight={400}
            />
          )}
        </CommandBar>
      </div>
    )
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story:
          'Full integration: DevadootIcon as the agent icon in CommandBar + AIConversation. The chakra pulses during processing and pops on response.',
      },
      story: { inline: false, iframeHeight: 600 },
    },
  },
}
