'use client'

import * as React from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IconCopy, IconCheck } from '@tabler/icons-react'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { Button } from '../ui/button'

// react-syntax-highlighter is lazy-loaded in CodeBlock component below

// ============================================================
// Heading helpers
// ============================================================

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Recursively extract text content from React children */
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (!node) return ''
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement<{ children?: React.ReactNode }>).props.children)
  }
  return ''
}

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

// Small copy-to-clipboard button for code blocks
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="absolute top-ds-02 right-ds-02 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy code'}
    >
      {copied ? <Icon icon={IconCheck} size="xs" /> : <Icon icon={IconCopy} size="xs" />}
    </Button>
  )
}

// Syntax-highlighted code block with lazy-loaded highlighter
function CodeBlock({ language, code, mb }: { language: string; code: string; mb: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [modules, setModules] = React.useState<{ Highlighter: any; style: any } | null>(null)

  React.useEffect(() => {
    let cancelled = false
    Promise.all([
      import('react-syntax-highlighter'),
      import('react-syntax-highlighter/dist/esm/styles/prism/one-dark'),
    ]).then(([hlMod, styleMod]) => {
      if (!cancelled) {
        setModules({ Highlighter: hlMod.Prism ?? hlMod.default, style: styleMod.default })
      }
    }).catch(() => { /* fallback to plain pre */ })
    return () => { cancelled = true }
  }, [])

  if (!modules) {
    return (
      <div className={cn('group relative', mb)}>
        <pre className="bg-surface-sunken rounded-ds-md p-ds-04 overflow-x-auto text-ds-sm font-mono">
          <code>{code}</code>
        </pre>
        <CopyButton code={code} />
      </div>
    )
  }

  const { Highlighter, style } = modules
  return (
    <div className={cn('group relative', mb)}>
      <Highlighter
        language={language}
        style={style}
        customStyle={{
          margin: 0,
          borderRadius: 'var(--radius-ds-md)',
          fontSize: 'var(--text-ds-sm)',
          padding: 'var(--spacing-ds-04)',
        }}
      >
        {code}
      </Highlighter>
      <CopyButton code={code} />
    </div>
  )
}

const MarkdownViewer = React.forwardRef<HTMLDivElement, MarkdownViewerProps>(({
  content,
  compact = false,
  allowHtml = false,
  linkTarget = '_blank',
  className,
  ...props
}, ref) => {
  const mb = compact ? 'mb-ds-02' : 'mb-ds-03'
  const mt = compact ? 'mt-ds-03' : 'mt-ds-05'

  return (
    <div ref={ref} className={cn('font-sans text-surface-fg', className)} {...props}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml={!allowHtml}
        components={{
          h1: ({ children }) => {
            const slug = slugify(extractText(children))
            return (
              <h1 id={slug} className={cn('group', compact ? 'text-ds-md' : 'text-ds-lg', 'font-semibold text-surface-fg', mt, mb)}>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-surface-fg-subtle mr-ds-02 no-underline" aria-hidden="true">
                  #
                </a>
                {children}
              </h1>
            )
          },
          h2: ({ children }) => {
            const slug = slugify(extractText(children))
            return (
              <h2 id={slug} className={cn('group', 'text-ds-md font-semibold text-surface-fg', compact ? 'mt-ds-03' : 'mt-ds-04', mb)}>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-surface-fg-subtle mr-ds-02 no-underline" aria-hidden="true">
                  #
                </a>
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const slug = slugify(extractText(children))
            return (
              <h3 id={slug} className={cn('group', 'text-ds-md font-semibold text-surface-fg', 'mt-ds-03', mb)}>
                <a href={`#${slug}`} className="opacity-0 group-hover:opacity-100 text-surface-fg-subtle mr-ds-02 no-underline" aria-hidden="true">
                  #
                </a>
                {children}
              </h3>
            )
          },
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
            const langMatch = codeClassName ? /language-(\w+)/.exec(codeClassName) : null
            if (langMatch) {
              const lang = langMatch[1]
              const codeString = String(children).replace(/\n$/, '')
              return <CodeBlock language={lang} code={codeString} mb={mb} />
            }
            return (
              <code className="bg-surface-sunken rounded-ds-sm px-1.5 py-0.5 text-ds-sm font-mono text-surface-fg" {...codeProps}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <>{children}</>
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
})
MarkdownViewer.displayName = 'MarkdownViewer'

export { MarkdownViewer }
