'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { IconChevronDown, IconPalette } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { BRAND_PRESETS, DEFAULT_BRAND_ID } from '@/lib/brand-presets'
import {
  applyBrand,
  applyCustomColor,
  readPersistedBrand,
  readPersistedCustomColor,
} from '@/lib/brand-runtime'

/**
 * `align` controls which edge of the trigger the dropdown anchors to.
 *   'end'   → right-0 (default; trigger sits on the right of its container)
 *   'start' → left-0  (trigger sits on the left; dropdown opens rightward)
 */
export interface BrandSwitcherProps {
  align?: 'start' | 'end'
}

type Swatch = {
  /** Stable key — a preset id, or the hex for a curated colour. */
  key: string
  name: string
  /** Display colour for the chip. */
  color: string
  /** Present → apply the shipped, hand-tuned preset ramp instead of generating one. */
  preset?: string
}

// Shipped presets keep their tuned ramps; curated colours generate a ramp on the
// fly. Curated set is a spread of strong, recognisable brand hues so there's
// always a close starting point before reaching for the free picker.
const OFFICIAL: Swatch[] = BRAND_PRESETS.map((p) => ({
  key: p.id,
  name: p.name,
  color: p.ramp.light[8],
  preset: p.id,
}))

const CURATED: Swatch[] = [
  { key: '#2563EB', name: 'Blue', color: '#2563EB' },
  { key: '#0891B2', name: 'Cyan', color: '#0891B2' },
  { key: '#059669', name: 'Emerald', color: '#059669' },
  { key: '#7C3AED', name: 'Violet', color: '#7C3AED' },
  { key: '#C026D3', name: 'Fuchsia', color: '#C026D3' },
  { key: '#E11D48', name: 'Rose', color: '#E11D48' },
  { key: '#DC2626', name: 'Red', color: '#DC2626' },
  { key: '#EA580C', name: 'Orange', color: '#EA580C' },
  { key: '#D97706', name: 'Amber', color: '#D97706' },
  { key: '#64748B', name: 'Slate', color: '#64748B' },
]

const SWATCHES: Swatch[] = [...OFFICIAL, ...CURATED]

const DEFAULT_HEX = '#008c84'
const isHex = (v: string) => /^#?([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(v)

export function BrandSwitcher({ align = 'end' }: BrandSwitcherProps = {}) {
  // activeKey: a swatch key (preset id or curated hex) or null when the active
  // brand is a free/off-swatch custom colour.
  const [activeKey, setActiveKey] = useState<string | null>(DEFAULT_BRAND_ID)
  const [hex, setHex] = useState(DEFAULT_HEX)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedCustom = readPersistedCustomColor()
    if (savedCustom) {
      setHex(savedCustom)
      applyCustomColor(savedCustom, false)
      const match = SWATCHES.find((s) => s.key.toLowerCase() === savedCustom.toLowerCase())
      setActiveKey(match ? match.key : null)
    } else {
      setActiveKey(readPersistedBrand())
    }
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  const pickSwatch = (sw: Swatch) => {
    if (sw.preset) {
      applyBrand(sw.preset)
    } else {
      applyCustomColor(sw.color)
      setHex(sw.color)
    }
    setActiveKey(sw.key)
  }

  const pickHex = (value: string) => {
    setHex(value)
    if (!isHex(value)) return
    const normalized = value.startsWith('#') ? value : `#${value}`
    if (!applyCustomColor(normalized)) return
    const match = SWATCHES.find((s) => s.key.toLowerCase() === normalized.toLowerCase())
    setActiveKey(match ? match.key : null)
  }

  const activeSwatch = SWATCHES.find((s) => s.key === activeKey)
  const triggerLabel = !mounted ? 'Brand' : activeSwatch ? activeSwatch.name : 'Custom'
  const reduce = useReducedMotion()

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="solid"
        size="compact-sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Brand colour: ${triggerLabel}. Click to change.`}
        startIcon={<IconPalette size={14} />}
        endIcon={
          <IconChevronDown
            size={12}
            className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
          />
        }
      >
        <span className="hidden sm:inline">{triggerLabel}</span>
      </Button>

      <AnimatePresence>
        {open && (
        <motion.div
          role="dialog"
          aria-label="Choose a brand colour"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -6 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: reduce ? 0 : 0.16, ease: [0.23, 1, 0.32, 1] }}
          style={{ transformOrigin: align === 'start' ? 'top left' : 'top right' }}
          className={[
            'absolute mt-ds-03 w-[19rem] max-w-[calc(100vw-2rem)]',
            'rounded-overlay border border-surface-border-subtle bg-surface-overlay shadow-overlay',
            'z-popover overflow-hidden',
            align === 'start' ? 'left-0' : 'right-0',
          ].join(' ')}
        >
          {/* Presets — a full palette of strong starting hues. */}
          <div className="px-ds-05 pt-ds-05 pb-ds-04 flex flex-col gap-ds-04">
            <div className="flex items-baseline justify-between gap-ds-03">
              <p className="text-ds-sm font-semibold text-surface-fg">Brand colour</p>
              <p className="text-ds-xs text-surface-fg-subtle">{triggerLabel}</p>
            </div>
            <div className="grid grid-cols-7 gap-ds-03">
              {SWATCHES.map((sw) => {
                const isActive = sw.key === activeKey
                return (
                  <button
                    key={sw.key}
                    type="button"
                    onClick={() => pickSwatch(sw)}
                    aria-label={sw.name}
                    aria-pressed={isActive}
                    title={sw.name}
                    className={[
                      'group relative aspect-square w-full rounded-control transition-transform duration-fast-01',
                      'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-overlay',
                      isActive
                        ? 'ring-2 ring-surface-fg ring-offset-2 ring-offset-surface-overlay'
                        : 'ring-1 ring-inset ring-black/10',
                    ].join(' ')}
                    style={{ background: sw.color }}
                  />
                )
              })}
            </div>
          </div>

          {/* Custom — free colour pad + hex, for anything not in the palette. */}
          <div className="px-ds-05 py-ds-04 border-t border-surface-border-subtle flex flex-col gap-ds-03">
            <p className="text-ds-sm font-semibold text-surface-fg">Custom colour</p>
            <div className="flex items-center gap-ds-03">
              <label className="relative shrink-0 cursor-pointer" title="Open colour picker">
                <span
                  aria-hidden
                  className="block h-11 w-11 rounded-control ring-1 ring-inset ring-black/10"
                  style={{ background: isHex(hex) ? hex : DEFAULT_HEX }}
                />
                <input
                  type="color"
                  aria-label="Pick a custom colour"
                  value={/^#[a-fA-F0-9]{6}$/.test(hex) ? hex : DEFAULT_HEX}
                  onChange={(e) => pickHex(e.target.value)}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
              <div className="flex flex-1 flex-col gap-ds-01">
                <label htmlFor="brand-hex" className="text-ds-xs text-surface-fg-subtle">
                  Hex value
                </label>
                <input
                  id="brand-hex"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={hex}
                  placeholder="#008c84"
                  onChange={(e) => pickHex(e.target.value)}
                  className="w-full rounded-control-inner border border-surface-border-subtle bg-surface-raised px-ds-03 py-ds-02 font-mono text-ds-sm text-surface-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-8"
                />
              </div>
            </div>
          </div>

          <Link
            href="/theming"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-surface-border-subtle px-ds-05 py-ds-04 text-ds-sm text-surface-fg transition-colors duration-fast-01 hover:bg-surface-raised-hover"
          >
            <span>Open theming editor</span>
            <span className="text-surface-fg-subtle">→</span>
          </Link>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
