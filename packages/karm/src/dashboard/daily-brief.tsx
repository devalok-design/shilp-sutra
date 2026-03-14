'use client'

import * as React from 'react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { markdownComponents } from '../chat/markdown-components'
import { IconChevronDown, IconRefresh, IconSparkles } from '@tabler/icons-react'
import { springs } from '@/ui/lib/motion'
import { cn } from '@/ui/lib/utils'
import { formatRelativeTime } from '@/ui/lib/date-utils'

// ============================================================
// Types
// ============================================================

export interface BriefData {
  brief: string[]
  generatedAt: string
}

export interface DailyBriefProps extends React.HTMLAttributes<HTMLDivElement> {
  data: BriefData | null
  loading?: boolean
  onRefresh?: () => void
  unavailable?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  title?: string
}

// ============================================================
// Component
// ============================================================

const DOT_COLORS = [
  'bg-category-amber-9',
  'bg-category-teal-9',
  'bg-category-cyan-9',
  'bg-accent-9',
  'bg-accent-9',
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
  ...props
}, ref) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const displayTitle = title ?? 'Morning Brief'

  // Shimmer skeleton while loading
  if (loading && !data) {
    return (
      <div ref={ref} className={cn('flex flex-col gap-ds-04 rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01 p-ds-05b', className)} {...props}>
        <div className="flex items-center gap-ds-03">
          <div className="h-ico-sm w-ico-sm animate-pulse rounded bg-surface-2" />
          <div className="h-4 w-24 animate-pulse rounded bg-surface-2" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-ds-04">
            <div className="mt-ds-02b h-2 w-2 shrink-0 animate-pulse rounded-ds-full bg-surface-2" />
            <div
              className="h-4 animate-pulse rounded bg-surface-2"
              style={{ width: `${60 + i * 10}%` }}
            />
          </div>
        ))}
      </div>
    )
  }

  if (unavailable) {
    return (
      <div ref={ref} className={cn('flex items-center gap-ds-03 rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01 px-ds-05b py-ds-05', className)} {...props}>
        <IconSparkles className="h-ico-sm w-ico-sm text-surface-fg-subtle" />
        <span className="text-ds-sm text-surface-fg-subtle">AI brief unavailable</span>
      </div>
    )
  }

  if (!data || data.brief.length === 0) return null

  const showContent = !collapsible || !collapsed

  return (
    <div ref={ref} className={cn('flex flex-col rounded-ds-2xl border border-surface-border-strong bg-surface-1 shadow-01', className)} {...props}>
      <div className="flex items-center justify-between px-ds-05b py-ds-05">
        {collapsible ? (
          <button
            type="button"
            aria-label="Toggle brief"
            aria-expanded={showContent}
            onClick={() => setCollapsed(!collapsed)}
            className="flex flex-1 items-center gap-ds-03 transition-colors hover:opacity-80"
          >
            <IconSparkles className="h-ico-sm w-ico-sm text-accent-11" />
            <span className="text-ds-base font-semibold text-surface-fg">
              {displayTitle}
            </span>
            <IconChevronDown
              className={cn(
                'h-ico-sm w-ico-sm text-surface-fg-subtle transition-transform duration-200',
                showContent && 'rotate-180',
              )}
            />
          </button>
        ) : (
          <div className="flex items-center gap-ds-03">
            <IconSparkles className="h-ico-sm w-ico-sm text-accent-11" />
            <span className="text-ds-base font-semibold text-surface-fg">
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
              className="p-1.5 rounded hover:bg-surface-2 transition-colors"
            >
              <IconRefresh className={cn('h-ico-sm w-ico-sm text-surface-fg-subtle', loading && 'animate-spin')} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {showContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springs.smooth}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-ds-03 border-t border-surface-border-strong px-ds-05b pb-ds-05b pt-ds-05">
              {data.brief.map((item, index) => (
                <div key={index} className="flex items-start gap-ds-04">
                  <div
                    className={cn('mt-ds-02b h-2 w-2 shrink-0 rounded-ds-full', DOT_COLORS[index % DOT_COLORS.length])}
                  />
                  <div className="text-ds-md text-surface-fg-muted [&_p]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-surface-3 [&_code]:px-1 [&_code]:py-ds-01 [&_code]:text-ds-sm [&_a]:text-accent-11 [&_a]:underline">
                    <ReactMarkdown components={markdownComponents}>{item}</ReactMarkdown>
                  </div>
                </div>
              ))}
              <div className="mt-ds-02 text-ds-xs text-surface-fg-subtle">
                Generated {formatRelativeTime(data.generatedAt)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
},
)

DailyBrief.displayName = 'DailyBrief'

export { DailyBrief }
