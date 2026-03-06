import type { Meta, StoryObj } from '@storybook/react'
import { ChatInput } from './chat-input'

const meta: Meta<typeof ChatInput> = {
  title: 'Karm/Chat/ChatInput',
  component: ChatInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: '**Package:** `@devalok/shilp-sutra-karm` · **Import:** `import { ChatInput } from "@devalok/shilp-sutra-karm/chat"`',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    onSubmit: { action: 'submit' },
    onCancel: { action: 'cancel' },
  },
}
export default meta
type Story = StoryObj<typeof ChatInput>

export const Default: Story = {
  args: {
    isStreaming: false,
  },
}

export const CustomPlaceholder: Story = {
  args: {
    placeholder: 'Ask about your tasks...',
  },
}

export const NoDisclaimer: Story = {
  args: {
    disclaimer: '',
  },
}

export const CustomDisclaimer: Story = {
  args: {
    disclaimer: 'Karm AI is powered by Claude. Double-check critical details.',
  },
}

export const Streaming: Story = {
  args: {
    isStreaming: true,
  },
}

export const DisabledWhileStreaming: Story = {
  name: 'Disabled While Streaming',
  args: {
    isStreaming: true,
  },
}
