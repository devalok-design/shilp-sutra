'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCircleCheck,
  IconCircle,
  IconCircleX,
  IconLoader2,
} from '@tabler/icons-react'
import { cn } from '../ui/lib/utils'
import { springs } from '../ui/lib/motion'
import { useMotion } from '../motion/motion-provider'
import { BlockRenderer } from './block-renderer'
import { useAICommand } from './ai-command-provider'
import type {
  ConversationMessage,
  ProcessingStep,
  BlockComponentProps,
} from './types'

// ── Props ────────────────────────────────────────────────────────────────────

export interface AIConversationProps {
  messages: ConversationMessage[]
  isProcessing?: boolean
  processingSteps?: ProcessingStep[]
  agent?: { name: string; icon?: React.ReactNode }
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>
  maxHeight?: string | number
  autoScroll?: boolean
  className?: string
}

// ── Step status icon ─────────────────────────────────────────────────────────

function StepStatusIcon({ status }: { status: ProcessingStep['status'] }) {
  switch (status) {
    case 'done':
      return (
        <IconCircleCheck
          className="h-4 w-4 text-success-11"
          aria-hidden="true"
        />
      )
    case 'active':
      return (
        <motion.span
          className="inline-flex h-4 w-4 items-center justify-center text-accent-9"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          aria-hidden="true"
        >
          <IconLoader2 className="h-4 w-4" />
        </motion.span>
      )
    case 'error':
      return (
        <IconCircleX
          className="h-4 w-4 text-error-11"
          aria-hidden="true"
        />
      )
    case 'pending':
    default:
      return (
        <IconCircle
          className="h-4 w-4 text-surface-fg-subtle opacity-50"
          aria-hidden="true"
        />
      )
  }
}

// ── Agent header ─────────────────────────────────────────────────────────────

function AgentHeader({
  name,
  icon,
}: {
  name: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-ds-02b mb-ds-03">
      {icon && <span className="h-4 w-4 flex items-center justify-center">{icon}</span>}
      <span className="text-ds-xs font-semibold uppercase tracking-wider text-surface-fg-subtle">
        {name}
      </span>
    </div>
  )
}

// ── User message ─────────────────────────────────────────────────────────────

function UserMessage({
  message,
  reducedMotion,
}: {
  message: ConversationMessage
  reducedMotion: boolean
}) {
  if (reducedMotion) {
    return (
      <div className="bg-surface-raised rounded-ds-lg px-ds-05 py-ds-04">
        <p className="text-ds-sm text-surface-fg">{message.content}</p>
      </div>
    )
  }

  return (
    <motion.div
      className="bg-surface-raised rounded-ds-lg px-ds-05 py-ds-04"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springs.snappy}
    >
      <p className="text-ds-sm text-surface-fg">{message.content}</p>
    </motion.div>
  )
}

// ── Assistant message ────────────────────────────────────────────────────────

function AssistantMessage({
  message,
  agent,
  onAction,
  customBlocks,
}: {
  message: ConversationMessage
  agent: { name: string; icon?: React.ReactNode }
  onAction?: (actionId: string, type: 'confirm' | 'cancel' | 'undo') => void
  customBlocks?: Record<string, React.ComponentType<BlockComponentProps<any>>>
}) {
  return (
    <div>
      <AgentHeader name={agent.name} icon={agent.icon} />
      {message.blocks && (
        <BlockRenderer
          blocks={message.blocks}
          onAction={onAction}
          customBlocks={customBlocks}
        />
      )}
    </div>
  )
}

// ── Processing indicator ─────────────────────────────────────────────────────

function ProcessingIndicator({
  steps,
  agent,
  reducedMotion,
}: {
  steps?: ProcessingStep[]
  agent: { name: string; icon?: React.ReactNode }
  reducedMotion: boolean
}) {
  // Step visualization
  if (steps && steps.length > 0) {
    return (
      <div role="status" aria-busy="true" aria-label="Processing">
        <AgentHeader name={agent.name} icon={agent.icon} />
        <div className="flex flex-col gap-ds-02b">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              className="flex items-center gap-ds-02b"
              initial={reducedMotion ? undefined : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.2, delay: i * 0.05 }
              }
            >
              <StepStatusIcon status={step.status} />
              <span
                className={cn(
                  'text-ds-sm',
                  step.status === 'pending'
                    ? 'text-surface-fg-subtle'
                    : 'text-surface-fg',
                )}
              >
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // Breathing dots
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={`${agent.name} is processing`}
    >
      <AgentHeader name={agent.name} icon={agent.icon} />
      <div className="flex items-center gap-ds-02">
        {!reducedMotion &&
          [0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-accent-9"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.16,
              }}
            />
          ))}
        <span className="ml-ds-02b text-ds-sm text-surface-fg-subtle">
          {agent.name} is thinking...
        </span>
      </div>
    </div>
  )
}

