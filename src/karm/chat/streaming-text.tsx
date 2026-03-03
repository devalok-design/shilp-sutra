'use client'

import * as React from 'react'
import ReactMarkdown from 'react-markdown'

export interface StreamingTextProps {
  text: string
}

export const StreamingText = React.forwardRef<HTMLDivElement, StreamingTextProps>(
  function StreamingText({ text }, ref) {
  return (
    <div ref={ref}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-ds-03 last:mb-0">{children}</p>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return <code className={className}>{children}</code>
            }
            return (
              <code className="rounded bg-field px-ds-02 py-0.5 text-ds-md">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-ds-03 overflow-x-auto rounded-ds-lg bg-field p-ds-04 text-ds-md">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="mb-ds-03 list-disc pl-ds-05">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-ds-03 list-decimal pl-ds-05">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-ds-02">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      <span className="inline-block h-4 w-2 animate-pulse bg-text-secondary ml-0.5" />
    </div>
  )
},
)

StreamingText.displayName = 'StreamingText'
