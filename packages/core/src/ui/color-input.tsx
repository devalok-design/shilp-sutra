'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HexColorPicker } from 'react-colorful'
import { cn } from './lib/utils'
import { springs, durations } from './lib/motion'
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
  onBlur,
  disabled,
  maxLength = 3,
  prefix,
  className,
  id,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  disabled?: boolean
  maxLength?: number
  prefix?: string
  className?: string
  id: string
}) {
  return (
    <div className={cn('flex flex-col gap-ds-01', className)}>
      <label htmlFor={id} className="text-ds-xs font-medium uppercase tracking-wider text-surface-fg-muted">
        {label}
      </label>
      <div className="flex items-center">
        {prefix && (
          <span className="text-ds-sm text-surface-fg-muted">{prefix}</span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          maxLength={maxLength}
          className={cn(
            'h-ds-xs-plus w-full rounded-ds-sm border border-surface-border bg-surface-overlay px-ds-02 font-mono text-ds-sm text-surface-fg transition-colors',
            'focus:border-accent-7 focus:outline-hidden focus:ring-1 focus:ring-accent-9',
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
    const instanceId = React.useId()

    // Internal color state — syncs with prop, allows uncontrolled use
    const [internalColor, setInternalColor] = React.useState(value)
    React.useEffect(() => { setInternalColor(value) }, [value])

    // Track color when popover opened (for reset) + undo history
    const [openColor, setOpenColor] = React.useState(value)
    const [undoStack, setUndoStack] = React.useState<string[]>([])
    // Track whether current change is from continuous drag (skip undo push)
    const isDragging = React.useRef(false)

    const handleOpenChange = (isOpen: boolean) => {
      if (disabled) return
      if (isOpen) {
        setOpenColor(internalColor)
        setUndoStack([])
      }
      setOpen(isOpen)
    }

    // Discrete change (preset click, field commit) — pushes to undo
    const handleDiscreteChange = (newValue: string) => {
      if (disabled) return
      const normalized = newValue.startsWith('#') ? newValue : `#${newValue}`
      const hex = normalized.toLowerCase()
      setUndoStack((prev) => {
        if (prev[prev.length - 1] === internalColor) return prev
        return [...prev.slice(-19), internalColor]
      })
      setInternalColor(hex)
      onChange?.(hex)
    }

    // Continuous change (picker drag) — updates color but only pushes undo on drag start
    const handleChange = (newValue: string) => {
      if (disabled) return
      const normalized = newValue.startsWith('#') ? newValue : `#${newValue}`
      const hex = normalized.toLowerCase()
      if (!isDragging.current) {
        // First change in a drag sequence — push current color to undo
        isDragging.current = true
        setUndoStack((prev) => {
          if (prev[prev.length - 1] === internalColor) return prev
          return [...prev.slice(-19), internalColor]
        })
      }
      setInternalColor(hex)
      onChange?.(hex)
    }

    // Called when picker drag ends
    const handlePickerChangeComplete = () => {
      isDragging.current = false
    }

    const handleUndo = () => {
      if (undoStack.length === 0) return
      const prev = undoStack[undoStack.length - 1]
      setUndoStack((s) => s.slice(0, -1))
      setInternalColor(prev)
      onChange?.(prev)
    }

    const handleReset = () => {
      setInternalColor(openColor)
      onChange?.(openColor)
      setUndoStack([])
    }

    // Resolve presets
    const resolvedPresets = presets === false
      ? []
      : presets
        ? presets.map((p) =>
            typeof p === 'string' ? { hex: p, label: p } : p
          )
        : NAMED_PRESETS

    // Parsed color values — use internal state
    const rgb = hexToRgb(internalColor)
    const hsl = hexToHsl(internalColor)

    // RGB field handlers (clamped 0-255)
    const handleRgbChange = (channel: 'r' | 'g' | 'b', v: string) => {
      if (!rgb) return
      const num = parseInt(v, 10)
      if (isNaN(num)) return
      const clamped = Math.max(0, Math.min(255, num))
      handleDiscreteChange(rgbToHex(
        channel === 'r' ? clamped : rgb.r,
        channel === 'g' ? clamped : rgb.g,
        channel === 'b' ? clamped : rgb.b,
      ))
    }

    // HSL field handlers (H: 0-360, S/L: 0-100)
    const handleHslChange = (channel: 'h' | 's' | 'l', v: string) => {
      if (!hsl) return
      const num = parseInt(v, 10)
      if (isNaN(num)) return
      const max = channel === 'h' ? 360 : 100
      const clamped = Math.max(0, Math.min(max, num))
      handleDiscreteChange(hslToHex(
        channel === 'h' ? clamped : hsl.h,
        channel === 's' ? clamped : hsl.s,
        channel === 'l' ? clamped : hsl.l,
      ))
    }

    const formats: ColorFormat[] = ['hex', 'rgb', 'hsl']

    return (
      <div ref={ref} className={cn('inline-flex flex-col', className)} {...props}>
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            {variant === 'inline' ? (
              <motion.button
                type="button"
                disabled={disabled}
                className={cn(
                  'group flex items-center justify-center rounded-ds-md px-ds-04 py-ds-02 font-mono text-ds-sm font-medium',
                  'focus:outline-hidden focus:ring-2 focus:ring-accent-9 focus:ring-offset-2 focus:ring-offset-surface-base',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                animate={{
                  backgroundColor: internalColor,
                  color: isLightColor(internalColor) ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)',
                }}
                whileHover={{ y: -1, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                whileTap={{ scale: 0.97 }}
                transition={springs.smooth}
                aria-label={`Color picker: ${internalColor}`}
              >
                {internalColor.toUpperCase()}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                disabled={disabled}
                className={cn(
                  'group relative flex items-center overflow-hidden rounded-ds-md border border-surface-border-strong',
                  'hover:border-accent-7 focus:border-accent-7 focus:outline-hidden focus:ring-1 focus:ring-accent-9',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={springs.snappy}
                aria-label={`Color picker: ${internalColor}`}
              >
                {/* Gradient background: color → surface */}
                <motion.span
                  className="absolute inset-0"
                  animate={{
                    background: `linear-gradient(to right, ${internalColor} 0%, ${internalColor} 35%, transparent 70%)`,
                  }}
                  /* Between durations.moderate02 (0.24) and durations.slow01 (0.4) — gradient lerp feel */
                  transition={{ duration: 0.3 }}
                />
                <span className="absolute inset-0 bg-surface-overlay/60" style={{
                  maskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 40%)',
                }} />
                {/* Hex value */}
                <span className="relative z-10 py-ds-02 pl-6 pr-ds-03 font-mono text-ds-sm text-surface-fg">
                  {internalColor.toUpperCase()}
                </span>
              </motion.button>
            )}
          </PopoverTrigger>

          <PopoverContent
            role="dialog"
            aria-label="Color picker"
            align={align}
            sideOffset={8}
            className="w-[272px] rounded-ds-xl border border-surface-border-strong bg-surface-overlay p-0 shadow-floating"
          >
            <div className="flex flex-col">
              {/* Interactive picker */}
              {showPicker && (
                <div className="p-ds-04 pb-ds-03" onPointerUp={handlePickerChangeComplete} onPointerLeave={handlePickerChangeComplete}>
                  <HexColorPicker
                    color={internalColor}
                    onChange={handleChange}
                    className="w-full!"
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
                        'relative min-h-6 rounded-ds-sm px-ds-02 py-px text-ds-xs font-semibold uppercase tracking-wider transition-colors',
                        format === f
                          ? 'text-accent-11'
                          : 'text-surface-fg-muted hover:text-surface-fg',
                      )}
                    >
                      {format === f && (
                        <motion.span
                          layoutId={`color-input-format-pill-${instanceId}`}
                          className="absolute inset-0 rounded-ds-sm bg-accent-3"
                          transition={springs.snappy}
                        />
                      )}
                      <span className="relative z-10">{f}</span>
                    </button>
                  ))}
                </div>

                {/* Format fields — animated swap */}
                <AnimatePresence mode="wait">
                  {format === 'hex' && (
                    <motion.div
                      key="hex"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: durations.moderate01 }}
                      className="flex gap-ds-02"
                    >
                      <FormatInput
                        id={`${instanceId}-hex`}
                        label="Hex"
                        value={internalColor.replace('#', '').toUpperCase()}
                        onChange={(v) => {
                          const clean = v.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
                          if (clean.length === 6) handleDiscreteChange(`#${clean}`)
                        }}
                        onBlur={() => {
                          // Revert display to current color if input is incomplete
                          const display = internalColor.replace('#', '').toUpperCase()
                          if (display.length !== 6) setInternalColor(internalColor)
                        }}
                        disabled={disabled}
                        maxLength={6}
                        prefix="#"
                        className="flex-1"
                      />
                    </motion.div>
                  )}

                  {format === 'rgb' && rgb && (
                    <motion.div
                      key="rgb"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: durations.moderate01 }}
                      className="flex gap-ds-02"
                    >
                      <FormatInput id={`${instanceId}-r`} label="R" value={String(rgb.r)} onChange={(v) => handleRgbChange('r', v)} disabled={disabled} className="flex-1" />
                      <FormatInput id={`${instanceId}-g`} label="G" value={String(rgb.g)} onChange={(v) => handleRgbChange('g', v)} disabled={disabled} className="flex-1" />
                      <FormatInput id={`${instanceId}-b`} label="B" value={String(rgb.b)} onChange={(v) => handleRgbChange('b', v)} disabled={disabled} className="flex-1" />
                    </motion.div>
                  )}

                  {format === 'hsl' && hsl && (
                    <motion.div
                      key="hsl"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: durations.moderate01 }}
                      className="flex gap-ds-02"
                    >
                      <FormatInput id={`${instanceId}-h`} label="H" value={String(hsl.h)} onChange={(v) => handleHslChange('h', v)} disabled={disabled} className="flex-1" />
                      <FormatInput id={`${instanceId}-s`} label="S" value={String(hsl.s)} onChange={(v) => handleHslChange('s', v)} disabled={disabled} className="flex-1" />
                      <FormatInput id={`${instanceId}-l`} label="L" value={String(hsl.l)} onChange={(v) => handleHslChange('l', v)} disabled={disabled} className="flex-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Preset swatches */}
              {resolvedPresets.length > 0 && (
                <div className="border-t border-surface-border px-ds-04 py-ds-03">
                  <div className="flex flex-wrap gap-ds-02">
                    {resolvedPresets.map((preset, i) => {
                      const isSelected = internalColor.toLowerCase() === preset.hex.toLowerCase()
                      return (
                        <motion.button
                          key={preset.hex}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleDiscreteChange(preset.hex)}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: isSelected ? 1.15 : 1 }}
                          whileHover={{ scale: isSelected ? 1.15 : 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ ...springs.bouncy, delay: i * 0.02 }}
                          className={cn(
                            'h-6 w-6 rounded-ds-sm border',
                            isSelected
                              ? 'border-accent-7 ring-2 ring-accent-9/30'
                              : 'border-surface-border hover:border-surface-border-strong',
                            disabled && 'cursor-not-allowed opacity-50',
                          )}
                          style={{ backgroundColor: preset.hex }}
                          title={preset.label}
                          aria-label={`${preset.label}: ${preset.hex}`}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reset / Undo footer */}
              {(undoStack.length > 0 || internalColor !== openColor) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-ds-02 border-t border-surface-border px-ds-04 py-ds-02"
                >
                  {/* Original color preview */}
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-surface-border"
                    style={{ backgroundColor: openColor }}
                    title={`Original: ${openColor}`}
                  />
                  <span className="text-ds-xs text-surface-fg-muted">
                    {openColor.toUpperCase()}
                  </span>
                  <span className="flex-1" />
                  {undoStack.length > 0 && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="min-h-6 rounded-ds-sm px-ds-02 py-px text-ds-xs font-medium text-surface-fg-muted transition-colors hover:text-surface-fg"
                    >
                      Undo
                    </button>
                  )}
                  {internalColor !== openColor && (
                    <button
                      type="button"
                      onClick={handleReset}
                      className="min-h-6 rounded-ds-sm px-ds-02 py-px text-ds-xs font-medium text-surface-fg-muted transition-colors hover:text-error-11"
                    >
                      Reset
                    </button>
                  )}
                </motion.div>
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
