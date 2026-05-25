'use client'

import * as React from 'react'

import {
  type ArchetypeName,
  type DensityName,
  type ShapeName,
  mergeArchetype,
} from '../../lib/archetype-presets'

interface PreviewFrameProps {
  archetype: ArchetypeName
  density?: DensityName
  shape?: ShapeName
  /** OKLCH hue for the primary accent (0-360) */
  hue?: number
  /** OKLCH peak chroma (0-0.37) */
  chroma?: number
  /** Compact (mini-card) vs full (button + input + card + body). */
  size?: 'mini' | 'full'
  className?: string
}

/**
 * Reusable role-token preview pane. Renders a tiny mock UI (Display heading,
 * body text, Primary button, Input, Card) using the archetype's role values
 * + optional accent. Used by archetype-gallery, brand-import, and the wizard.
 *
 * The math here mirrors playgrounds/archetype-gallery.html so what users see
 * in the standalone playground matches the in-site preview exactly.
 */
export function PreviewFrame({
  archetype,
  density,
  shape,
  hue = 280,
  chroma = 0.19,
  size = 'full',
  className,
}: PreviewFrameProps) {
  const v = mergeArchetype(archetype, density, shape)
  const accent = `oklch(0.55 ${chroma} ${hue})`
  const accentHover = `oklch(0.50 ${chroma} ${hue})`
  const accentFg = `oklch(0.99 0 ${hue})`

  // Card padding doubles on full-size previews so the layout breathes.
  const cardPad = size === 'mini' ? Math.max(v.cp - 6, 12) : v.cp

  return (
    <div
      className={className}
      style={{
        background: v.bg,
        border: `${v.bw}px solid ${v.bc}`,
        borderRadius: `${v.rs}px`,
        padding: `${cardPad}px`,
        boxShadow: v.shad,
        fontWeight: v.fontWeight,
        lineHeight: v.leading,
        color: 'oklch(0.20 0.005 280)',
        display: 'flex',
        flexDirection: 'column',
        gap: size === 'mini' ? '10px' : '14px',
      }}
    >
      <div style={{ fontSize: `${v.headSize}px`, fontWeight: Math.min(v.fontWeight + 100, 800) }}>
        {archetype.charAt(0).toUpperCase() + archetype.slice(1)}
      </div>
      {size === 'full' && (
        <div style={{ fontSize: `${v.bodySize}px`, color: 'oklch(0.45 0.01 280)', maxWidth: '38ch' }}>
          A card with role tokens applied. Shape, density, and shadow come from the archetype preset.
        </div>
      )}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          type="button"
          style={{
            background: accent,
            color: accentFg,
            border: 'none',
            borderRadius: `${v.rc}px`,
            padding: `${v.py}px ${v.px}px`,
            fontSize: `${v.bodySize}px`,
            fontWeight: v.fontWeight,
            cursor: 'pointer',
            transition: 'background 120ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accentHover }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accent }}
        >
          Primary
        </button>
        {size === 'full' && (
          <input
            type="text"
            placeholder="Type here"
            style={{
              background: 'oklch(1 0 0)',
              border: `${v.bw}px solid ${v.bc}`,
              borderRadius: `${v.rc}px`,
              padding: `${v.py}px ${v.px}px`,
              fontSize: `${v.bodySize}px`,
              outline: 'none',
              minWidth: '160px',
            }}
          />
        )}
      </div>
    </div>
  )
}
