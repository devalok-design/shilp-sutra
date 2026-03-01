'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

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
  'bg-amber-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-pink-500',
  'bg-purple-500',
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
      <div className={`flex flex-col gap-3 rounded-[var(--radius-2xl)] border border-[var(--color-border-default)] bg-[var(--color-layer-01)] p-5 ${className || ''}`}>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-pulse rounded bg-[var(--color-layer-02)]" />
          <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-layer-02)]" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-[var(--radius-full)] bg-[var(--color-layer-02)]" />
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
        className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--color-layer-02)]"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--color-interactive)]" />
          <span className="B1-Reg font-semibold text-[var(--color-text-primary)]">
            Morning Brief
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-[var(--color-text-placeholder)]" />
        ) : (
          <ChevronUp className="h-4 w-4 text-[var(--color-text-placeholder)]" />
        )}
      </button>

      {!collapsed && (
        <div className="flex flex-col gap-2.5 border-t border-[var(--color-border-default)] px-5 pb-5 pt-4">
          {data.brief.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-[var(--radius-full)] ${DOT_COLORS[index % DOT_COLORS.length]}`}
              />
              <div className="B2-Reg text-[var(--color-text-secondary)] [&_p]:mb-0 [&_strong]:font-semibold [&_code]:rounded [&_code]:bg-[var(--color-field)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_a]:text-[var(--color-interactive)] [&_a]:underline">
                <ReactMarkdown>{item}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
