'use client'

import * as React from 'react'
import { HexColorPicker } from 'react-colorful'
import { cn } from './lib/utils'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover'

// ── Color conversion helpers ──

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return null
  const n = parseInt(m[1], 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max - min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100, ln = l / 100
  const a = sn * Math.min(ln, 1 - ln)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c)
  }
  return rgbToHex(f(0), f(8), f(4))
}

// ── Named color presets (color-blind accessible) ──

const NAMED_PRESETS: { hex: string; label: string }[] = [
  { hex: '#EF4444', label: 'Red' },
  { hex: '#F59E0B', label: 'Amber' },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#3B82F6', label: 'Blue' },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#EC4899', label: 'Pink' },
  { hex: '#06B6D4', label: 'Cyan' },
  { hex: '#F97316', label: 'Orange' },
  { hex: '#84CC16', label: 'Lime' },
  { hex: '#6366F1', label: 'Indigo' },
]

// ── Contrast helper ──

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  // Relative luminance (sRGB)
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4
}

// ── Format mode type ──

type ColorFormat = 'hex' | 'rgb' | 'hsl'

// ── Props ──

export interface ColorInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current color value (hex string, e.g. "#d33163") */
  value?: string
  /** Called when the color changes */
  onChange?: (value: string) => void
  /** Preset color swatches. Defaults to 10 named colors. Pass `false` to hide. */
  presets?: { hex: string; label: string }[] | string[] | false
  /** Whether the input is disabled */
  disabled?: boolean
  /** Show the interactive color picker. Default: true. */
  showPicker?: boolean
  /** Default format for the input fields. Default: 'hex'. */
  defaultFormat?: ColorFormat
  /** Popover alignment. Default: 'start'. */
  align?: 'start' | 'center' | 'end'
  /**
   * Trigger style variant.
   * - `default`: Swatch bleeds to left edge + hex text
   * - `inline`: Entire trigger is the selected color with hex text overlaid
   */
  variant?: 'default' | 'inline'
}

// ── Small format input ──

