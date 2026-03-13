'use client'

import * as React from 'react'
import { cn } from './lib/utils'

export interface ColorInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  ({ value = '#000000', onChange, presets, disabled = false, className, ...props }, ref) => {
    const handleChange = (newValue: string) => {
      onChange?.(newValue)
    }

    return (
      <div className={cn('flex flex-col gap-ds-03', className)} {...props}>
        <div className="flex items-center gap-ds-03">
          {/* Color swatch / native picker */}
          <label
            aria-label="Pick a color"
            className={cn(
              'relative flex h-ds-sm w-ds-sm shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-ds-md border border-surface-border-strong transition-colors hover:border-surface-border-strong',
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
              'h-ds-sm w-[90px] rounded-ds-md border border-surface-border-strong bg-surface-1 px-ds-03 font-mono text-ds-md text-surface-fg transition-colors',
              'focus:border-accent-7 focus:outline-none focus:ring-1 focus:ring-interactive',
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
                    ? 'border-accent-7 ring-1 ring-interactive'
                    : 'border-surface-border-strong hover:border-surface-border-strong',
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
