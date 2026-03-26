'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'
import { tweens } from '../lib/motion'
import { Spinner } from '../spinner'

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  /** Auto-scroll to bottom when new content arrives (default true) */
  autoScroll?: boolean
  /** Number of new messages to show in the floating pill */
  newMessageCount?: number
  /** Called when user clicks the "N new" pill */
  onScrollToBottom?: () => void
  /** Called when user scrolls near the top — triggers load-more */
  onLoadMore?: () => void
  /** Whether more messages are currently being loaded */
  isLoadingMore?: boolean
  /** Content to render when there are no children */
  emptySlot?: React.ReactNode
  /** Custom scroll-to-bottom button (unused slot for future override) */
  scrollToBottomSlot?: React.ReactNode
  /** Content rendered above the scroll container (e.g. channel name) */
  headerSlot?: React.ReactNode
}

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  (
    {
      children,
      autoScroll = true,
      newMessageCount = 0,
      onScrollToBottom,
      onLoadMore,
      isLoadingMore = false,
      emptySlot,
      scrollToBottomSlot,
      headerSlot,
      className,
      ...props
    },
    ref,
  ) => {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const isAtBottomRef = React.useRef(true)
    const [isAtBottom, setIsAtBottom] = React.useState(true)
    const isLoadingMoreRef = React.useRef(false)
    const prevScrollHeightRef = React.useRef(0)

    const isEmpty = React.Children.count(children) === 0 && !isLoadingMore

    // ── Scroll handler ────────────────────────────────────────────
    const handleScroll = React.useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
      isAtBottomRef.current = atBottom
      setIsAtBottom(atBottom)

      // Load more when near top
      if (el.scrollTop < 100 && onLoadMore && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true
        prevScrollHeightRef.current = el.scrollHeight
        onLoadMore()
      }
    }, [onLoadMore])

    // ── Auto-scroll to bottom when children change ────────────────
    React.useLayoutEffect(() => {
      const el = scrollRef.current
      if (!el) return

      // Scroll preservation after load-more
      if (isLoadingMoreRef.current) {
        const newScrollHeight = el.scrollHeight
        el.scrollTop = newScrollHeight - prevScrollHeightRef.current
        isLoadingMoreRef.current = false
        return
      }

      // Auto-scroll if user was at bottom
      if (autoScroll && isAtBottomRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }, [children, autoScroll])

    // ── Reset loading flag when isLoadingMore goes false ──────────
    React.useEffect(() => {
      if (!isLoadingMore) {
        isLoadingMoreRef.current = false
      }
    }, [isLoadingMore])

    // ── "N new" pill visibility ───────────────────────────────────
    const showNewPill = newMessageCount > 0 && !isAtBottom

    const handleScrollToBottom = React.useCallback(() => {
      const el = scrollRef.current
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
      onScrollToBottom?.()
    }, [onScrollToBottom])

    return (
      <div
        ref={ref}
        className={cn('relative flex flex-1 flex-col overflow-hidden', className)}
        {...props}
      >
        {headerSlot}
        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="flex-1 overflow-y-auto px-ds-05 py-ds-04"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--color-surface-border) transparent',
          }}
          onScroll={handleScroll}
        >
          {isLoadingMore && (
            <div className="flex justify-center py-ds-03">
              <Spinner size="sm" />
            </div>
          )}
          {isEmpty ? (
            emptySlot
          ) : (
            <div className="flex flex-col gap-ds-04">
              <AnimatePresence initial={false}>{children}</AnimatePresence>
            </div>
          )}
        </div>

        {/* "N new" floating pill */}
        <AnimatePresence>
          {showNewPill && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={tweens.fade}
              onClick={handleScrollToBottom}
              className="absolute bottom-ds-04 left-1/2 z-10 -translate-x-1/2 rounded-full bg-accent-9 px-ds-04 py-ds-02 text-ds-xs font-medium text-accent-fg shadow-raised transition-colors hover:bg-accent-10"
            >
              {newMessageCount} new
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
MessageList.displayName = 'MessageList'

export { MessageList }
