'use client'

import ReactMarkdown from 'react-markdown'

export function StreamingText({ text }: { text: string }) {
  return (
    <div>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          code: ({ children, className }) => {
            const isBlock = className?.includes('language-')
            if (isBlock) {
              return <code className={className}>{children}</code>
            }
            return (
              <code className="rounded bg-[var(--Mapped-Surface-Quaternary)] px-1 py-0.5 text-sm">
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="mb-2 overflow-x-auto rounded-lg bg-[var(--Mapped-Surface-Quaternary)] p-3 text-sm">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="mb-2 list-disc pl-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-2 list-decimal pl-4">{children}</ol>
          ),
          li: ({ children }) => <li className="mb-1">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
      <span className="inline-block h-4 w-2 animate-pulse bg-[var(--Mapped-Text-Secondary)] ml-0.5" />
    </div>
  )
}
