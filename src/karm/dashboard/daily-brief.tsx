'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { IconChevronDown, IconChevronUp, IconSparkles } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

export interface BriefData {
  brief: string[]
  generatedAt: string
}

interface DailyBriefProps {
  data: BriefData | null
  loading?: boolean
  className?: string
}

// ============================================================
// Component
// ============================================================

const DOT_COLORS = [
  'bg-[var(--color-warning)]',
  'bg-[var(--color-success)]',
  'bg-[var(--color-info)]',
  'bg-[var(--color-interactive)]',
  'bg-[var(--color-accent)]',
]

export default function DailyBrief({
  data,
  loading = false,
  className,
}: DailyBriefProps) {
  const [collapsed, setCollapsed] = useState(false)

  // Shimmer skeleton while loading
  if (loading) {
    return (
      <div className={`flex flex-col gap-ds-04 rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-ds-05b ${className || ''}`}>
        <div className="flex items-center gap-ds-03">
          <div className="h-[var(--icon-sm)] w-[var(--icon-sm)] animate-pulse rounded bg-[var(--color-layer-02)]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-layer-02)]" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-ds-04">
            <div className="mt-ds-02b h-2 w-2 shrink-0 animate-pulse rounded-[var(--radius-full)] bg-[var(--color-layer-02)]" />
            <div
              className="h-4 animate-pulse rounded bg-[var(--color-layer-02)]"
              style={{ width: `${60 + i * 10}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.brief.length === 0) return null

  return (
    <div className={`flex flex-col rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] ${className || ''}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-ds-05b py-ds-05 transition-colors hover:bg-[var(--color-layer-02)]"
      >
        <div className="flex items-center gap-ds-03">
          <IconSparkles className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-interactive)]" />
          <span className="text-ds-base font-semibold text-[var(--color-text-primary)]">
            Morning Brief
          </span>
        </div>
        {collapsed ? (
          <IconChevronDown className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" />
        ) : (
          <IconChevronUp className="h-[var(--icon-sm)] w-[var(--icon-sm)] text-[var(--color-text-placeholder)]" />
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2.5 border-t border-[var(--color-border-default)] px-ds-05b pb-ds-05b pt-ds-05">
          {data.brief.map((item, index) => (
            <div key={index} className="flex items-start gap-ds-04">
              <div
                className={`mt-ds-02b h-2 w-2 shrink-0 rounded-[var(--radius-full)] ${DOT_COLORS[index % DOT_COLORS.length]}`}
              />
              <div className="text-ds-md text-[var(--color-text-secondary)] [&_p]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-[var(--color-field)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_a]:text-[var(--color-interactive)] [&_a]:underline">
                <ReactMarkdown>{item}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
