'use client'

import { useState, type ReactNode } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import { IconCheck, IconCode, IconCopy, IconEye } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'

type Tab = 'preview' | 'code'

/**
 * Preview/Code tabs for the live demo at the top of /components/[slug].
 * Borrowed from shadcn's pattern: visitor sees the running component first,
 * one click swaps to the source snippet, copy-button keeps the friction
 * low.
 */
export function PreviewCodeTabs({
  preview,
  code,
}: {
  preview: ReactNode
  code: string | null
}) {
  const [tab, setTab] = useState<Tab>('preview')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore
    }
  }

  const hasCode = Boolean(code)

  return (
    <div className="flex flex-col gap-ds-04">
      <div className="flex items-center justify-between gap-ds-03">
        <LayoutGroup id="preview-code-tabs">
          <div
            role="tablist"
            aria-label="View"
            className="relative inline-flex items-center gap-ds-01 p-ds-01 rounded-control bg-surface-raised border border-surface-border-subtle"
          >
            {(['preview', 'code'] as const).map((id) => {
              const active = tab === id
              const disabled = id === 'code' && !hasCode
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  disabled={disabled}
                  onClick={() => setTab(id)}
                  className={[
                    'relative z-[1] inline-flex items-center gap-ds-02 px-ds-03 py-ds-02 rounded-control-inner text-ds-sm transition-colors duration-fast-01',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                    disabled && 'opacity-40 cursor-not-allowed',
                    active && !disabled ? 'text-surface-fg' : 'text-surface-fg-muted hover:text-surface-fg',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {active && (
                    <motion.span
                      layoutId="preview-code-tab-pill"
                      className="absolute inset-0 rounded-control-inner bg-surface-overlay shadow-raised"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-[1] inline-flex items-center gap-ds-02">
                    {id === 'preview' ? <IconEye size={14} /> : <IconCode size={14} />}
                    {id === 'preview' ? 'Preview' : 'Code'}
                  </span>
                </button>
              )
            })}
          </div>
        </LayoutGroup>

        {tab === 'code' && hasCode && (
          <Button
            variant="ghost"
            size="sm"
            startIcon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            onClick={copy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
      </div>

      {tab === 'preview' ? (
        <div className="p-ds-08 rounded-control border border-surface-border bg-surface-base">
          {preview}
        </div>
      ) : (
        <pre className="rounded-control border border-surface-border bg-surface-overlay overflow-x-auto p-ds-05 text-ds-sm font-mono leading-relaxed text-surface-fg whitespace-pre">
          <code>{code}</code>
        </pre>
      )}
    </div>
  )
}
