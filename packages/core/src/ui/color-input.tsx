'use client'

import * as React from 'react'
import { cn } from './lib/utils'

export interface ColorInputProps {
  /** Current color value (hex string, e.g. "#d33163") */
  value?: string
  /** Called when the color changes */
  onChange?: (value: string) => void
  /** Optional preset color swatches */
  presets?: string[]
  /** Whether the input is disabled */
  disabled?: boolean
  /** Additional className for the wrapper */
  className?: string
}

const ColorInput = React.forwardRef<HTMLInputElement, ColorInputProps>(
  ({ value = '#000000', onChange, presets, disabled = false, className }, ref) => {
    const handleChange = (newValue: string) => {
      onChange?.(newValue)
    }

    return (
      <div className={cn('flex flex-col gap-ds-03', className)}>
        <div className="flex items-center gap-ds-03">
          {/* Color swatch / native picker */}
          <label
            aria-label="Pick a color"
            className={cn(
              'relative flex h-ds-sm w-ds-sm shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-ds-md border border-border transition-colors hover:border-border-strong',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            <input
              ref={ref}
              type="color"
              value={value}
              disabled={disabled}
              onChange={(e) => handleChange(e.target.value)}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <span
              className="h-full w-full rounded-[inherit]"
              style={{ backgroundColor: value }}
            />
          </label>

          {/* Hex text input */}
          <input
            type="text"
            aria-label="Hex color value"
            value={value}
            disabled={disabled}
            onChange={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{0,6}$/.test(v)) {
                handleChange(v)
              }
            }}
            onBlur={(e) => {
              const v = e.target.value
              if (/^#[0-9a-fA-F]{6}$/.test(v)) {
                handleChange(v)
              }
            }}
            maxLength={7}
            className={cn(
              'h-ds-sm w-[90px] rounded-ds-md border border-border bg-layer-01 px-ds-03 font-mono text-ds-md text-text-primary transition-colors',
              'focus:border-interactive focus:outline-none focus:ring-1 focus:ring-interactive',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          />
        </div>

        {/* Preset swatches */}
        {presets && presets.length > 0 && (
          <div className="flex flex-wrap gap-ds-02">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => handleChange(preset)}
                className={cn(
                  'h-ds-xs w-ds-xs rounded-ds-sm border transition-colors',
                  value === preset
                    ? 'border-interactive ring-1 ring-interactive'
                    : 'border-border hover:border-border-strong',
                  disabled && 'cursor-not-allowed opacity-50',
                )}
                style={{ backgroundColor: preset }}
                aria-label={`Select color ${preset}`}
              />
            ))}
          </div>
        )}
      </div>
    )
  },
)
ColorInput.displayName = 'ColorInput'

export { ColorInput }