function FormatInput({
  label,
  value,
  onChange,
  disabled,
  maxLength = 3,
  prefix,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  maxLength?: number
  prefix?: string
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-ds-01', className)}>
      <label className="text-[10px] font-medium uppercase tracking-wider text-surface-fg-muted">
        {label}
      </label>
      <div className="flex items-center">
        {prefix && (
          <span className="text-ds-sm text-surface-fg-muted">{prefix}</span>
        )}
        <input
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className={cn(
            'h-ds-xs-plus w-full rounded-ds-sm border border-surface-border bg-surface-overlay px-ds-02 font-mono text-ds-sm text-surface-fg transition-colors',
            'focus:border-accent-7 focus:outline-none focus:ring-1 focus:ring-accent-9',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        />
      </div>
    </div>
  )
}

// ── Main component ──

const ColorInput = React.forwardRef<HTMLDivElement, ColorInputProps>(
  ({
    value = '#000000',
    onChange,
    presets,
    disabled = false,
    showPicker = true,
    defaultFormat = 'hex',
    align = 'start',
    variant = 'default',
    className,
    ...props
  }, ref) => {
    const [format, setFormat] = React.useState<ColorFormat>(defaultFormat)
    const [open, setOpen] = React.useState(false)

    const handleChange = (newValue: string) => {
      if (disabled) return
      const normalized = newValue.startsWith('#') ? newValue : `#${newValue}`
      onChange?.(normalized.toLowerCase())
    }

    // Resolve presets
    const resolvedPresets = presets === false
      ? []
      : presets
        ? presets.map((p) =>
            typeof p === 'string' ? { hex: p, label: p } : p
          )
        : NAMED_PRESETS

    // Parsed color values
    const rgb = hexToRgb(value)
    const hsl = hexToHsl(value)

    // RGB field handlers
    const handleRgbChange = (channel: 'r' | 'g' | 'b', v: string) => {
      if (!rgb) return
      const num = parseInt(v, 10)
      if (isNaN(num)) return
      handleChange(rgbToHex(
        channel === 'r' ? num : rgb.r,
        channel === 'g' ? num : rgb.g,
        channel === 'b' ? num : rgb.b,
      ))
    }

    // HSL field handlers
    const handleHslChange = (channel: 'h' | 's' | 'l', v: string) => {
      if (!hsl) return
      const num = parseInt(v, 10)
      if (isNaN(num)) return
      handleChange(hslToHex(
        channel === 'h' ? num : hsl.h,
        channel === 's' ? num : hsl.s,
        channel === 'l' ? num : hsl.l,
      ))
    }

    const formats: ColorFormat[] = ['hex', 'rgb', 'hsl']

    return (
      <div ref={ref} className={cn('inline-flex flex-col', className)} {...props}>
        <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
          <PopoverTrigger asChild>
            {variant === 'inline' ? (
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  'group flex items-center justify-center rounded-ds-md px-ds-04 py-ds-02 font-mono text-ds-sm font-medium transition-all',
                  'hover:shadow-raised-hover hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-accent-9 focus:ring-offset-2 focus:ring-offset-surface-base',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                style={{
                  backgroundColor: value,
                  color: isLightColor(value) ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                }}
                aria-label={`Color picker: ${value}`}
              >
                {value.toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  'group relative flex items-center overflow-hidden rounded-ds-md border border-surface-border-strong transition-colors',
                  'hover:border-accent-7 focus:border-accent-7 focus:outline-none focus:ring-1 focus:ring-accent-9',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                aria-label={`Color picker: ${value}`}
              >
                {/* Gradient background: color → surface */}
                <span
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to right, ${value} 0%, ${value} 20%, transparent 85%)`,
                  }}
                />
                <span className="absolute inset-0 bg-surface-overlay/60" style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%)',
                }} />
                {/* Hex value */}
                <span className="relative z-10 py-ds-02 pl-10 pr-ds-03 font-mono text-ds-sm text-surface-fg">
                  {value.toUpperCase()}
                </span>
              </button>
            )}
          </PopoverTrigger>

          <PopoverContent
            align={align}
            sideOffset={8}
            className="w-[272px] rounded-ds-xl border border-surface-border-strong bg-surface-overlay p-0 shadow-floating"
          >
            <div className="flex flex-col">
              {/* Interactive picker */}
              {showPicker && (
                <div className="p-ds-04 pb-ds-03">
                  <HexColorPicker
                    color={value}
                    onChange={handleChange}
                    className="!w-full"
                    style={{ height: 160 }}
                  />
                </div>
              )}

              {/* Format inputs */}
              <div className="border-t border-surface-border px-ds-04 py-ds-03">
                {/* Format switcher */}
                <div className="mb-ds-03 flex items-center gap-ds-01">
                  {formats.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={cn(
                        'rounded-ds-sm px-ds-02 py-px text-[10px] font-semibold uppercase tracking-wider transition-colors',
                        format === f
                          ? 'bg-accent-3 text-accent-11'
                          : 'text-surface-fg-muted hover:text-surface-fg',
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Format fields */}
                {format === 'hex' && (
                  <div className="flex gap-ds-02">
                    <FormatInput
                      label="Hex"
                      value={value.replace('#', '').toUpperCase()}
                      onChange={(v) => {
                        const clean = v.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                        if (clean.length === 6) handleChange(`#${clean}`)
                      }}
                      disabled={disabled}
                      maxLength={6}
                      prefix="#"
                      className="flex-1"
                    />
                  </div>
                )}

                {format === 'rgb' && rgb && (
                  <div className="flex gap-ds-02">
                    <FormatInput label="R" value={String(rgb.r)} onChange={(v) => handleRgbChange('r', v)} disabled={disabled} className="flex-1" />
                    <FormatInput label="G" value={String(rgb.g)} onChange={(v) => handleRgbChange('g', v)} disabled={disabled} className="flex-1" />
                    <FormatInput label="B" value={String(rgb.b)} onChange={(v) => handleRgbChange('b', v)} disabled={disabled} className="flex-1" />
                  </div>
                )}

                {format === 'hsl' && hsl && (
                  <div className="flex gap-ds-02">
                    <FormatInput label="H" value={String(hsl.h)} onChange={(v) => handleHslChange('h', v)} disabled={disabled} className="flex-1" />
                    <FormatInput label="S" value={String(hsl.s)} onChange={(v) => handleHslChange('s', v)} disabled={disabled} className="flex-1" />
                    <FormatInput label="L" value={String(hsl.l)} onChange={(v) => handleHslChange('l', v)} disabled={disabled} className="flex-1" />
                  </div>
                )}
              </div>

              {/* Preset swatches */}
              {resolvedPresets.length > 0 && (
                <div className="border-t border-surface-border px-ds-04 py-ds-03">
                  <div className="flex flex-wrap gap-ds-02">
                    {resolvedPresets.map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          handleChange(preset.hex)
                        }}
                        className={cn(
                          'h-6 w-6 rounded-ds-sm border transition-all',
                          value.toLowerCase() === preset.hex.toLowerCase()
                            ? 'border-accent-7 ring-2 ring-accent-9/30 scale-110'
                            : 'border-surface-border hover:border-surface-border-strong hover:scale-105',
                          disabled && 'cursor-not-allowed opacity-50',
                        )}
                        style={{ backgroundColor: preset.hex }}
                        title={preset.label}
                        aria-label={`${preset.label}: ${preset.hex}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
ColorInput.displayName = 'ColorInput'

export { ColorInput }
