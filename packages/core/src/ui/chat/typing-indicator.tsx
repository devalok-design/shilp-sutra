'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

export interface TypingIndicatorProps {
  users: { name: string; image?: string }[]
  className?: string
}

function formatTypingText(users: { name: string }[]): string {
  if (users.length === 1) return `${users[0].name} is typing...`
  if (users.length === 2) return `${users[0].name} and ${users[1].name} are typing...`
  return 'Several people are typing...'
}

function TypingIndicator({ users, className }: TypingIndicatorProps) {
  return (
    <div className={cn('min-h-[24px] px-ds-05', className)} role="status" aria-live="polite">
      <AnimatePresence>
        {users.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-ds-02 text-ds-xs text-surface-fg-subtle"
          >
            <span className="flex items-center gap-ds-01">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-1 w-1 rounded-full bg-surface-fg-subtle"
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </span>
            <span>{formatTypingText(users)}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
TypingIndicator.displayName = 'TypingIndicator'

export { TypingIndicator }
