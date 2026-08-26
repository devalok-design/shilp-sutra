'use client'

import { useReducedMotion } from 'framer-motion'
import * as React from 'react'

import { cn } from '../../ui/lib/utils'
import { AudioWaveform } from './audio-waveform'

interface RecordingOverlayProps {
  duration: number
  analyserNode: AnalyserNode | null
  maxDuration?: number
  /** Escape key handler — cancel recording. Stop/cancel buttons are external. */
  onCancel: () => void
}

function formatTimer(seconds: number): { minutes: string; separator: string; secs: string } {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return {
    minutes: String(m),
    separator: ':',
    secs: s.toString().padStart(2, '0'),
  }
}

function RecordingOverlay({
  duration,
  analyserNode,
  maxDuration,
  onCancel,
}: RecordingOverlayProps) {
  const prefersReduced = useReducedMotion()

  // Escape key cancels recording
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  // Timing states
  const isWarning = maxDuration != null && maxDuration > 0 && duration >= maxDuration - 10
  const isCritical = maxDuration != null && maxDuration > 0 && duration >= maxDuration - 5

  // Pulse speed: faster when critical
  const pulseAnimation = isCritical
    ? 'animate-[pulse_500ms_ease-in-out_infinite]'
    : 'animate-[pulse_1s_ease-in-out_infinite]'

  const timer = formatTimer(duration)

  const timerColorClass = isCritical
    ? 'text-error-11'
    : isWarning
      ? 'text-warning-11'
      : 'text-surface-fg'

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Recording voice message"
      className="absolute inset-0 flex items-center gap-ds-03 px-ds-04 py-ds-03 bg-surface-panel-hover rounded-surface z-10"
    >
      {/* Red pulsing dot */}
      <span
        className={cn(
          'w-ds-02b h-ds-02b shrink-0 rounded-pill bg-error-9',
          prefersReduced ? 'opacity-100' : pulseAnimation
        )}
        aria-hidden="true"
      />

      {/* Timer */}
      <span
        className={cn(
          'text-body-sm font-mono tabular-nums whitespace-nowrap',
          timerColorClass
        )}
        aria-label={`${timer.minutes} minutes ${timer.secs} seconds`}
      >
        {timer.minutes}
        <span
          className={prefersReduced ? undefined : 'animate-[blink_1s_step-end_infinite]'}
          aria-hidden="true"
        >
          {timer.separator}
        </span>
        {timer.secs}
      </span>

      {/* Live waveform — stop/cancel buttons are external (right-side button area) */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <AudioWaveform
          mode="live"
          analyserNode={analyserNode}
          height={24}
          barCount={60}
          className="w-full"
        />
      </div>
    </div>
  )
}
RecordingOverlay.displayName = 'RecordingOverlay'

export { RecordingOverlay }
export type { RecordingOverlayProps }
