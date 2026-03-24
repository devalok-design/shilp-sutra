'use client'

import * as React from 'react'
import { Sheet, SheetContent, SheetTitle } from '@/ui/sheet'
import { MessageList, type ChatMessage } from './message-list'
import { ChatInput } from './chat-input'
import { ConversationList, type Conversation } from './conversation-list'
import { useState } from 'react'
import { cn } from '@/ui/lib/utils'
import { IconMessagePlus, IconHistory, IconX, IconChevronDown } from '@tabler/icons-react'
import { Icon } from '@/ui/icon'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/ui'

// ============================================================
// Types
// ============================================================

export interface Agent {
  id: string
  name: string
  desc: string
  /** Custom icon element — falls back to first-letter avatar */
  icon?: React.ReactNode
  /** List of capabilities shown as chips in the selector */
  capabilities?: string[]
  /** Agent availability status */
  status?: 'online' | 'offline' | 'busy'
}

export interface ChatPanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
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

const ChatPanel = React.forwardRef<HTMLDivElement, ChatPanelProps>(
  function ChatPanel({
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
    className,
    ...props
  }, ref) {

  const [showHistory, setShowHistory] = useState(false)

  const selectedAgent =
    agents.find((a) => a.id === selectedAgentId) ?? agents[0]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        ref={ref}
        side="right"
        /* intentional: chat panel capped at 480px to prevent oversized side panel */
        className={cn("flex w-full flex-col gap-0 border-l border-surface-border-strong bg-surface-raised p-0 sm:max-w-[480px] [&>button]:hidden", className)}
        {...props}
      >
        <SheetTitle className="sr-only">AI Chat</SheetTitle>

        {/* Header */}
        <div className="flex items-center gap-ds-03 border-b border-surface-border-strong px-ds-05 py-ds-04">
          {/* Agent Selector */}
          <div className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-ds-02b rounded-ds-lg px-ds-03 py-ds-02b transition-colors hover:bg-surface-raised-hover"
                >
                  {/* Icon or first-letter avatar */}
                  {selectedAgent?.icon ? (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                      {selectedAgent.icon}
                    </span>
                  ) : (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-accent-3 text-ds-xs font-semibold text-accent-11">
                      {selectedAgent?.name.charAt(0)}
                    </span>
                  )}
                  {/* Status dot */}
                  {selectedAgent?.status && (
                    <span
                      className={cn(
                        'h-2 w-2 flex-shrink-0 rounded-full',
                        selectedAgent.status === 'online' && 'bg-success-9',
                        selectedAgent.status === 'busy' && 'bg-warning-9',
                        selectedAgent.status === 'offline' && 'bg-surface-fg-subtle',
                      )}
                      aria-label={selectedAgent.status}
                    />
                  )}
                  <span className="text-ds-base text-surface-fg">
                    {selectedAgent?.name}
                  </span>
                  <span className="text-ds-sm text-surface-fg-subtle">
                    {selectedAgent?.desc}
                  </span>
                  <Icon icon={IconChevronDown} size="sm" className="text-surface-fg-subtle" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {agents.map((agent) => (
                  <DropdownMenuItem
                    key={agent.id}
                    onClick={() => onSelectAgent?.(agent.id)}
                    className={cn(
                      'items-start',
                      selectedAgentId === agent.id && 'bg-surface-raised-hover',
                    )}
                  >
                    <div className="flex gap-ds-02b">
                      {/* Icon or first-letter avatar */}
                      {agent.icon ? (
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center">
                          {agent.icon}
                        </span>
                      ) : (
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent-3 text-ds-xs font-semibold text-accent-11">
                          {agent.name.charAt(0)}
                        </span>
                      )}
                      <div className="flex flex-col gap-ds-01">
                        <div className="flex items-center gap-ds-02">
                          <span className="text-ds-md text-surface-fg">
                            {agent.name}
                          </span>
                          {/* Status dot */}
                          {agent.status && (
                            <span
                              className={cn(
                                'h-2 w-2 flex-shrink-0 rounded-full',
                                agent.status === 'online' && 'bg-success-9',
                                agent.status === 'busy' && 'bg-warning-9',
                                agent.status === 'offline' && 'bg-surface-fg-subtle',
                              )}
                              aria-label={agent.status}
                            />
                          )}
                        </div>
                        <span className="text-ds-sm text-surface-fg-subtle">
                          {agent.desc}
                        </span>
                        {/* Capabilities chips */}
                        {agent.capabilities && agent.capabilities.length > 0 && (
                          <div className="mt-ds-01 flex flex-wrap gap-ds-01">
                            {agent.capabilities.map((cap) => (
                              <span
                                key={cap}
                                className="inline-block rounded-ds-md bg-surface-raised-hover px-ds-02 py-px text-ds-xs text-surface-fg-subtle"
                              >
                                {cap}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
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
            className="flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-lg text-surface-fg-muted transition-colors hover:bg-surface-raised-hover"
            aria-label="New chat"
          >
            <Icon icon={IconMessagePlus} size="sm" />
          </button>

          {/* IconHistory Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              'flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-lg transition-colors hover:bg-surface-raised-hover',
              showHistory
                ? 'bg-surface-raised-hover text-surface-fg'
                : 'text-surface-fg-muted',
            )}
            aria-label="Conversation history"
          >
            <Icon icon={IconHistory} size="sm" />
          </button>

          {/* Close */}
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-ds-sm w-ds-sm items-center justify-center rounded-ds-lg text-surface-fg-muted transition-colors hover:bg-surface-raised-hover"
            aria-label="Close chat"
          >
            <Icon icon={IconX} size="sm" />
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
  },
)

ChatPanel.displayName = 'ChatPanel'

export { ChatPanel }
