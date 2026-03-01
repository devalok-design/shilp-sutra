'use client'

import { Sheet, SheetContent, SheetTitle } from '../../ui/sheet'
import { MessageList, type ChatMessage } from './message-list'
import { ChatInput } from './chat-input'
import { ConversationList, type Conversation } from './conversation-list'
import { useState, useEffect } from 'react'
import { IconMessagePlus, IconHistory, IconX, IconChevronDown } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface Agent {
  id: string
  name: string
  desc: string
}

export interface ChatPanelProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  messages: ChatMessage[]
  conversations: Conversation[]
  agents?: Agent[]
  selectedAgentId?: string
  activeConversationId?: string | null
  isStreaming?: boolean
  streamingText?: string
  isLoadingMessages?: boolean
  isLoadingConversations?: boolean

  onSendMessage: (message: string) => void
  onCancelStream?: () => void
  onSelectAgent?: (agentId: string) => void
  onStartNewChat?: () => void
  onSelectConversation?: (id: string) => void
  onArchiveConversation?: (id: string) => void
  onDeleteConversation?: (id: string) => void
}

// Default agents
const DEFAULT_AGENTS: Agent[] = [
  { id: 'devadoot', name: 'Devadoot', desc: 'General Assistant' },
  { id: 'prahari', name: 'Prahari', desc: 'Attendance & Time' },
  { id: 'sutradhar', name: 'Sutradhar', desc: 'Tasks & Projects' },
  { id: 'sahayak', name: 'Sahayak', desc: 'Team Helper' },
  { id: 'vidwan', name: 'Vidwan', desc: 'Knowledge Expert' },
  { id: 'sanchalak', name: 'Sanchalak', desc: 'Manager Advisor' },
  { id: 'dwar-palak', name: 'Dwar-Palak', desc: 'Access Control' },
]

// ============================================================
// Component
// ============================================================

export function ChatPanel({
  isOpen,
  onOpenChange,
  messages,
  conversations,
  agents = DEFAULT_AGENTS,
  selectedAgentId = 'devadoot',
  activeConversationId,
  isStreaming = false,
  streamingText = '',
  isLoadingMessages = false,
  isLoadingConversations = false,
  onSendMessage,
  onCancelStream,
  onSelectAgent,
  onStartNewChat,
  onSelectConversation,
  onArchiveConversation,
  onDeleteConversation,
}: ChatPanelProps) {
  const [showHistory, setShowHistory] = useState(false)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) ?? agents[0]

  // Close agent dropdown when clicking outside
  useEffect(() => {
    if (!showAgentDropdown) return
    const handleClick = () => setShowAgentDropdown(false)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [showAgentDropdown])

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0 sm:max-w-[480px] [&>button]:hidden"
      >
        <SheetTitle className="sr-only">AI Chat</SheetTitle>

        {/* Header */}
        <div className="flex items-center gap-2 border-b border-[var(--color-border-default)] px-4 py-3">
          {/* Agent Selector */}
          <div className="relative flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAgentDropdown(!showAgentDropdown)
              }}
              className="flex items-center gap-1.5 rounded-[var(--radius-lg)] px-2 py-1.5 transition-colors hover:bg-[var(--color-layer-02)]"
            >
              <span className="B1-Reg text-[var(--color-text-primary)]">
                {selectedAgent?.name}
              </span>
              <span className="B3-Reg text-[var(--color-text-placeholder)]">
                {selectedAgent?.desc}
              </span>
              <IconChevronDown className="h-3.5 w-3.5 text-[var(--color-text-placeholder)]" />
            </button>

            {/* Agent Dropdown */}
            {showAgentDropdown && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] py-1 shadow-lg">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => {
                      onSelectAgent?.(agent.id)
                      setShowAgentDropdown(false)
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[var(--color-layer-02)] ${
                      selectedAgentId === agent.id
                        ? 'bg-[var(--color-layer-02)]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="B2-Reg text-[var(--color-text-primary)]">
                        {agent.name}
                      </span>
                      <span className="B3-Reg text-[var(--color-text-placeholder)]">
                        {agent.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Chat */}
          <button
            onClick={() => {
              onStartNewChat?.()
              setShowHistory(false)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-02)]"
            aria-label="New chat"
          >
            <IconMessagePlus className="h-4 w-4" />
          </button>

          {/* IconHistory Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] transition-colors hover:bg-[var(--color-layer-02)] ${
              showHistory
                ? 'bg-[var(--color-layer-02)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-secondary)]'
            }`}
            aria-label="Conversation history"
          >
            <IconHistory className="h-4 w-4" />
          </button>

          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-02)]"
            aria-label="Close chat"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Conditional: show conversation list or chat view */}
        {showHistory ? (
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversationId}
            isLoading={isLoadingConversations}
            onSelect={(id) => {
              onSelectConversation?.(id)
              setShowHistory(false)
            }}
            onNewChat={() => {
              onStartNewChat?.()
              setShowHistory(false)
            }}
            onArchive={onArchiveConversation}
            onDelete={onDeleteConversation}
          />
        ) : (
          <>
            <MessageList
              messages={messages}
              isStreaming={isStreaming}
              streamingText={streamingText}
              isLoadingMessages={isLoadingMessages}
            />
            <ChatInput
              onSubmit={onSendMessage}
              onCancel={onCancelStream}
              isStreaming={isStreaming}
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
