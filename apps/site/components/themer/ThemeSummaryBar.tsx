'use client'

import * as React from 'react'

import {
  type ArchetypeName,
  type DensityName,
  type MotionName,
  type ShapeName,
  ARCHETYPE_DEFAULTS,
} from '../../lib/archetype-presets'

interface ThemeSummaryBarProps {
  archetype: ArchetypeName
  density?: DensityName | null
  shape?: ShapeName | null
  motion?: MotionName | null
  hue?: number
  chroma?: number
}

/**
 * Single-line theme identity bar — shown on the result page and (compactly)
 * in the wizard. Reads like "archetype=apple · density=spacious (override) · accent 340°".
 */
export function ThemeSummaryBar({
  archetype,
  density,
  shape,
  motion,
  hue,
  chroma,
}: ThemeSummaryBarProps) {
  const defaults = ARCHETYPE_DEFAULTS[archetype]
  const items: { label: string; isOverride: boolean }[] = []

  items.push({ label: `archetype=${archetype}`, isOverride: false })

  if (density) items.push({ label: `density=${density}`, isOverride: density !== defaults.density })
  if (shape) items.push({ label: `shape=${shape}`, isOverride: shape !== defaults.shape })
  if (motion) items.push({ label: `motion=${motion}`, isOverride: motion !== defaults.motion })

  if (hue != null || chroma != null) {
    const parts = []
    if (hue != null) parts.push(`${Math.round(hue)}°`)
    if (chroma != null) parts.push(`c${chroma.toFixed(2)}`)
    items.push({ label: `accent ${parts.join(' ')}`, isOverride: true })
  }

  return (
    <div
      role="status"
      aria-label="Theme summary"
      className="flex flex-wrap items-center gap-ds-02 text-ds-sm font-mono text-surface-fg-muted"
    >
      {items.map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <span aria-hidden="true" className="text-surface-fg-subtle">·</span>}
          <span
            className={
              item.isOverride
                ? 'text-accent-11 bg-accent-2 px-ds-02 py-ds-01 rounded-control-inner'
                : 'text-surface-fg'
            }
          >
            {item.label}
            {item.isOverride && <span className="text-surface-fg-subtle ml-ds-01">(override)</span>}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}
