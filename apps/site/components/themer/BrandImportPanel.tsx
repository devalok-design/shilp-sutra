'use client'

import Link from 'next/link'
import * as React from 'react'

import { suggestArchetypeByHue } from '../../lib/archetype-presets'
import { generateRamp } from '../../lib/ramp-generator'
import { PreviewFrame } from './PreviewFrame'

/**
 * Crude hex → OKLCH-hue approximation. Good enough to pick a hue band
 * (which is all we need to suggest an archetype). For exact ramp values
 * we use the user's chroma slider, not the hex's chroma.
 */
function hexToHue(hex: string): number | null {
  const m = hex.trim().match(/^#?([a-f0-9]{6}|[a-f0-9]{3})$/i)
  if (!m) return null
  let h = m[1]
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  if (d === 0) return 0
  let hue = 0
  if (max === r) hue = ((g - b) / d) % 6
  else if (max === g) hue = (b - r) / d + 2
  else hue = (r - g) / d + 4
  hue *= 60
  if (hue < 0) hue += 360
  return Math.round(hue)
}

export function BrandImportPanel() {
  const [hex, setHex] = React.useState('#d946a6')
  const [hue, setHue] = React.useState(340)
  const [chroma, setChroma] = React.useState(0.19)

  const handleHexBlur = () => {
    const h = hexToHue(hex)
    if (h != null) setHue(h)
  }

  const ramp = React.useMemo(() => generateRamp(hue, chroma), [hue, chroma])
  const suggestion = React.useMemo(() => suggestArchetypeByHue(hue), [hue])

  const resultHref = `/themer/result?archetype=${suggestion.name}&hue=${hue}&chroma=${chroma.toFixed(3)}`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-ds-06">
      <div className="flex flex-col gap-ds-05">
        <div className="flex flex-col gap-ds-03">
          <label htmlFor="brand-hex" className="text-ds-sm font-medium text-surface-fg">
            Brand color (hex)
          </label>
          <div className="flex items-center gap-ds-03">
            <input
              id="brand-hex"
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              onBlur={handleHexBlur}
              className="flex-1 rounded-control border border-surface-border-subtle bg-surface-2 px-ds-03 py-ds-02 text-ds-md font-mono text-surface-fg focus:outline-hidden focus:ring-2 focus:ring-accent-9"
              placeholder="#d946a6"
            />
            <input
              type="color"
              value={hex.match(/^#?[a-f0-9]{6}$/i) ? hex : '#d946a6'}
              onChange={(e) => {
                setHex(e.target.value)
                const h = hexToHue(e.target.value)
                if (h != null) setHue(h)
              }}
              aria-label="Color picker"
              className="h-ds-md w-ds-md rounded-control border border-surface-border-subtle"
            />
          </div>
          <p className="text-ds-xs text-surface-fg-subtle">
            Or skip the hex and dial OKLCH directly below.
          </p>
        </div>

        <div className="flex flex-col gap-ds-03">
          <label htmlFor="brand-hue" className="text-ds-sm font-medium text-surface-fg flex items-center justify-between">
            <span>Hue</span>
            <span className="font-mono text-surface-fg-muted">{Math.round(hue)}°</span>
          </label>
          <input
            id="brand-hue"
            type="range"
            min={0}
            max={360}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex flex-col gap-ds-03">
          <label htmlFor="brand-chroma" className="text-ds-sm font-medium text-surface-fg flex items-center justify-between">
            <span>Chroma (saturation)</span>
            <span className="font-mono text-surface-fg-muted">{chroma.toFixed(3)}</span>
          </label>
          <input
            id="brand-chroma"
            type="range"
            min={0}
            max={0.37}
            step={0.005}
            value={chroma}
            onChange={(e) => setChroma(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div
          aria-label="Generated 12-step ramp"
          className="flex h-ds-lg overflow-hidden rounded-control border border-surface-border-subtle"
        >
          {ramp.light.map((s) => (
            <div
              key={s.step}
              title={`accent-${s.step}: ${s.value}`}
              style={{ background: s.value, flex: 1 }}
            />
          ))}
        </div>

        <div className="rounded-surface border border-surface-border-subtle bg-surface-2 p-ds-04 flex flex-col gap-ds-02">
          <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
            Suggested archetype
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-ds-lg font-semibold text-surface-fg font-mono">
              {suggestion.name}
            </span>
          </div>
          <p className="text-ds-sm text-surface-fg-muted leading-relaxed">{suggestion.why}</p>
          <Link
            href={resultHref}
            className="mt-ds-02 inline-flex items-center gap-ds-02 self-start rounded-control bg-accent-9 px-ds-04 py-ds-02 text-ds-sm font-medium text-accent-fg hover:bg-accent-10"
          >
            Take this to result →
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-ds-04">
        <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide">
          Live preview · {suggestion.name}
        </span>
        <PreviewFrame
          archetype={suggestion.name}
          hue={hue}
          chroma={chroma}
          size="full"
        />
        <p className="text-ds-xs text-surface-fg-subtle">
          Preview uses the suggested archetype's role tokens with your accent.
        </p>
      </div>
    </div>
  )
}
