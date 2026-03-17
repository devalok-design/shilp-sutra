'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface MarkdownViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
  /** Tighter spacing for inline use */
  compact?: boolean
  /** Allow raw HTML in markdown @default false */
  allowHtml?: boolean
  /** Link target @default '_blank' */
  linkTarget?: string
}

// ============================================================
// MarkdownViewer
// ============================================================

function MarkdownViewer({
  content,
  compact = false,
  allowHtml = false,
  linkTarget = '_blank',
  className,
  ...props
}: MarkdownViewerProps) {
  const mb = compact ? 'mb-ds-02' : 'mb-ds-03'
  const mt = compact ? 'mt-ds-03' : 'mt-ds-05'

  return (
    <div className={cn('font-sans text-surface-fg', className)} {...props}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml={!allowHtml}
        components={{
          h1: ({ children }) => (
            <h1 className={cn(compact ? 'text-ds-md' : 'text-ds-lg', 'font-semibold text-surface-fg', mt, mb)}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn('text-ds-md font-semibold text-surface-fg', compact ? 'mt-ds-03' : 'mt-ds-04', mb)}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn('text-ds-md font-semibold text-surface-fg', 'mt-ds-03', mb)}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={cn('text-ds-md text-surface-fg leading-ds-relaxed', mb)}>
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={linkTarget}
              rel={linkTarget === '_blank' ? 'noopener noreferrer' : undefined}
              className="text-accent-11 hover:underline"
            >
              {children}
            </a>
          ),
          code: ({ className: codeClassName, children, ...codeProps }) => {
            // Block code has a className like "language-xxx" from remark
            const isBlock = codeClassName?.startsWith('language-')
            if (isBlock) {
              return (
                <code className={cn('text-ds-sm font-mono text-surface-fg', codeClassName)} {...codeProps}>
                  {children}
                </code>
              )
            }
            return (
              <code className="bg-surface-sunken rounded-ds-sm px-1.5 py-0.5 text-ds-sm font-mono text-surface-fg" {...codeProps}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className={cn('bg-surface-sunken rounded-ds-md p-ds-04 overflow-x-auto', mb)}>
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className={cn('border-l-2 border-surface-border-subtle pl-ds-04 text-surface-fg-muted italic', mb)}>
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className={cn('list-disc pl-ds-06 text-ds-md text-surface-fg space-y-ds-01', mb)}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn('list-decimal pl-ds-06 text-ds-md text-surface-fg space-y-ds-01', mb)}>
              {children}
            </ol>
          ),
          table: ({ children }) => (
            <div className={cn('overflow-x-auto', mb)}>
              <table className="w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-surface-border-subtle px-ds-03 py-ds-02 text-left text-ds-sm font-semibold bg-surface-sunken">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-surface-border-subtle px-ds-03 py-ds-02 text-ds-sm">
              {children}
            </td>
          ),
          hr: () => <hr className={cn('border-surface-border-subtle', compact ? 'my-ds-03' : 'my-ds-04')} />,
          img: ({ src, alt }) => (
            <img src={src} alt={alt ?? ''} className="rounded-ds-md max-w-full" loading="lazy" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}

export { MarkdownViewer }
