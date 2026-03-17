'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { tweens, springs } from '../ui/lib/motion'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import {
  IconDownload,
  IconMaximize,
  IconMinimize,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
  IconChevronLeft,
  IconChevronRight,
  IconPlayerPlay,
  IconPlayerPause,
  IconVolume,
  IconVolumeOff,
  IconAlertTriangle,
} from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

type FileType = 'image' | 'pdf' | 'video' | 'audio' | 'embed'

export interface FilePreviewProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onError'> {
  url: string
  /** Auto-detected from URL/mimeType if omitted */
  type?: FileType
  mimeType?: string
  alt?: string
  /** PDF starting page @default 1 */
  initialPage?: number
  /** File name for display */
  fileName?: string
  /** File size for display (e.g. '2.4 MB') */
  fileSize?: string
  /** Called on errors (broken URL, CORS, timeout) */
  onError?: (error: string) => void
}

// ============================================================
// Type Detection
// ============================================================

function detectType(url: string, mimeType?: string): FileType {
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
  }

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif', 'bmp'].includes(ext ?? '')) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext ?? '')) return 'video'
  if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext ?? '')) return 'audio'

  if (url.includes('figma.com') || url.includes('loom.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'embed'
  }

  return 'image'
}

function getEmbedUrl(url: string): string {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  if (url.includes('figma.com')) return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`

  const loomMatch = url.match(/loom\.com\/share\/([^?]+)/)
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`

  return url
}

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// ============================================================
// Shared: Error Fallback
// ============================================================

function ErrorFallback({ message, url }: { message: string; url: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-ds-04 rounded-ds-md border border-surface-border bg-surface-sunken p-ds-08 text-center">
      <IconAlertTriangle className="h-8 w-8 text-warning-9" />
      <div>
        <p className="text-ds-md font-semibold text-surface-fg">Preview unavailable</p>
        <p className="text-ds-sm text-surface-fg-muted mt-ds-01">{message}</p>
      </div>
      <Button variant="outline" size="xs" startIcon={<IconDownload className="h-3.5 w-3.5" />} asChild>
        <a href={url} download target="_blank" rel="noopener noreferrer">Download file</a>
      </Button>
    </div>
  )
}

// ============================================================
// Shared: Floating Toolbar
// ============================================================

function Toolbar({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={tweens.fade}
      className={cn(
        'flex items-center gap-ds-01 rounded-ds-md border border-surface-border bg-surface-overlay/95 px-ds-02 py-ds-01 shadow-floating backdrop-blur-sm',
        className,
      )}
    >
      {children}
    </motion.div>
  )
}

function ToolbarDivider() {
  return <div className="mx-ds-01 h-4 w-px bg-surface-border-subtle" />
}

// ============================================================
// Image Preview — Google Drive / Figma style
// ============================================================

