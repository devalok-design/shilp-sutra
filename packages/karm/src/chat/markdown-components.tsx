'use client'

import type * as React from 'react'

/**
 * Shared markdown component overrides for ReactMarkdown.
 * Used by both MessageList and StreamingText to ensure consistent rendering.
 */
export const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-ds-03 last:mb-0">{children}</p>
  ),
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode
    className?: string
  }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return <code className={className}>{children}</code>
    }
    return (
      <code className="rounded bg-surface-3 px-ds-02 py-ds-01 text-ds-md">
        {children}
      </code>
    )
  },
  pre: ({ children }: { children?: React.ReactNode }) => (
    <pre className="mb-ds-03 overflow-x-auto rounded-ds-lg bg-surface-3 p-ds-04 text-ds-md">
      {children}
    </pre>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-ds-03 list-disc pl-ds-05">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-ds-03 list-decimal pl-ds-05">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="mb-ds-02">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  a: ({
    href,
    children,
    ...props
  }: {
    href?: string
    children?: React.ReactNode
  }) => {
    const safeHref =
      href && /^(https?:\/\/|mailto:)/i.test(href) ? href : '#'
    return (
      <a
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent-11 underline hover:text-accent-12"
        {...props}
      >
        {children}
      </a>
    )
  },
}
