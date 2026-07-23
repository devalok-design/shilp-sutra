'use client'

import * as SliderPrimitive from '@primitives/react-slider'
import {
  IconAlertTriangle,
  IconDownload,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'

import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import { tweens } from '../../ui/lib/motion'
import { cn } from '../../ui/lib/utils'

// ============================================================
// Shared: Error Fallback
// ============================================================

export function ErrorFallback({ message, url }: { message: string; url: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-ds-04 rounded-control border border-surface-border bg-surface-sunken p-ds-08 text-center">
      <Icon icon={IconAlertTriangle} size="2xl" className="text-warning-9" />
      <div>
        <p className="text-body-md font-semibold text-surface-fg">Preview unavailable</p>
        <p className="text-body-sm text-surface-fg-muted mt-ds-01">{message}</p>
      </div>
      <Button variant="outline" size="xs" startIcon={<Icon icon={IconDownload} />} asChild>
        <a href={url} download target="_blank" rel="noopener noreferrer">Download file</a>
      </Button>
    </div>
  )
}

// ============================================================
// Shared: Floating Toolbar
// ============================================================

export function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tweens.fade}
      className={cn(
        'flex items-center gap-ds-01 rounded-control bg-surface-overlay/95 px-ds-02 py-ds-01 shadow-floating backdrop-blur-xs',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

export function ToolbarDivider() {
  return <div className="mx-ds-01 h-4 w-px bg-surface-border-subtle" />
}

// ============================================================
// Shared: MediaSlider — slim seek/scrub/volume control
// Composes the Radix Slider primitive (the same one ui/Slider uses) so it's
// keyboard-operable (Arrow/Home/End), shows a visible focus ring, and forced-colors-safe —
// unlike the old mouse-only <div role="slider">. Styled slim for media chrome;
// the thumb is hover/focus-reveal (hidden at rest, shown on hover, drag, or
// keyboard focus). `tone="dark"` = white-on-overlay; `tone="light"` = accent.
// ============================================================

export function MediaSlider({
  value,
  max = 100,
  step = 1,
  onValueChange,
  tone = 'light',
  ariaLabel,
  disabled,
  className,
}: {
  value: number
  max?: number
  step?: number
  onValueChange: (v: number) => void
  tone?: 'light' | 'dark'
  ariaLabel: string
  disabled?: boolean
  className?: string
}) {
  const isDark = tone === 'dark'
  return (
    <SliderPrimitive.Root
      className={cn(
        'group/ms relative flex h-3 w-full cursor-pointer touch-none select-none items-center',
        className,
      )}
      value={[value]}
      max={max}
      step={step}
      disabled={disabled}
      onValueChange={(vals) => onValueChange(vals[0] ?? 0)}
      aria-label={ariaLabel}
    >
      <SliderPrimitive.Track
        className={cn(
          'relative h-1 w-full grow overflow-hidden rounded-pill',
          isDark ? 'bg-white/30' : 'bg-surface-sunken',
        )}
      >
        <SliderPrimitive.Range
          className={cn('absolute h-full rounded-pill', isDark ? 'bg-white' : 'bg-accent-9')}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={cn(
          'block h-3 w-3 rounded-pill shadow-raised outline-hidden transition-[opacity,transform] duration-fast-02',
          // hover/focus-reveal: hidden at rest, shown on hover, drag (focus), or keyboard
          'opacity-0 group-hover/ms:opacity-100 focus:opacity-100 active:scale-110',
          'focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-1',
          isDark ? 'bg-white focus-visible:ring-white' : 'bg-accent-9 focus-visible:ring-accent-9',
        )}
      />
    </SliderPrimitive.Root>
  )
}

// ============================================================
// Shared: Volume Slider (Spotify/YouTube style)
// ============================================================

export function VolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMuteToggle,
  variant = 'light',
}: {
  volume: number
  muted: boolean
  onVolumeChange: (v: number) => void
  onMuteToggle: () => void
  variant?: 'light' | 'dark'
}) {
  const displayVolume = muted ? 0 : volume
  const isDark = variant === 'dark'
  const iconClass = isDark ? 'text-white hover:text-white/80' : 'text-surface-fg-muted hover:text-surface-fg'

  return (
    <div className="flex items-center gap-ds-02 shrink-0 group/vol">
      <button onClick={onMuteToggle} className={cn('transition-colors', iconClass)} aria-label={muted ? 'Unmute (M)' : 'Mute (M)'} title={muted ? 'Unmute' : 'Mute'}>
        {muted || volume === 0 ? <Icon icon={IconVolumeOff} size="sm" /> : <Icon icon={IconVolume} size="sm" />}
      </button>
      <div className="flex w-0 items-center overflow-hidden transition-[width] duration-200 ease-productive-standard group-hover/vol:w-20 focus-within:w-20">
        <MediaSlider
          value={displayVolume}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
          tone={variant}
          ariaLabel="Volume"
        />
      </div>
    </div>
  )
}

// ============================================================
// Shared: Time Formatting
// ============================================================

export function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}
