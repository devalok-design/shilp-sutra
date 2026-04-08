'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconSquare, IconTrash } from '@tabler/icons-react'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import { cn } from '../../ui/lib/utils'
import { AudioWaveform } from './audio-waveform'

interface RecordingOverlayProps {
  duration: number
  analyserNode: AnalyserNode | null
  maxDuration?: number
  onStop: () => void
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
  onStop,
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
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.24, ease: [0.2, 0, 0.38, 0.9] }}
      role="status"
      aria-live="polite"
      aria-label="Recording voice message"
      className="flex items-center gap-ds-03 px-ds-04 py-ds-03"
    >
      {/* Red pulsing dot */}
      <span
        className={cn(
          'w-ds-02b h-ds-02b shrink-0 rounded-ds-full bg-error-9',
          prefersReduced ? 'opacity-100' : pulseAnimation
        )}
        aria-hidden="true"
      />

      {/* Timer */}
      <span
        className={cn(
          'text-ds-sm font-mono tabular-nums whitespace-nowrap',
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

      {/* Live waveform */}
      <AudioWaveform
        mode="live"
        analyserNode={analyserNode}
        height={28}
        barCount={30}
      />

      {/* Stop button */}
      <Button variant="ghost" size="icon-sm" onClick={onStop} title="Stop recording">
        <Icon icon={IconSquare} />
      </Button>

      {/* Cancel button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onCancel}
        title="Cancel recording"
        className="text-surface-fg-subtle hover:text-error-11"
      >
        <Icon icon={IconTrash} />
      </Button>
    </motion.div>
  )
}
RecordingOverlay.displayName = 'RecordingOverlay'

export { RecordingOverlay }
export type { RecordingOverlayProps }