const LazyImagePreview = React.lazy(() =>
  import('react-zoom-pan-pinch').then((mod) => ({
    default: function ImagePreview({ url, alt, onError }: { url: string; alt?: string; onError?: (msg: string) => void }) {
      const { TransformWrapper, TransformComponent } = mod
      const [loaded, setLoaded] = React.useState(false)
      const [error, setError] = React.useState(false)
      const [zoom, setZoom] = React.useState(100)
      const [fullscreen, setFullscreen] = React.useState(false)
      const containerRef = React.useRef<HTMLDivElement>(null)
      const [hovered, setHovered] = React.useState(false)
      const controlsRef = React.useRef<{
        zoomIn: () => void; zoomOut: () => void; resetTransform: () => void;
        centerView: (s: number) => void
      } | null>(null)

      // Keyboard shortcuts
      React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
          const el = containerRef.current
          if (!el) return
          const hasFocus = el.contains(document.activeElement)
          if (!hasFocus && !hovered) return
          const ctrl = controlsRef.current
          if (!ctrl) return

          if (e.key === '+' || e.key === '=') { e.preventDefault(); ctrl.zoomIn() }
          else if (e.key === '-') { e.preventDefault(); ctrl.zoomOut() }
          else if (e.key === '0') { e.preventDefault(); ctrl.resetTransform() }
          else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); setFullscreen((f) => !f) }
          else if (e.key === 'Escape' && fullscreen) { e.preventDefault(); setFullscreen(false) }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
      }, [hovered, fullscreen])

      if (error) return <ErrorFallback message="Could not load image" url={url} />

      const containerClasses = fullscreen
        ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm'
        : 'relative flex flex-col items-center gap-ds-03'

      return (
        <div
          ref={containerRef}
          className={containerClasses}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          tabIndex={-1}
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.1}
            maxScale={8}
            centerOnInit
            doubleClick={{ mode: 'toggle', step: 2 }}
            onTransformed={(_, state) => setZoom(Math.round(state.scale * 100))}
          >
            {({ zoomIn, zoomOut, resetTransform, centerView }) => {
              controlsRef.current = { zoomIn, zoomOut, resetTransform, centerView }
              return (
                <>
                  <div className={cn(
                    'overflow-hidden rounded-ds-md bg-surface-sunken',
                    fullscreen ? 'flex-1 w-full' : 'max-h-[70vh] max-w-full',
                  )}>
                    {!loaded && <Skeleton className="h-64 w-full rounded-ds-md" />}
                    <TransformComponent
                      wrapperClass={cn('!w-full', fullscreen && '!h-full')}
                      contentClass="!w-full !flex !items-center !justify-center"
                    >
                      <motion.img
                        src={url}
                        alt={alt ?? ''}
                        onLoad={() => setLoaded(true)}
                        onError={() => { setError(true); onError?.('Image failed to load') }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: loaded ? 1 : 0 }}
                        transition={tweens.fade}
                        className={cn('max-w-full select-none', !loaded && 'hidden', fullscreen && 'max-h-[90vh] object-contain')}
                        draggable={false}
                      />
                    </TransformComponent>
                  </div>

                  {/* Toolbar — Google Drive style */}
                  {loaded && (
                    <Toolbar className={fullscreen ? 'absolute bottom-ds-06' : undefined}>
                      <Button variant="ghost" size="icon-xs" onClick={() => zoomOut()} aria-label="Zoom out (-)">
                        <IconZoomOut className="h-ico-sm w-ico-sm" />
                      </Button>
                      <span className="text-ds-xs font-mono text-surface-fg-muted w-12 text-center tabular-nums select-none">
                        {zoom}%
                      </span>
                      <Button variant="ghost" size="icon-xs" onClick={() => zoomIn()} aria-label="Zoom in (+)">
                        <IconZoomIn className="h-ico-sm w-ico-sm" />
                      </Button>
                      <ToolbarDivider />
                      <Button variant="ghost" size="icon-xs" onClick={() => resetTransform()} aria-label="Reset zoom (0)">
                        <IconZoomReset className="h-ico-sm w-ico-sm" />
                      </Button>
                      <ToolbarDivider />
                      <Button variant="ghost" size="icon-xs" onClick={() => setFullscreen((f) => !f)} aria-label={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'}>
                        {fullscreen ? <IconMinimize className="h-ico-sm w-ico-sm" /> : <IconMaximize className="h-ico-sm w-ico-sm" />}
                      </Button>
                    </Toolbar>
                  )}
                </>
              )
            }}
          </TransformWrapper>
        </div>
      )
    },
  })),
)

// ============================================================
// PDF Preview — Adobe/Google Drive style
// ============================================================

