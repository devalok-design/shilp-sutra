'use client'

import { useState } from 'react'
import { IconCheck, IconCopy } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

export function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
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
