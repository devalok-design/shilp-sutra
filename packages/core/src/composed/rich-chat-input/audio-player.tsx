'use client'

import * as React from 'react'
import { IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react'
import { cn } from '../../ui/lib/utils'
import { AudioWaveform } from './audio-waveform'

interface AudioPlayerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  src: string | Blob
  duration: number
  waveformData?: number[]
}

const SPEEDS = [1, 1.5, 2] as const

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const AudioPlayer = React.forwardRef<HTMLDivElement, AudioPlayerProps>(
  function AudioPlayer({ src, duration, waveformData, className, ...props }, ref) {
    const audioRef = React.useRef<HTMLAudioElement>(null)
    const waveformRef = React.useRef<SVGSVGElement>(null)
    const [playing, setPlaying] = React.useState(false)
    const [currentTime, setCurrentTime] = React.useState(0)
    const [speedIndex, setSpeedIndex] = React.useState(0)
    const [objectUrl, setObjectUrl] = React.useState<string | null>(null)

    // Resolve src to a URL string, managing Blob object URLs
    const audioSrc = React.useMemo(() => {
      if (typeof src === 'string') return src
      const url = URL.createObjectURL(src)
      setObjectUrl(url)
      return url
    }, [src])

    // Revoke object URL on src change or unmount
    React.useEffect(() => {
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }
      }
    }, [objectUrl])

    // Sync audio timeupdate to state
    React.useEffect(() => {
      const audio = audioRef.current
      if (!audio) return

      const onTimeUpdate = () => setCurrentTime(audio.currentTime)
      const onEnded = () => {
        setPlaying(false)
        setCurrentTime(0)
      }

      audio.addEventListener('timeupdate', onTimeUpdate)
      audio.addEventListener('ended', onEnded)
      return () => {
        audio.removeEventListener('timeupdate', onTimeUpdate)
        audio.removeEventListener('ended', onEnded)
      }
    }, [])

    const togglePlay = React.useCallback(() => {
      const audio = audioRef.current
      if (!audio) return

      if (playing) {
        audio.pause()
        setPlaying(false)
      } else {
        audio.play()
        setPlaying(true)
      }
    }, [playing])

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          togglePlay()
        }
      },
      [togglePlay]
    )

    const handleSeek = React.useCallback(
      (e: React.MouseEvent<SVGSVGElement>) => {
        const audio = audioRef.current
        const svg = waveformRef.current
        if (!audio || !svg || duration <= 0) return

        const rect = svg.getBoundingClientRect()
        const x = e.clientX - rect.left
        const ratio = Math.max(0, Math.min(1, x / rect.width))
        audio.currentTime = ratio * duration
        setCurrentTime(audio.currentTime)
      },
      [duration]
    )

    const cycleSpeed = React.useCallback(() => {
      const next = (speedIndex + 1) % SPEEDS.length
      setSpeedIndex(next)
      if (audioRef.current) {
        audioRef.current.playbackRate = SPEEDS[next]
      }
    }, [speedIndex])

    const progress = duration > 0 ? currentTime / duration : 0
    const speed = SPEEDS[speedIndex]

    return (
      <div
        ref={ref}
        role="group"
        aria-label="Voice message player"
        className={cn('flex items-center gap-ds-03', className)}
        {...props}
      >
        {/* Hidden audio element — captions not applicable for voice messages */}
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} src={audioSrc} preload="metadata" />

        {/* Play/Pause button */}
        <button
          type="button"
          onClick={togglePlay}
          onKeyDown={handleKeyDown}
          aria-label={playing ? 'Pause voice message' : 'Play voice message'}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-ds-full bg-accent-9 text-accent-fg hover:bg-accent-10 active:scale-95 transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2"
        >
          {playing ? (
            <IconPlayerPause size={16} stroke={2} aria-hidden="true" />
          ) : (
            <IconPlayerPlay size={16} stroke={2} aria-hidden="true" />
          )}
        </button>

        {/* Waveform with seek */}
        <AudioWaveform
          ref={waveformRef}
          mode="static"
          data={waveformData}
          progress={progress}
          className="cursor-pointer"
          onClick={handleSeek}
        />

        {/* Duration display */}
        <span className="text-ds-xs tabular-nums text-surface-fg-subtle whitespace-nowrap">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Speed control */}
        <button
          type="button"
          onClick={cycleSpeed}
          aria-label={`Playback speed ${speed}x`}
          className="shrink-0 text-ds-xs bg-surface-raised rounded-ds-full px-ds-02 py-[1px] hover:bg-surface-raised-hover tabular-nums transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2"
        >
          {speed}x
        </button>
      </div>
    )
  }
)
AudioPlayer.displayName = 'AudioPlayer'

export { AudioPlayer }
export type { AudioPlayerProps }
