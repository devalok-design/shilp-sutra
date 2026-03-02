'use client'

import { Sheet, SheetContent, SheetTitle } from '../../ui/sheet'
import { MessageList, type ChatMessage } from './message-list'
import { ChatInput } from './chat-input'
import { ConversationList, type Conversation } from './conversation-list'
import { useState } from 'react'
import { IconMessagePlus, IconHistory, IconX, IconChevronDown } from '@tabler/icons-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../ui'

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

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) ?? agents[0]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-0 sm:max-w-[480px] [&>button]:hidden"
      >
        <SheetTitle className="sr-only">AI Chat</SheetTitle>

        {/* Header */}
        <div className="flex items-center gap-ds-03 border-b border-[var(--color-border-default)] px-ds-05 py-ds-04">
          {/* Agent Selector */}
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-ds-02b rounded-[var(--radius-lg)] px-ds-03 py-ds-02b transition-colors hover:bg-[var(--color-layer-02)]"
                >
                  <span className="B1-Reg text-[var(--color-text-primary)]">
                    {selectedAgent?.name}
                  </span>
                  <span className="B3-Reg text-[var(--color-text-placeholder)]">
                    {selectedAgent?.desc}
                  </span>
                  <IconChevronDown className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {agents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => onSelectAgent?.(agent.id)}
                    className={
                      selectedAgentId === agent.id
                        ? 'bg-[var(--color-layer-02)]'
                        : ''
                    }
                  >
                    <div className="flex flex-col">
                      <span className="B2-Reg text-[var(--color-text-primary)]">
                        {agent.name}
                      </span>
                      <span className="B3-Reg text-[var(--color-text-placeholder)]">
                        {agent.desc}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
            <IconMessagePlus className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
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
            <IconHistory className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
          </button>

          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-lg)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-layer-02)]"
            aria-label="Close chat"
          >
            <IconX className="h-[var(--icon-sm)] w-[var(--icon-sm)]" />
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
