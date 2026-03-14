'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface MessageListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  autoScroll?: boolean
}

// ============================================================
// MessageList
// ============================================================

const MessageList = React.forwardRef<HTMLDivElement, MessageListProps>(
  function MessageList({ children, autoScroll = true, className, ...props }, ref) {
    const scrollRef = React.useRef<HTMLDivElement>(null)
    const childCount = React.Children.count(children)

    // Auto-scroll to bottom when children count changes
    React.useEffect(() => {
      if (autoScroll && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, [autoScroll, childCount])

    // Merge refs
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node
      },
      [ref],
    )

    return (
      <div
        ref={mergedRef}
        className={cn('flex-1 space-y-ds-05 overflow-y-auto', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)

MessageList.displayName = 'MessageList'

export { MessageList }
