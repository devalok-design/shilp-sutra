'use client'

import { useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { track } from '@/lib/analytics'

export function CodeBlock({
  code,
  language = 'bash',
  copyContext = 'snippet',
  copyMeta,
}: {
  code: string
  language?: string
  /** What this block represents, sent as the `code_copied` event context (e.g. 'install'). */
  copyContext?: string
  /** Extra low-cardinality props merged into the `code_copied` event (e.g. { manager }). */
  copyMeta?: Record<string, string>
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      track('code_copied', { context: copyContext, language, ...copyMeta })
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore — older browsers without clipboard permission
    }
  }

  return (
    <div className="relative group rounded-control border border-surface-border bg-surface-overlay overflow-hidden">
      <div className="flex items-center justify-between px-ds-04 py-ds-02 border-b border-surface-border-subtle bg-surface-raised">
        <span className="text-ds-xs font-mono text-surface-fg-muted lowercase">{language}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          onClick={copy}
        >
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        </Button>
      </div>
      <pre className="px-ds-04 py-ds-04 overflow-x-auto text-ds-sm font-mono leading-relaxed text-surface-fg whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  )
}
