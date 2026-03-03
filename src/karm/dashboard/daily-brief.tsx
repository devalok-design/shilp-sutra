'use client'

import * as React from 'react'
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

export interface DailyBriefProps {
  data: BriefData | null
  loading?: boolean
  className?: string
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
  className,
}, ref) {
  const [collapsed, setCollapsed] = useState(false)

  // Shimmer skeleton while loading
  if (loading) {
    return (
      <div ref={ref} className={`flex flex-col gap-ds-04 rounded-ds-2xl border border-border bg-layer-01 shadow-01 p-ds-05b ${className || ''}`}>
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

  if (!data || data.brief.length === 0) return null

  return (
    <div ref={ref} className={`flex flex-col rounded-ds-2xl border border-border bg-layer-01 shadow-01 ${className || ''}`}>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between px-ds-05b py-ds-05 transition-colors hover:bg-layer-02"
      >
        <div className="flex items-center gap-ds-03">
          <IconSparkles className="h-ico-sm w-ico-sm text-interactive" />
          <span className="text-ds-base font-semibold text-text-primary">
            Morning Brief
          </span>
        </div>
        {collapsed ? (
          <IconChevronDown className="h-ico-sm w-ico-sm text-text-placeholder" />
        ) : (
          <IconChevronUp className="h-ico-sm w-ico-sm text-text-placeholder" />
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-ds-03 border-t border-border px-ds-05b pb-ds-05b pt-ds-05">
          {data.brief.map((item, index) => (
            <div key={index} className="flex items-start gap-ds-04">
              <div
                className={`mt-ds-02b h-2 w-2 shrink-0 rounded-ds-full ${DOT_COLORS[index % DOT_COLORS.length]}`}
              />
              <div className="text-ds-md text-text-secondary [&_p]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-field [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-ds-sm [&_a]:text-interactive [&_a]:underline">
                <ReactMarkdown>{item}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
},
)

DailyBrief.displayName = 'DailyBrief'

export default DailyBrief
