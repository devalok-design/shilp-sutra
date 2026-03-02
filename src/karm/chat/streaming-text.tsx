'use client'

import ReactMarkdown from 'react-markdown'

export function StreamingText({ text }: { text: string }) {
  return (
    <div>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-ds-03 last:mb-0">{children}</p>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return <code className={className}>{children}</code>
            }
            return (
              <code className="rounded bg-[var(--color-field)] px-ds-02 py-0.5 text-ds-md">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-ds-03 overflow-x-auto rounded-[var(--radius-lg)] bg-[var(--color-field)] p-ds-04 text-ds-md">
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
      <span className="inline-block h-4 w-2 animate-pulse bg-[var(--color-text-secondary)] ml-0.5" />
    </div>
  )
}
