'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { IconCheck, IconChevronDown, IconPalette } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { BRAND_PRESETS, DEFAULT_BRAND_ID } from '@/lib/brand-presets'
import { applyBrand, readPersistedBrand } from '@/lib/brand-runtime'

/**
 * `align` controls which edge of the trigger the dropdown anchors to.
 *   'end'   → right-0 (default; trigger sits on the right of its container)
 *   'start' → left-0  (trigger sits on the left; dropdown opens rightward)
 *
 * Mobile header puts the switcher on the *left* (next to the wordmark),
 * so the default `right-0` would clip the dropdown off the left edge of
 * the viewport. Pass `align="start"` in that placement.
 */
export interface BrandSwitcherProps {
  align?: 'start' | 'end'
}

export function BrandSwitcher({ align = 'end' }: BrandSwitcherProps = {}) {
  const [active, setActive] = useState<string>(DEFAULT_BRAND_ID)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActive(readPersistedBrand())
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

  const pick = (id: string) => {
    applyBrand(id)
    setActive(id)
    setOpen(false)
  }

  const activePreset = BRAND_PRESETS.find((p) => p.id === active) ?? BRAND_PRESETS[0]

  return (
    <div ref={containerRef} className="relative">
      {/* Soft accent — tinted but not loud. The swatch in the trigger label
          carries the actual brand colour; the soft bg gives just enough
          visual weight for "this is interactive" without shouting. */}
      <Button
        variant="soft"
        size="compact-sm"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Active brand: ${activePreset.name}. Click to change.`}
        startIcon={<IconPalette size={12} />}
        endIcon={<IconChevronDown size={12} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />}
      >
        <span className="hidden sm:inline">{mounted ? activePreset.name : 'Brand'}</span>
      </Button>

      {open && (
        <div
          role="listbox"
          aria-label="Brand presets"
          className={[
            'absolute mt-ds-02 w-72 max-w-[calc(100vw-2rem)] rounded-control',
            'bg-surface-overlay shadow-overlay z-popover overflow-hidden',
            align === 'start' ? 'left-0' : 'right-0',
          ].join(' ')}
        >
          <div className="px-ds-04 py-ds-03 border-b border-surface-border-subtle">
            <Text variant="label-sm" className="text-surface-fg-subtle">
              Brand presets
            </Text>
          </div>
          <ul className="py-ds-02">
            {BRAND_PRESETS.map((preset) => {
              const isActive = preset.id === active
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    onClick={() => pick(preset.id)}
                    className={[
                      'w-full flex items-center gap-ds-03 px-ds-04 py-ds-03 text-left transition-colors duration-fast-01',
                      isActive ? 'bg-surface-raised-hover' : 'hover:bg-surface-raised-hover',
                    ].join(' ')}
                  >
                    <span
                      aria-hidden
                      className="w-6 h-6 rounded-pill border border-surface-border-subtle shrink-0"
                      style={{ background: preset.ramp.light[8] }}
                    />
                    <span className="flex flex-col min-w-0 flex-1">
                      <span className="text-ds-sm text-surface-fg font-medium">{preset.name}</span>
                      <span className="text-ds-xs text-surface-fg-subtle truncate">{preset.description}</span>
                    </span>
                    {isActive && <IconCheck size={14} className="text-accent-9 shrink-0" />}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="border-t border-surface-border-subtle">
            <Link
              href="/theming"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-ds-04 py-ds-03 text-ds-sm text-surface-fg hover:bg-surface-raised-hover transition-colors duration-fast-01"
            >
              <span>Build your own</span>
              <span className="text-surface-fg-subtle">→</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
