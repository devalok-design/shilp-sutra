'use client'

import { IconTrash } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Avatar, AvatarFallback,AvatarImage } from '../avatar'
import { Icon, type IconProps } from '../icon'
import { motionProps,springs } from '../lib/motion'
import { cn } from '../lib/utils'
import { Tooltip, TooltipContent,TooltipTrigger } from '../tooltip'

// ── Context ──────────────────────────────────────────────────────────────

interface MessageContextValue {
  variant: 'flat' | 'bubble'
  placement: 'start' | 'end'
  grouped: boolean
  highlight?: 'mention' | 'internal'
}

const MessageContext = React.createContext<MessageContextValue>({
  variant: 'flat',
  placement: 'start',
  grouped: false,
})

function useMessageContext() {
  return React.useContext(MessageContext)
}

// ── Root ─────────────────────────────────────────────────────────────────

export interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'flat' | 'bubble'
  placement?: 'start' | 'end'
  highlight?: 'mention' | 'internal'
  grouped?: boolean
  deleted?: boolean
  deletedText?: string
}

const MessageRoot = React.forwardRef<HTMLDivElement, MessageProps>(
  (
    {
      children,
      variant = 'flat',
      placement = 'start',
      highlight,
      grouped = false,
      deleted = false,
      deletedText = 'This message was deleted',
      className,
      ...props
    },
    ref,
  ) => {
    const ctx = React.useMemo<MessageContextValue>(
      () => ({ variant, placement, grouped, highlight }),
      [variant, placement, grouped, highlight],
    )

    if (deleted) {
      return (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
          className={cn(
            'flex items-center gap-ds-02 py-ds-02 text-ds-xs text-surface-fg-subtle/50 italic',
            className,
          )}
          {...motionProps(props)}
        >
          <Icon icon={IconTrash} size="xs" />
          {deletedText}
        </motion.div>
      )
    }

    if (variant === 'bubble') {
      return (
        <MessageContext.Provider value={ctx}>
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springs.snappy}
            className={cn(
              'group/message relative flex',
              placement === 'end' ? 'justify-end' : 'justify-start',
              highlight === 'mention' && 'border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-control-inner',
              highlight === 'internal' && 'bg-warning-2/50 rounded-control-inner',
              className,
            )}
            {...motionProps(props)}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-bubble px-ds-04 py-ds-03',
                placement === 'end'
                  ? 'bg-accent-3 text-surface-fg'
                  : 'bg-surface-raised text-surface-fg',
              )}
            >
              {children}
            </div>
          </motion.div>
        </MessageContext.Provider>
      )
    }

    // flat variant (default)
    return (
      <MessageContext.Provider value={ctx}>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springs.snappy}
          className={cn(
            'group/message relative flex gap-ds-04',
            grouped && '-mt-ds-01',
            highlight === 'mention' && 'border-l-2 border-l-accent-9 bg-accent-2 pl-ds-03 rounded-control-inner',
            highlight === 'internal' && 'bg-warning-2/50 rounded-control-inner',
            className,
          )}
          {...motionProps(props)}
        >
          {children}
        </motion.div>
      </MessageContext.Provider>
    )
  },
)
MessageRoot.displayName = 'Message'

// ── Avatar ───────────────────────────────────────────────────────────────

export interface MessageAvatarProps {
  src?: string | null
  fallback?: string
  icon?: React.ReactNode
  size?: 'sm' | 'md'
  children?: React.ReactNode
}

function MessageAvatar({
  src,
  fallback,
  icon,
  size = 'md',
  children,
}: MessageAvatarProps) {
  const { grouped } = useMessageContext()

  const sizeClass = size === 'sm' ? 'w-5' : 'w-6'
  const heightClass = size === 'sm' ? 'h-5' : 'h-6'

  if (grouped) {
    return <div className={cn(sizeClass, heightClass, 'shrink-0')} />
  }

  if (children) {
    return (
      <div className={cn(sizeClass, 'shrink-0 flex items-start')}>
        {children}
      </div>
    )
  }

  if (icon) {
    return (
      <div
        className={cn(
          sizeClass,
          size === 'sm' ? 'h-5' : 'h-6',
          'shrink-0 flex items-center justify-center rounded-pill bg-surface-raised-hover',
        )}
      >
        {icon}
      </div>
    )
  }

  return (
    <div className={cn(sizeClass, 'shrink-0')}>
      <Avatar size={size === 'sm' ? 'xs' : 'sm'}>
        {src && <AvatarImage src={src} alt={fallback ?? ''} />}
        <AvatarFallback>{fallback ?? ''}</AvatarFallback>
      </Avatar>
    </div>
  )
}
MessageAvatar.displayName = 'Message.Avatar'

// ── Content ──────────────────────────────────────────────────────────────

export interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function MessageContent({ children, className, ...props }: MessageContentProps) {
  return (
    <div className={cn('min-w-0 flex-1 flex flex-col gap-ds-02', className)} {...props}>
      {children}
    </div>
  )
}
MessageContent.displayName = 'Message.Content'

// ── Author ───────────────────────────────────────────────────────────────

export interface MessageAuthorProps {
  name: string
  badge?: React.ReactNode
  timestamp?: Date
  formattedTimestamp?: string
  timestampFormat?: (date: Date) => string
}

