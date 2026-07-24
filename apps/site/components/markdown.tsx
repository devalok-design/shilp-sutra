import { Children, isValidElement, type ReactNode } from 'react'
import Link from 'next/link'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { MarkdownCodeBlock } from '@/components/markdown-code-block'

/** Recursively collect the raw text of a code node's children into a string. */
function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')
  if (isValidElement(node)) return nodeToText((node.props as { children?: ReactNode }).children)
  return ''
}

const components: Components = {
  h1: (props) => (
    <h1
      className="text-[length:var(--typo-heading-xl-size)] font-[number:var(--typo-heading-xl-weight)] leading-[var(--typo-heading-xl-leading)] tracking-[var(--typo-heading-xl-tracking)] text-surface-fg mt-ds-09 mb-ds-05 first:mt-0"
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="text-[length:var(--typo-heading-lg-size)] font-[number:var(--typo-heading-lg-weight)] leading-[var(--typo-heading-lg-leading)] tracking-[var(--typo-heading-lg-tracking)] text-surface-fg mt-ds-09 mb-ds-04 scroll-mt-24"
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="text-[length:var(--typo-heading-md-size)] font-[number:var(--typo-heading-md-weight)] leading-[var(--typo-heading-md-leading)] tracking-[var(--typo-heading-md-tracking)] text-surface-fg mt-ds-08 mb-ds-03 scroll-mt-24"
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="text-[length:var(--typo-heading-sm-size)] font-[number:var(--typo-heading-sm-weight)] leading-[var(--typo-heading-sm-leading)] tracking-[var(--typo-heading-sm-tracking)] text-surface-fg mt-ds-06 mb-ds-02 scroll-mt-24"
      {...props}
    />
  ),
  p: (props) => (
    <p
      className="text-[length:var(--typo-body-md-size)] font-[number:var(--typo-body-md-weight)] leading-[var(--typo-body-md-leading)] tracking-[var(--typo-body-md-tracking)] text-surface-fg-muted my-ds-04"
      {...props}
    />
  ),
  ul: (props) => <ul className="my-ds-04 ml-ds-05 list-disc text-surface-fg-muted space-y-ds-02" {...props} />,
  ol: (props) => <ol className="my-ds-04 ml-ds-05 list-decimal text-surface-fg-muted space-y-ds-02" {...props} />,
  li: (props) => <li className="text-ds-md leading-relaxed" {...props} />,
  hr: (props) => <hr className="my-ds-08 border-surface-border-subtle" {...props} />,
  blockquote: (props) => (
    <blockquote className="my-ds-05 border-l-2 border-accent-7 pl-ds-04 italic text-surface-fg-muted" {...props} />
  ),
  strong: (props) => <strong className="font-semibold text-surface-fg" {...props} />,
  em: (props) => <em className="italic" {...props} />,
  a: ({ href, children, ...rest }) => {
    if (!href) return <span {...rest}>{children}</span>
    const isExternal = href.startsWith('http')
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 text-surface-fg hover:text-accent-11"
          {...rest}
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className="underline underline-offset-2 text-surface-fg hover:text-accent-11" {...rest}>
        {children}
      </Link>
    )
  },
  code: ({ children, className, ...rest }) => {
    const match = typeof className === 'string' ? className.match(/language-(\w+)/) : null
    if (match) {
      return (
        <MarkdownCodeBlock code={nodeToText(children).replace(/\n$/, '')} language={match[1]} />
      )
    }
    return (
      <code
        className="font-mono text-[0.9em] px-1.5 py-0.5 rounded-control-inner bg-surface-overlay text-surface-fg border border-surface-border-subtle"
        {...rest}
      >
        {children}
      </code>
    )
  },
  // Fenced blocks render as a self-contained MarkdownCodeBlock (its own <div><pre>),
  // so the wrapping <pre> just passes children through — avoids invalid <pre><div>.
  pre: ({ children }) => <>{children}</>,
  table: (props) => (
    <div className="my-ds-05 overflow-x-auto rounded-control border border-surface-border">
      <table className="w-full text-ds-sm" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-surface-raised" {...props} />,
  th: (props) => <th className="px-ds-04 py-ds-03 text-left font-medium text-surface-fg border-b border-surface-border" {...props} />,
  td: (props) => <td className="px-ds-04 py-ds-03 text-surface-fg-muted border-b border-surface-border-subtle" {...props} />,
}

export function Markdown({ source }: { source: string }) {
  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {source}
    </ReactMarkdown>
  )
}
