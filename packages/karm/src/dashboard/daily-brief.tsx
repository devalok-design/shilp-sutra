'use client'

import * as React from 'react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { IconChevronDown, IconRefresh, IconSparkles } from '@tabler/icons-react'
import { cn } from '@/ui/lib/utils'

// ============================================================
// Types
// ============================================================

export interface BriefData {
  brief: string[]
  generatedAt: string
}

export interface DailyBriefProps {
  data: BriefData | null
  loading?: boolean
  onRefresh?: () => void
  unavailable?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  title?: string
  className?: string
}

// ============================================================
// Helpers
// ============================================================

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

// ============================================================
// Component
// ============================================================

const DOT_COLORS = [
  'bg-category-amber',
  'bg-category-teal',
  'bg-category-cyan',
  'bg-interactive',
  'bg-accent',
]

const DailyBrief = React.forwardRef<HTMLDivElement, DailyBriefProps>(
  function DailyBrief({
  data,
  loading = false,
  onRefresh,
  unavailable = false,
  collapsible = true,
  defaultCollapsed = false,
  title,
  className,
}, ref) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const displayTitle = title ?? 'Morning Brief'

  // Shimmer skeleton while loading
  if (loading && !data) {
    return (
      <div ref={ref} className={cn('flex flex-col gap-ds-04 rounded-ds-2xl border border-border bg-layer-01 shadow-01 p-ds-05b', className)}>
        <div className="flex items-center gap-ds-03">
          <div className="h-ico-sm w-ico-sm animate-pulse rounded bg-layer-02" />
          <div className="h-4 w-24 animate-pulse rounded bg-layer-02" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-ds-04">
            <div className="mt-ds-02b h-2 w-2 shrink-0 animate-pulse rounded-ds-full bg-layer-02" />
            <div
              className="h-4 animate-pulse rounded bg-layer-02"
              style={{ width: `${60 + i * 10}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (unavailable) {
    return (
      <div ref={ref} className={cn('flex items-center gap-ds-03 rounded-ds-2xl border border-border bg-layer-01 shadow-01 px-ds-05b py-ds-05', className)}>
        <IconSparkles className="h-ico-sm w-ico-sm text-text-placeholder" />
        <span className="text-ds-sm text-text-placeholder">AI brief unavailable</span>
      </div>
    )
  }

  if (!data || data.brief.length === 0) return null

  const showContent = !collapsible || !collapsed

  return (
    <div ref={ref} className={cn('flex flex-col rounded-ds-2xl border border-border bg-layer-01 shadow-01', className)}>
      <div className="flex items-center justify-between px-ds-05b py-ds-05">
        {collapsible ? (
          <button
            type="button"
            aria-label="Toggle brief"
            aria-expanded={showContent}
            onClick={() => setCollapsed(!collapsed)}
            className="flex flex-1 items-center gap-ds-03 transition-colors hover:opacity-80"
          >
            <IconSparkles className="h-ico-sm w-ico-sm text-interactive" />
            <span className="text-ds-base font-semibold text-text-primary">
              {displayTitle}
            </span>
            <IconChevronDown
              className={cn(
                'h-ico-sm w-ico-sm text-text-placeholder transition-transform duration-200',
                showContent && 'rotate-180',
              )}
            />
          </button>
        ) : (
          <div className="flex items-center gap-ds-03">
            <IconSparkles className="h-ico-sm w-ico-sm text-interactive" />
            <span className="text-ds-base font-semibold text-text-primary">
              {displayTitle}
            </span>
          </div>
        )}
        <div className="flex items-center gap-ds-02">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              aria-label="Refresh brief"
              className="p-1.5 rounded hover:bg-layer-02 transition-colors"
            >
              <IconRefresh className={cn('h-ico-sm w-ico-sm text-text-placeholder', loading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>

      <div className={cn('grid transition-[grid-template-rows] duration-200', showContent ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="flex flex-col gap-ds-03 border-t border-border px-ds-05b pb-ds-05b pt-ds-05">
            {data.brief.map((item, index) => (
              <div key={index} className="flex items-start gap-ds-04">
                <div
                  className={cn('mt-ds-02b h-2 w-2 shrink-0 rounded-ds-full', DOT_COLORS[index % DOT_COLORS.length])}
                />
                <div className="text-ds-md text-text-secondary [&_p]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-field [&_code]:px-1 [&_code]:py-ds-01 [&_code]:text-ds-sm [&_a]:text-interactive [&_a]:underline">
                  <ReactMarkdown>{item}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div className="mt-ds-02 text-ds-xs text-text-placeholder">
              Generated {formatRelativeTime(data.generatedAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
},
)

DailyBrief.displayName = 'DailyBrief'

export { DailyBrief }
