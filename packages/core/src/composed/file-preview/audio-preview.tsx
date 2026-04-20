'use client'

import { IconPlayerPause,IconPlayerPlay } from '@tabler/icons-react'
import * as React from 'react'

import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import { ErrorFallback, formatTime,VolumeControl } from './shared'

// ============================================================
// Audio Preview — Branded mini-player (Spotify/SoundCloud style)
// ============================================================

export default function AudioPreview({ url, fileName, onError }: { url: string; fileName?: string; onError?: (msg: string) => void }) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)

  // Keyboard shortcuts
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const el = containerRef.current
      if (!el || !el.contains(document.activeElement) && document.activeElement !== el) return
      const a = audioRef.current
      if (!a) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          setPlaying(prev => {
            if (prev) a.pause(); else a.play()
            return !prev
          })
          break
        case 'ArrowRight':
          e.preventDefault()
          a.currentTime = Math.min(a.duration || 0, a.currentTime + 5)
          break
        case 'ArrowLeft':
          e.preventDefault()
          a.currentTime = Math.max(0, a.currentTime - 5)
          break
        case 'm':
          e.preventDefault()
          setMuted(prev => {
            a.muted = !prev
            return !prev
          })
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
   
  }, [])

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
    setPlaying(!playing)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioRef.current.currentTime = pct * duration
  }

  function handleHover(e: React.MouseEvent<HTMLDivElement>) {
    if (!duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    setHoverTime(pct * duration)
  }

  function toggleMute() {
    if (!audioRef.current) return
    const next = !muted
    setMuted(next)
    audioRef.current.muted = next
  }

  if (error) return <ErrorFallback message="Could not load audio" url={url} />

  return (
    <div ref={containerRef} className="rounded-ds-lg border border-surface-border bg-surface-raised shadow-raised overflow-hidden" tabIndex={-1}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          if (!audioRef.current) return
          setCurrentTime(audioRef.current.currentTime)
          if (audioRef.current.duration) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        onError={() => { setError(true); onError?.('Audio failed to load') }}
      />

      {/* Progress bar — full width at top (Spotify style) */}
      <div
        className="relative h-1 w-full cursor-pointer bg-surface-sunken group/bar"
        onClick={handleSeek}
        onMouseMove={handleHover}
        onMouseLeave={() => setHoverTime(null)}
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        <div
          className="absolute left-0 top-0 h-full bg-accent-9 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
        {/* Hover time tooltip */}
        {hoverTime !== null && (
          <div
            className="absolute -top-7 -translate-x-1/2 rounded-ds-sm bg-surface-overlay px-1.5 py-0.5 text-[10px] font-mono text-surface-fg shadow-floating pointer-events-none"
            style={{ left: `${(hoverTime / (duration || 1)) * 100}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
        {/* Scrub handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-accent-9 shadow-raised opacity-0 group-hover/bar:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, marginLeft: '-5px' }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-ds-04 px-ds-05 py-ds-04">
        <Button
          variant="solid"
          size="icon-sm"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          title={playing ? 'Pause' : 'Play'}
          className="shrink-0"
        >
          {playing ? (
            <Icon icon={IconPlayerPause} size="sm" />
          ) : (
            <Icon icon={IconPlayerPlay} size="sm" className="ml-0.5" />
          )}
        </Button>

        {/* File name + time */}
        <div className="flex-1 min-w-0">
          {fileName && (
            <p className="text-ds-sm font-semibold text-surface-fg truncate">{fileName}</p>
          )}
          <p className="text-ds-xs font-mono text-surface-fg-muted tabular-nums">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>

        {/* Volume */}
        <VolumeControl
          volume={volume}
          muted={muted}
          onVolumeChange={(v) => {
            setVolume(v)
            if (audioRef.current) audioRef.current.volume = v
            if (v > 0 && muted) {
              setMuted(false)
              if (audioRef.current) audioRef.current.muted = false
            }
          }}
          onMuteToggle={toggleMute}
          variant="light"
        />
      </div>
    </div>
  )
}
