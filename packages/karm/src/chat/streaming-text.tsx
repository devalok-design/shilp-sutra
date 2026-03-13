'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from './markdown-components'

export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  /** When true, streaming is complete and the final text will be announced to screen readers */
  isComplete?: boolean
}

export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText({ text, isComplete = false, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn(className)} {...props} aria-live="off">
      <ReactMarkdown components={markdownComponents}>
        {text}
      </ReactMarkdown>
      {!isComplete && (
        <span className="inline-block h-4 w-2 animate-pulse bg-surface-fg-muted ml-ds-01" />
      )}
      <span
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {isComplete ? text : ''}
      </span>
    </div>
  )
},
)

StreamingText.displayName = 'StreamingText'