// ── Scroll-to-bottom pill ────────────────────────────────────────────────────

function ScrollToBottomPill({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      role="button"
      aria-label="Scroll to latest response"
      className="absolute bottom-ds-04 left-1/2 -translate-x-1/2 z-10 flex items-center gap-ds-02 bg-accent-9 text-accent-fg text-ds-xs font-medium rounded-full px-ds-04 py-ds-02 shadow-floating"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={springs.snappy}
      onClick={onClick}
    >
      {'\u2193'} New response
    </motion.button>
  )
}

// ── Default agent ────────────────────────────────────────────────────────────

const DEFAULT_AGENT = { name: 'Assistant' }

// ── AIConversation ───────────────────────────────────────────────────────────

function AIConversation({
  messages,
  isProcessing = false,
  processingSteps,
  agent: agentProp,
  onAction,
  customBlocks,
  maxHeight,
  autoScroll = true,
  className,
}: AIConversationProps) {
  const ctx = useAICommand()
  const { reducedMotion } = useMotion()

  // Resolve agent: prop > context > default
  const agent = agentProp ?? ctx?.agent ?? DEFAULT_AGENT

  // Resolve onAction: prop > context
  const resolvedOnAction = onAction ?? ctx?.onAction

  // Resolve customBlocks: prop wins over context
  const resolvedCustomBlocks = React.useMemo(() => {
    const contextBlocks = ctx?.customBlocks ?? {}
    return { ...contextBlocks, ...customBlocks }
  }, [ctx?.customBlocks, customBlocks])

  // ── Auto-scroll ──────────────────────────────────────────────────────────

  const scrollRef = React.useRef<HTMLDivElement>(null)
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const [hasNewContent, setHasNewContent] = React.useState(false)
  const prevMessageCount = React.useRef(messages.length)
  const prevProcessing = React.useRef(isProcessing)

  // Track if user is scrolled to bottom via IntersectionObserver
  React.useEffect(() => {
    if (!autoScroll || !sentinelRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsAtBottom(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasNewContent(false)
        }
      },
      {
        root: scrollRef.current,
        threshold: 0.1,
      },
    )

    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [autoScroll])

  // Auto-scroll or show pill on new content
  React.useEffect(() => {
    const contentChanged =
      messages.length !== prevMessageCount.current ||
      isProcessing !== prevProcessing.current

    prevMessageCount.current = messages.length
    prevProcessing.current = isProcessing

    if (!contentChanged || !autoScroll) return

    if (isAtBottom) {
      sentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    } else {
      setHasNewContent(true)
    }
  }, [messages, isProcessing, isAtBottom, autoScroll])

  const scrollToBottom = React.useCallback(() => {
    sentinelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    setIsAtBottom(true)
    setHasNewContent(false)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className={cn('relative', className)}>
      <div
        ref={scrollRef}
        className="flex flex-col gap-ds-05 overflow-y-auto"
        style={
          maxHeight
            ? {
                maxHeight:
                  typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
              }
            : undefined
        }
      >
        {messages.map((msg) =>
          msg.role === 'user' ? (
            <UserMessage
              key={msg.id}
              message={msg}
              reducedMotion={reducedMotion}
            />
          ) : (
            <AssistantMessage
              key={msg.id}
              message={msg}
              agent={agent}
              onAction={resolvedOnAction}
              customBlocks={resolvedCustomBlocks}
            />
          ),
        )}
        {isProcessing && (
          <ProcessingIndicator
            steps={processingSteps}
            agent={agent}
            reducedMotion={reducedMotion}
          />
        )}
        <div ref={sentinelRef} className="h-px" />
      </div>
      <AnimatePresence>
        {!isAtBottom && hasNewContent && (
          <ScrollToBottomPill onClick={scrollToBottom} />
        )}
      </AnimatePresence>
    </div>
  )
}

export { AIConversation }
