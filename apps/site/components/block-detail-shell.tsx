'use client'

import { useState } from 'react'
import { IconCheck, IconCode, IconCopy, IconEye } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

type Tab = 'preview' | 'code'

export function BlockDetailShell({
  children,
  source,
  uses,
}: {
  children: React.ReactNode
  source: string
  uses: string[]
}) {
  const [tab, setTab] = useState<Tab>('preview')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-ds-04">
      <div className="flex items-center justify-between gap-ds-03 flex-wrap">
        <div
          role="tablist"
          aria-label="View"
          className="inline-flex items-center gap-ds-01 rounded-control border border-surface-border bg-surface-panel p-ds-01"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            onClick={() => setTab('preview')}
            className={[
              'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
              tab === 'preview' ? 'bg-surface-overlay text-surface-fg shadow-raised' : 'text-surface-fg-muted',
            ].join(' ')}
          >
            <IconEye size={14} />
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            onClick={() => setTab('code')}
            className={[
              'inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
              tab === 'code' ? 'bg-surface-overlay text-surface-fg shadow-raised' : 'text-surface-fg-muted',
            ].join(' ')}
          >
            <IconCode size={14} />
            Code
          </button>
        </div>

        {tab === 'code' && (
          <Button
            variant="ghost"
            size="sm"
            startIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            onClick={copy}
          >
            {copied ? 'Copied' : 'Copy source'}
          </Button>
        )}
      </div>

      {tab === 'preview' ? (
        <div className="rounded-control border border-surface-border bg-surface-base overflow-hidden">
          {children}
        </div>
      ) : (
        <pre className="rounded-control border border-surface-border bg-surface-overlay overflow-x-auto p-ds-05 text-ds-xs font-mono leading-relaxed text-surface-fg whitespace-pre max-h-[720px]">
          <code>{source}</code>
        </pre>
      )}

      {uses.length > 0 && (
        <div className="flex flex-wrap items-center gap-ds-02">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            Uses:
          </Text>
          {uses.map((u) => (
            <span
              key={u}
              className="inline-flex items-center px-ds-02 py-[1px] rounded-control-inner bg-surface-panel border border-surface-border-subtle text-ds-xs font-mono text-surface-fg-muted"
            >
              {u}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