const LazyPdfPreview = React.lazy(() =>
  import('react-pdf').then((mod) => ({
    default: function PdfPreview({ url, initialPage, onError }: { url: string; initialPage: number; onError?: (msg: string) => void }) {
      const { Document, Page, pdfjs } = mod

      React.useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      }, [])

      const [numPages, setNumPages] = React.useState(0)
      const [page, setPage] = React.useState(initialPage)
      const [pageInput, setPageInput] = React.useState(String(initialPage))
      const [error, setError] = React.useState(false)

      // Sync page input when page changes via buttons
      React.useEffect(() => { setPageInput(String(page)) }, [page])

      // Keyboard nav
      React.useEffect(() => {
        function handleKey(e: KeyboardEvent) {
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault()
            setPage((p) => Math.min(numPages, p + 1))
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault()
            setPage((p) => Math.max(1, p - 1))
          }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
      }, [numPages])

      function handlePageInputSubmit(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
          const n = parseInt(pageInput, 10)
          if (n >= 1 && n <= numPages) setPage(n)
          else setPageInput(String(page))
        }
      }

      if (error) return <ErrorFallback message="Could not load PDF" url={url} />

      return (
        <div className="flex flex-col items-center gap-ds-03">
          <div className="overflow-auto max-h-[70vh] rounded-ds-md bg-surface-sunken border border-surface-border">
            <Document
              file={url}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              onLoadError={() => { setError(true); onError?.('PDF failed to load') }}
              loading={<Skeleton className="h-[500px] w-[400px]" />}
              error={<ErrorFallback message="Failed to load PDF" url={url} />}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={page}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={tweens.fade}
                >
                  <Page pageNumber={page} renderTextLayer={false} renderAnnotationLayer={false} />
                </motion.div>
              </AnimatePresence>
            </Document>
          </div>

          {numPages > 0 && (
            <Toolbar>
              <Button variant="ghost" size="icon-xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page (←)">
                <IconChevronLeft className="h-ico-sm w-ico-sm" />
              </Button>
              <div className="flex items-center gap-ds-01 text-ds-xs text-surface-fg-muted">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={handlePageInputSubmit}
                  onBlur={() => setPageInput(String(page))}
                  className="w-8 bg-transparent text-center font-mono text-surface-fg outline-none focus:bg-surface-raised-hover rounded-ds-sm"
                  aria-label="Page number"
                />
                <span>/ {numPages}</span>
              </div>
              <Button variant="ghost" size="icon-xs" onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} aria-label="Next page (→)">
                <IconChevronRight className="h-ico-sm w-ico-sm" />
              </Button>
            </Toolbar>
          )}
        </div>
      )
    },
  })),
)

// ============================================================
// Video Preview — Custom player with DS styling
// ============================================================

