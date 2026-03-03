import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, it, expect, vi } from 'vitest'
import { ChatPanel, type ChatPanelProps } from '../chat-panel'
import type { ChatMessage } from '../message-list'
import type { Conversation } from '../conversation-list'

// ============================================================
// Fixtures
// ============================================================

const messages: ChatMessage[] = [
  { id: 'msg-1', role: 'USER', content: 'Hello, how are you?' },
  { id: 'msg-2', role: 'ASSISTANT', content: 'I am doing well! How can I help?' },
]

const conversations: Conversation[] = [
  { id: 'conv-1', title: 'Project discussion', updatedAt: new Date().toISOString() },
  { id: 'conv-2', title: 'Task planning', updatedAt: new Date(Date.now() - 86400000).toISOString() },
]

const defaultProps: ChatPanelProps = {
  isOpen: true,
  onOpenChange: vi.fn(),
  messages,
  conversations,
  onSendMessage: vi.fn(),
  onSelectConversation: vi.fn(),
  onStartNewChat: vi.fn(),
}

function renderChatPanel(overrides: Partial<ChatPanelProps> = {}) {
  return render(<ChatPanel {...defaultProps} {...overrides} />)
}

// ============================================================
// Tests
// ============================================================

describe('ChatPanel — integration', () => {
  it('has no critical a11y violations', async () => {
    const { container } = renderChatPanel()
    const results = await axe(container, {
      rules: {
        // Sheet/Dialog landmark roles may trigger; not relevant here
        region: { enabled: false },
      },
    })
    expect(results).toHaveNoViolations()
  })

  it('renders the sheet title for screen readers', () => {
    renderChatPanel()
    expect(screen.getByText('AI Chat')).toBeInTheDocument()
  })

  it('renders the selected agent name in the header', () => {
    renderChatPanel()
    expect(screen.getByText('Devadoot')).toBeInTheDocument()
    expect(screen.getByText('General Assistant')).toBeInTheDocument()
  })

  it('renders header action buttons', () => {
    renderChatPanel()
    expect(screen.getByLabelText('New chat')).toBeInTheDocument()
    expect(screen.getByLabelText('Conversation history')).toBeInTheDocument()
    expect(screen.getByLabelText('Close chat')).toBeInTheDocument()
  })

  it('renders message list with user and assistant messages', () => {
    renderChatPanel()
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument()
    expect(screen.getByText(/I am doing well/)).toBeInTheDocument()
  })

  it('renders chat input with placeholder', () => {
    renderChatPanel()
    expect(screen.getByPlaceholderText('Ask Karm AI...')).toBeInTheDocument()
  })

  it('renders send button (disabled when input is empty)', () => {
    renderChatPanel()
    const sendBtn = screen.getByLabelText('Send message')
    expect(sendBtn).toBeDisabled()
  })

  it('toggles to conversation history view', async () => {
    renderChatPanel()
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Conversation history'))

    // Conversation list should now be visible
    expect(screen.getByText('Conversations')).toBeInTheDocument()
    expect(screen.getByText('Project discussion')).toBeInTheDocument()
    expect(screen.getByText('Task planning')).toBeInTheDocument()
  })

  it('selects a conversation from history and returns to chat view', async () => {
    const onSelectConversation = vi.fn()
    renderChatPanel({ onSelectConversation })
    const user = userEvent.setup()

    // Open history
    await user.click(screen.getByLabelText('Conversation history'))

    // Click a conversation
    await user.click(screen.getByText('Project discussion'))

    expect(onSelectConversation).toHaveBeenCalledWith('conv-1')
    // Should switch back to chat view (history hidden)
    expect(screen.queryByText('Conversations')).not.toBeInTheDocument()
  })

  it('calls onStartNewChat when new chat button is clicked', async () => {
    const onStartNewChat = vi.fn()
    renderChatPanel({ onStartNewChat })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('New chat'))

    expect(onStartNewChat).toHaveBeenCalledTimes(1)
  })

  it('calls onOpenChange(false) when close button is clicked', async () => {
    const onOpenChange = vi.fn()
    renderChatPanel({ onOpenChange })
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Close chat'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders empty state when no messages and not streaming', () => {
    renderChatPanel({ messages: [] })
    expect(screen.getByText('Karm AI')).toBeInTheDocument()
    expect(
      screen.getByText('Ask me about tasks, projects, attendance, or anything else.'),
    ).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderChatPanel({ isOpen: false })
    // The Sheet should not render content when closed
    expect(screen.queryByText('Devadoot')).not.toBeInTheDocument()
  })
})