function defaultTimestampFormat(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function MessageAuthor({
  name,
  badge,
  timestamp,
  formattedTimestamp,
  timestampFormat = defaultTimestampFormat,
}: MessageAuthorProps) {
  const { grouped } = useMessageContext()

  if (grouped) return null

  const timeStr = formattedTimestamp
    ?? (timestamp ? timestampFormat(timestamp) : undefined)

  return (
    <div className="flex items-baseline gap-ds-02">
      <span className="font-semibold text-[13px] text-surface-fg">{name}</span>
      {badge}
      {timeStr && (
        <span className="text-[11px] text-surface-fg-subtle/50">{timeStr}</span>
      )}
    </div>
  )
}
MessageAuthor.displayName = 'Message.Author'

// ── Body ─────────────────────────────────────────────────────────────────

export interface MessageBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

function MessageBody({ children, className, ...props }: MessageBodyProps) {
  return (
    <div
      className={cn(
        'text-[13px] leading-relaxed text-surface-fg whitespace-pre-wrap',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
MessageBody.displayName = 'Message.Body'

// ── EditableBody ─────────────────────────────────────────────────────────

export interface MessageEditableBodyProps {
  content: string
  onSave: (newContent: string) => void
  onCancel?: () => void
  canEdit?: boolean
  renderContent?: (content: string) => React.ReactNode
}

function MessageEditableBody({
  content,
  onSave,
  onCancel,
  canEdit = false,
  renderContent,
}: MessageEditableBodyProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editDraft, setEditDraft] = React.useState(content)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  const handleStartEdit = React.useCallback(() => {
    if (!canEdit) return
    setEditDraft(content)
    setIsEditing(true)
  }, [canEdit, content])

  const handleSave = React.useCallback(() => {
    const trimmed = editDraft.trim()
    if (trimmed && trimmed !== content) {
      onSave(trimmed)
    }
    setIsEditing(false)
  }, [editDraft, content, onSave])

  const handleCancel = React.useCallback(() => {
    setIsEditing(false)
    setEditDraft(content)
    onCancel?.()
  }, [content, onCancel])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleSave, handleCancel],
  )

  if (isEditing) {
    return (
      <div className="text-[13px] leading-relaxed">
        <textarea
          ref={textareaRef}
          value={editDraft}
          onChange={(e) => setEditDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="w-full resize-none rounded-control-inner border border-surface-border-strong bg-surface-raised-hover px-ds-02 py-ds-01 text-[13px] leading-relaxed text-surface-fg focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
          rows={2}
        />
        <div className="mt-ds-01 text-ds-xs text-surface-fg-subtle/50">
          Enter to save · Escape to cancel
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'text-[13px] leading-relaxed text-surface-fg whitespace-pre-wrap',
        canEdit && 'cursor-pointer hover:bg-surface-raised-hover rounded-control-inner transition-colors',
      )}
      onClick={handleStartEdit}
      role={canEdit ? 'button' : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onKeyDown={
        canEdit
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleStartEdit()
              }
            }
          : undefined
      }
    >
      {renderContent ? renderContent(content) : content}
    </div>
  )
}
MessageEditableBody.displayName = 'Message.EditableBody'

// ── Reactions ────────────────────────────────────────────────────────────

export interface MessageReactionsProps {
  reactions: { emoji: string; count: number; reacted: boolean }[]
  onReact: (emoji: string) => void
}

function MessageReactions({ reactions, onReact }: MessageReactionsProps) {
  if (reactions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-ds-02 mt-ds-03">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          onClick={() => onReact(r.emoji)}
          aria-label={`${r.emoji} ${r.count} reaction${r.count !== 1 ? 's' : ''}${r.reacted ? ', you reacted' : ''}`}
          className={cn(
            'inline-flex items-center gap-ds-01 rounded-pill px-ds-02 py-ds-01 text-ds-xs transition-colors',
            r.reacted
              ? 'bg-accent-3 ring-1 ring-accent-6'
              : 'bg-surface-raised-hover hover:bg-surface-raised-active',
          )}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
    </div>
  )
}
MessageReactions.displayName = 'Message.Reactions'

// ── Actions (floating toolbar) ───────────────────────────────────────────

export interface MessageActionsProps {
  children: React.ReactNode
  delay?: number
}

function MessageActions({ children, delay = 100 }: MessageActionsProps) {
  return (
    <div
      className={cn(
        'absolute -top-2 right-0 z-10',
        'flex items-center gap-ds-01 rounded-control border border-surface-border bg-surface-raised px-ds-01 py-ds-01 shadow-raised',
        'opacity-0 group-hover/message:opacity-100 group-focus-within/message:opacity-100 transition-opacity duration-150',
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
MessageActions.displayName = 'Message.Actions'

// ── Action (single icon button) ──────────────────────────────────────────

export interface MessageActionProps {
  icon: IconProps['icon']
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

function MessageAction({
  icon,
  label,
  onClick,
  variant = 'default',
}: MessageActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          className={cn(
            'p-ds-02 rounded-control-inner transition-colors',
            variant === 'default' &&
              'text-surface-fg-subtle hover:text-surface-fg hover:bg-surface-raised-hover',
            variant === 'danger' &&
              'text-surface-fg-subtle hover:text-error-11 hover:bg-surface-raised-hover',
          )}
        >
          <Icon icon={icon} size="xs" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
MessageAction.displayName = 'Message.Action'

// ── Compound Export ──────────────────────────────────────────────────────

export const Message = Object.assign(MessageRoot, {
  Avatar: MessageAvatar,
  Content: MessageContent,
  Author: MessageAuthor,
  Body: MessageBody,
  EditableBody: MessageEditableBody,
  Reactions: MessageReactions,
  Actions: MessageActions,
  Action: MessageAction,
})

export {
  type MessageContextValue,
  useMessageContext,
}
