'use client'

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
    <div className="flex flex-col items-center justify-center gap-ds-04 rounded-ds-md border border-surface-border bg-surface-sunken p-ds-08 text-center">
      <Icon icon={IconAlertTriangle} size="2xl" className="text-warning-9" />
      <div>
        <p className="text-ds-md font-semibold text-surface-fg">Preview unavailable</p>
        <p className="text-ds-sm text-surface-fg-muted mt-ds-01">{message}</p>
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
        'flex items-center gap-ds-01 rounded-ds-md border border-surface-border bg-surface-overlay/95 px-ds-02 py-ds-01 shadow-floating backdrop-blur-xs',
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
// Shared: Volume Slider (Spotify/YouTube style)
// Custom-built — no native input range. Consistent across browsers.
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
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const displayVolume = muted ? 0 : volume

  function getVolumeFromEvent(e: MouseEvent | React.MouseEvent) {
    if (!trackRef.current) return volume
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  }

  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    setDragging(true)
    const v = getVolumeFromEvent(e)
    onVolumeChange(v)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    onVolumeChange(getVolumeFromEvent(e))
  }

  function handlePointerUp() {
    setDragging(false)
  }

  const isDark = variant === 'dark'
  const trackBg = isDark ? 'bg-white/30' : 'bg-surface-sunken'
  const fillBg = isDark ? 'bg-white' : 'bg-accent-9'
  const thumbBg = isDark ? 'bg-white' : 'bg-accent-9'
  const iconClass = isDark ? 'text-white hover:text-white/80' : 'text-surface-fg-muted hover:text-surface-fg'

  return (
    <div className="group/vol flex items-center gap-ds-02 shrink-0">
      <button onClick={onMuteToggle} className={cn('transition-colors', iconClass)} aria-label={muted ? 'Unmute (M)' : 'Mute (M)'} title={muted ? 'Unmute' : 'Mute'}>
        {muted || volume === 0 ? <Icon icon={IconVolumeOff} size="sm" /> : <Icon icon={IconVolume} size="sm" />}
      </button>
      <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-[width] duration-200 ease-productive-standard flex items-center">
        <div
          ref={trackRef}
          className={cn('relative w-full h-1 rounded-full cursor-pointer', trackBg)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="slider"
          aria-label="Volume"
          aria-valuenow={Math.round(displayVolume * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          {/* Fill */}
          <div
            className={cn('absolute left-0 top-0 h-full rounded-full transition-[width] duration-75', fillBg)}
            style={{ width: `${displayVolume * 100}%` }}
          />
          {/* Thumb */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full shadow-raised transition-opacity',
              thumbBg,
              dragging ? 'opacity-100 scale-110' : 'opacity-0 group-hover/vol:opacity-100',
            )}
            style={{ left: `${displayVolume * 100}%`, marginLeft: '-5px' }}
          />
        </div>
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
