'use client'

import { useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { track } from '@/lib/analytics'

/**
 * Code block for the docs markdown renderer. Unlike the shared `CodeBlock`
 * (which sits inside surface-2 cards and uses a sunken `surface-overlay` body),
 * docs code sits directly on the `surface-base` page — so it uses
 * `surface-raised` to read as a distinct, elevated block in BOTH themes
 * (whiter than the page in light, lighter than the page in dark). Adds a
 * hover-revealed copy button, matching the copy affordance elsewhere on site.
 */
export function MarkdownCodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      track('code_copied', { context: 'docs', language: language ?? 'text' })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore — older browsers without clipboard permission
    }
  }

  return (
    <div className="group relative my-ds-04 overflow-hidden rounded-control border border-surface-border bg-surface-raised">
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute right-ds-02 top-ds-02 z-10 inline-flex h-7 w-7 items-center justify-center rounded-control-inner border border-surface-border-subtle bg-surface-raised-hover text-surface-fg-muted opacity-70 transition-opacity duration-fast-01 hover:text-surface-fg hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
      >
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </button>
      <pre className="overflow-x-auto px-ds-04 py-ds-04 text-ds-sm font-mono leading-relaxed text-surface-fg whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}
