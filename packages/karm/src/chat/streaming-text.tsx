'use client'

import * as React from 'react'
import { cn } from '@/ui/lib/utils'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from './markdown-components'

export interface StreamingTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
}

export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText({ text, className, ...props }, ref) {
  return (
    <div ref={ref} className={cn(className)} {...props} aria-live="polite">
      <ReactMarkdown components={markdownComponents}>
        {text}
      </ReactMarkdown>
      <span className="inline-block h-4 w-2 animate-pulse bg-surface-fg-muted ml-ds-01" />
    </div>
  )
},
)

StreamingText.displayName = 'StreamingText'
