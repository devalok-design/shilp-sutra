'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from './markdown-components'

export interface StreamingTextProps {
  text: string
}

export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText({ text }, ref) {
  return (
    <div ref={ref}>
      <ReactMarkdown components={markdownComponents}>
        {text}
      </ReactMarkdown>
      <span className="inline-block h-4 w-2 animate-pulse bg-text-secondary ml-ds-01" />
    </div>
  )
},
)

StreamingText.displayName = 'StreamingText'
