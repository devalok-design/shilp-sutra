'use client'

import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { MotionPreference } from '../../motion/motion-preference'
import { tweens } from '../lib/motion'
import { cn } from '../lib/utils'
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
  loadingMore?: boolean
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
      loadingMore = false,
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
    const loadingMoreRef = React.useRef(false)
    const prevScrollHeightRef = React.useRef(0)

    const isEmpty = React.Children.count(children) === 0 && !loadingMore

    // ── Scroll handler ────────────────────────────────────────────
    const handleScroll = React.useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
      isAtBottomRef.current = atBottom
      setIsAtBottom(atBottom)

      // Load more when near top
      if (el.scrollTop < 100 && onLoadMore && !loadingMoreRef.current) {
        loadingMoreRef.current = true
        prevScrollHeightRef.current = el.scrollHeight
        onLoadMore()
      }
    }, [onLoadMore])

    // ── Auto-scroll to bottom when children change ────────────────
    React.useLayoutEffect(() => {
      const el = scrollRef.current
      if (!el) return

      // Scroll preservation after load-more
      if (loadingMoreRef.current) {
        const newScrollHeight = el.scrollHeight
        el.scrollTop = newScrollHeight - prevScrollHeightRef.current
        loadingMoreRef.current = false
        return
      }

      // Auto-scroll if user was at bottom
      if (autoScroll && isAtBottomRef.current) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      }
    }, [children, autoScroll])

    // ── Reset loading flag when loadingMore goes false ──────────
    React.useEffect(() => {
      if (!loadingMore) {
        loadingMoreRef.current = false
      }
    }, [loadingMore])

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
      <MotionPreference>
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
            {loadingMore && (
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
                className="absolute bottom-ds-04 left-1/2 z-10 -translate-x-1/2 rounded-pill bg-accent-9 px-ds-04 py-ds-02 text-body-xs font-medium text-accent-fg shadow-raised transition-colors hover:bg-accent-10"
              >
                {newMessageCount} new
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </MotionPreference>
    )
  },
)
MessageList.displayName = 'MessageList'

export { MessageList }