function VideoPreview({ url, onError }: { url: string; onError?: (msg: string) => void }) {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [muted, setMuted] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [showControls, setShowControls] = React.useState(true)
  const hideTimer = React.useRef<ReturnType<typeof setTimeout>>()

  function togglePlay() {
    if (!videoRef.current) return
    if (playing) videoRef.current.pause()
    else videoRef.current.play()
    setPlaying(!playing)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!videoRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pct * duration
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
      className="group relative rounded-ds-md bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playing && setShowControls(false)}
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-floating">
            <IconPlayerPlay className="h-6 w-6 text-neutral-12 ml-1" />
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
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-ds-04 pb-ds-04 pt-ds-08"
          >
            {/* Progress bar */}
            <div
              className="relative h-1 w-full cursor-pointer rounded-full bg-white/30 mb-ds-03 group/progress"
              onClick={handleSeek}
              role="slider"
              aria-label="Video progress"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              tabIndex={0}
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-white transition-[width] duration-75"
                style={{ width: `${progress}%` }}
              />
              {/* Scrub handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-raised opacity-0 group-hover/progress:opacity-100 transition-opacity"
                style={{ left: `${progress}%`, marginLeft: '-6px' }}
              />
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-ds-03">
              <button onClick={togglePlay} className="text-white hover:text-white/80" aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <IconPlayerPause className="h-5 w-5" /> : <IconPlayerPlay className="h-5 w-5" />}
              </button>
              <button onClick={() => setMuted(!muted)} className="text-white hover:text-white/80" aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? <IconVolumeOff className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
              </button>
              <span className="text-[11px] font-mono text-white/70 tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              <div className="flex-1" />
              <button
                onClick={() => videoRef.current?.requestFullscreen?.()}
                className="text-white hover:text-white/80"
                aria-label="Fullscreen"
              >
                <IconMaximize className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================
// Audio Preview — Branded mini-player (Spotify/SoundCloud style)
// ============================================================

function AudioPreview({ url, fileName, onError }: { url: string; fileName?: string; onError?: (msg: string) => void }) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [volume, setVolume] = React.useState(1)
  const [muted, setMuted] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [hoverTime, setHoverTime] = React.useState<number | null>(null)

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
    <div className="rounded-ds-lg border border-surface-border bg-surface-raised shadow-raised overflow-hidden">
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
          className="shrink-0"
        >
          {playing ? (
            <IconPlayerPause className="h-ico-sm w-ico-sm" />
          ) : (
            <IconPlayerPlay className="h-ico-sm w-ico-sm ml-0.5" />
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
        <button onClick={toggleMute} className="text-surface-fg-muted hover:text-surface-fg transition-colors shrink-0" aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted || volume === 0 ? <IconVolumeOff className="h-ico-sm w-ico-sm" /> : <IconVolume className="h-ico-sm w-ico-sm" />}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// Embed Preview — 16:9 with error timeout
// ============================================================

function EmbedPreview({ url, onError }: { url: string; onError?: (msg: string) => void }) {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)
  const embedUrl = getEmbedUrl(url)

  // Timeout — if iframe doesn't load in 15s, show error
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (!loaded) { setError(true); onError?.('Embed timed out') }
    }, 15000)
    return () => clearTimeout(timer)
  }, [loaded, onError])

  if (error) return <ErrorFallback message="Could not load embed" url={url} />

  return (
    <div className="relative w-full rounded-ds-md overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
      {!loaded && <Skeleton className="absolute inset-0" />}
      <motion.iframe
        src={embedUrl}
        title="Embedded content"
        onLoad={() => setLoaded(true)}
        onError={() => { setError(true); onError?.('Embed failed to load') }}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={tweens.fade}
        className="absolute inset-0 h-full w-full border-none"
        allowFullScreen
      />
    </div>
  )
}

// ============================================================
// FilePreview — Main component
// ============================================================

function FilePreview({
  url,
  type: typeProp,
  mimeType,
  alt,
  initialPage = 1,
  fileName,
  fileSize,
  onError,
  className,
  ...props
}: FilePreviewProps) {
  const type = typeProp ?? detectType(url, mimeType)
  const fallback = <Skeleton className="h-64 w-full rounded-ds-md" />

  return (
    <div className={cn('flex flex-col gap-ds-03', className)} {...props}>
      {/* File info bar */}
      {(fileName || fileSize) && (
        <div className="flex items-center gap-ds-03">
          {fileName && <span className="text-ds-sm font-semibold text-surface-fg truncate">{fileName}</span>}
          {fileSize && <Badge variant="subtle" size="xs">{fileSize}</Badge>}
        </div>
      )}

      {/* Preview */}
      {type === 'image' && (
        <React.Suspense fallback={fallback}>
          <LazyImagePreview url={url} alt={alt} onError={onError} />
        </React.Suspense>
      )}
      {type === 'pdf' && (
        <React.Suspense fallback={fallback}>
          <LazyPdfPreview url={url} initialPage={initialPage} onError={onError} />
        </React.Suspense>
      )}
      {type === 'video' && <VideoPreview url={url} onError={onError} />}
      {type === 'audio' && <AudioPreview url={url} fileName={fileName} onError={onError} />}
      {type === 'embed' && <EmbedPreview url={url} onError={onError} />}

      {/* Download — not shown for audio (it has its own layout) */}
      {type !== 'audio' && (
        <div className="flex justify-end">
          <Button variant="ghost" size="xs" startIcon={<IconDownload className="h-3.5 w-3.5" />} asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">Download</a>
          </Button>
        </div>
      )}
    </div>
  )
}

export { FilePreview }
export type { FileType }
