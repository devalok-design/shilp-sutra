'use client'

import {
  IconMaximize,
  IconPlayerPause,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { AnimatePresence,motion } from 'framer-motion'
import * as React from 'react'

import { Icon } from '../../ui/icon'
import { springs, tweens } from '../../ui/lib/motion'
import { ErrorFallback, formatTime,MediaSlider,VolumeControl } from './shared'

// ============================================================
// Video Preview — Custom player with DS styling
// ============================================================

const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export default function VideoPreview({ url, onError }: { url: string; onError?: (msg: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const [playbackRate, setPlaybackRate] = React.useState(1)
  // Kept current every render so the mount-time keydown handler (empty deps)
  // reads the live rate instead of the stale initial 1x. See #91.
  const playbackRateRef = React.useRef(playbackRate)
  playbackRateRef.current = playbackRate
  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  React.useEffect(() => {
    return () => clearTimeout(hideTimer.current)
  }, [])

  // Keyboard shortcuts — YouTube style
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const el = containerRef.current
      if (!el || !el.contains(document.activeElement) && document.activeElement !== el) return
      const v = videoRef.current
      if (!v) return

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          setPlaying(prev => {
            if (prev) v.pause(); else v.play()
            return !prev
          })
          break
        case 'ArrowRight':
          e.preventDefault()
          v.currentTime = Math.min(v.duration, v.currentTime + 5)
          break
        case 'ArrowLeft':
          e.preventDefault()
          v.currentTime = Math.max(0, v.currentTime - 5)
          break
        case 'j':
          e.preventDefault()
          v.currentTime = Math.max(0, v.currentTime - 10)
          break
        case 'l':
          e.preventDefault()
          v.currentTime = Math.min(v.duration, v.currentTime + 10)
          break
        case 'm':
          e.preventDefault()
          setMuted(prev => {
            v.muted = !prev
            return !prev
          })
          break
        case 'f':
          e.preventDefault()
          v.requestFullscreen?.()
          break
        case '>':
          e.preventDefault()
          cyclePlaybackRate(1)
          break
        case '<':
          e.preventDefault()
          cyclePlaybackRate(-1)
          break
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  function cyclePlaybackRate(direction: 1 | -1) {
    const idx = PLAYBACK_RATES.indexOf(playbackRateRef.current as typeof PLAYBACK_RATES[number])
    const nextIdx = Math.max(0, Math.min(PLAYBACK_RATES.length - 1, idx + direction))
    const next = PLAYBACK_RATES[nextIdx]
    setPlaybackRate(next)
    if (videoRef.current) videoRef.current.playbackRate = next
  }

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
    setPlaying(!playing)
  }

  function handleSeek(nextProgress: number) {
    if (!videoRef.current || !duration) return
    videoRef.current.currentTime = (nextProgress / 100) * duration
  }

  function handleMouseMove() {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000)
    }
  }

  if (error) return <ErrorFallback message="Could not load video" url={url} />

  return (
    <div
      ref={containerRef}
      className="group relative rounded-control bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
      tabIndex={-1}
    >
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        src={url}
        className="max-h-[70vh] w-full"
        onClick={togglePlay}
        muted={muted}
        onTimeUpdate={() => {
          if (!videoRef.current) return
          setCurrentTime(videoRef.current.currentTime)
          if (videoRef.current.duration) setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100)
        }}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => { setPlaying(false); setShowControls(true) }}
        onError={() => { setError(true); onError?.('Video failed to load') }}
        playsInline
      />

      {/* Play button overlay — shown when paused */}
      {!playing && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springs.snappy}
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30"
          aria-label="Play video"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-pill bg-white/90 shadow-floating">
            <Icon icon={IconPlayerPlay} size="xl" className="text-surface-fg ml-0.5" />
          </div>
        </motion.button>
      )}

      {/* Bottom controls — auto-hide after 3s during playback */}
      <AnimatePresence>
        {showControls && duration > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={tweens.fade}
            className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-ds-04 pb-ds-04 pt-ds-08"
          >
            {/* Progress bar */}
            <MediaSlider
              className="mb-ds-03"
              value={progress}
              max={100}
              step={0.1}
              onValueChange={handleSeek}
              tone="dark"
              ariaLabel="Video progress"
            />

            {/* Controls row */}
            <div className="flex items-center gap-ds-03">
              <button onClick={togglePlay} className="text-white hover:text-white/80" aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>
                {playing ? <Icon icon={IconPlayerPause} size="lg" /> : <Icon icon={IconPlayerPlay} size="lg" />}
              </button>
              <VolumeControl
                volume={muted ? 0 : 1}
                muted={muted}
                onVolumeChange={(v) => {
                  if (videoRef.current) videoRef.current.volume = v
                  if (v > 0 && muted) { setMuted(false); if (videoRef.current) videoRef.current.muted = false }
                }}
                onMuteToggle={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted }}
                variant="dark"
              />
              <span className="text-body-sm font-mono text-white/70 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => cyclePlaybackRate(1)}
                className="text-body-sm font-mono text-white/70 hover:text-white px-1 rounded-control-inner hover:bg-white/10 transition-colors"
                aria-label={`Playback speed: ${playbackRate}x`}
              >
                {playbackRate}x
              </button>
              <button
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="text-white hover:text-white/80"
                aria-label="Fullscreen (F)"
                title="Fullscreen"
              >
                <Icon icon={IconMaximize} size="sm" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
