'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../ui/lib/utils'
import { tweens } from '../ui/lib/motion'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { IconDownload } from '@tabler/icons-react'

// ============================================================
// Types
// ============================================================

type FileType = 'image' | 'pdf' | 'video' | 'audio' | 'embed'

export interface FilePreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string
  /** Auto-detected from URL/mimeType if omitted */
  type?: FileType
  mimeType?: string
  alt?: string
  /** PDF starting page @default 1 */
  initialPage?: number
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

// ============================================================
// Lazy-loaded sub-renderers
// ============================================================

const LazyImagePreview = React.lazy(() =>
  import('react-zoom-pan-pinch').then((mod) => ({
    default: function ImagePreview({ url, alt }: { url: string; alt?: string }) {
      const { TransformWrapper, TransformComponent } = mod
      const [loaded, setLoaded] = React.useState(false)

      return (
        <div className="flex flex-col items-center gap-ds-03">
          <TransformWrapper
            initialScale={1}
            minScale={0.25}
            maxScale={4}
            centerOnInit
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="overflow-hidden max-h-[70vh] max-w-full rounded-ds-md bg-surface-sunken">
                  {!loaded && <Skeleton className="h-64 w-full rounded-ds-md" />}
                  <TransformComponent>
                    <motion.img
                      src={url}
                      alt={alt ?? ''}
                      onLoad={() => setLoaded(true)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: loaded ? 1 : 0 }}
                      transition={tweens.fade}
                      className={cn('max-w-full', !loaded && 'hidden')}
                    />
                  </TransformComponent>
                </div>
                {loaded && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={tweens.fade}
                    className="flex items-center gap-ds-02"
                  >
                    <Button variant="ghost" size="icon-xs" onClick={() => zoomOut()} aria-label="Zoom out">−</Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => resetTransform()} aria-label="Reset zoom">⟲</Button>
                    <Button variant="ghost" size="icon-xs" onClick={() => zoomIn()} aria-label="Zoom in">+</Button>
                  </motion.div>
                )}
              </>
            )}
          </TransformWrapper>
        </div>
      )
    },
  })),
)

const LazyPdfPreview = React.lazy(() =>
  import('react-pdf').then((mod) => ({
    default: function PdfPreview({ url, initialPage }: { url: string; initialPage: number }) {
      const { Document, Page, pdfjs } = mod

      // Set worker
      React.useEffect(() => {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
      }, [])

      const [numPages, setNumPages] = React.useState(0)
      const [page, setPage] = React.useState(initialPage)

      return (
        <div className="flex flex-col items-center gap-ds-03">
          <div className="overflow-auto max-h-[70vh] rounded-ds-md bg-surface-sunken border border-surface-border">
            <Document
              file={url}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              loading={<Skeleton className="h-[500px] w-[400px]" />}
              error={<div className="p-ds-06 text-center text-error-11 text-ds-sm">Failed to load PDF</div>}
            >
              <Page pageNumber={page} renderTextLayer={false} renderAnnotationLayer={false} />
            </Document>
          </div>
          {numPages > 1 && (
            <div className="flex items-center gap-ds-03">
              <Button variant="ghost" size="xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <span className="text-ds-sm text-surface-fg-muted font-mono">
                {page} / {numPages}
              </span>
              <Button variant="ghost" size="xs" onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages}>
                Next
              </Button>
            </div>
          )}
        </div>
      )
    },
  })),
)

// Non-lazy sub-renderers (native elements, no heavy deps)

function VideoPreview({ url }: { url: string }) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption -- captions are the consumer's responsibility
    <video src={url} controls className="max-h-[70vh] w-full rounded-ds-md bg-black" />
  )
}

function AudioPreview({ url }: { url: string }) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [currentTime, setCurrentTime] = React.useState(0)

  function togglePlay() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setPlaying(!playing)
  }

  function handleTimeUpdate() {
    if (!audioRef.current) return
    const { currentTime: ct, duration: d } = audioRef.current
    setCurrentTime(ct)
    if (d) setProgress((ct / d) * 100)
  }

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!audioRef.current || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    audioRef.current.currentTime = pct * duration
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-ds-04 rounded-ds-lg border border-surface-border bg-surface-raised px-ds-05 py-ds-04 shadow-raised">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <Button
        variant="solid"
        size="icon-sm"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className="shrink-0"
      >
        {playing ? (
          <svg className="h-ico-sm w-ico-sm" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
        ) : (
          <svg className="h-ico-sm w-ico-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14z" /></svg>
        )}
      </Button>
      <span className="text-ds-xs font-mono text-surface-fg-muted w-10 shrink-0">{formatTime(currentTime)}</span>
      <div
        className="relative flex-1 h-1.5 rounded-full bg-surface-sunken cursor-pointer"
        onClick={handleSeek}
        role="slider"
        aria-label="Audio progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-accent-9 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-ds-xs font-mono text-surface-fg-muted w-10 shrink-0 text-right">{formatTime(duration)}</span>
    </div>
  )
}

function EmbedPreview({ url }: { url: string }) {
  const [loaded, setLoaded] = React.useState(false)
  const embedUrl = getEmbedUrl(url)

  return (
    <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
      {!loaded && <Skeleton className="absolute inset-0 rounded-ds-md" />}
      <iframe
        src={embedUrl}
        title="Embedded content"
        onLoad={() => setLoaded(true)}
        className={cn('absolute inset-0 h-full w-full rounded-ds-md border border-surface-border', !loaded && 'hidden')}
        allowFullScreen
      />
    </div>
  )
}

// ============================================================
// FilePreview
// ============================================================

function FilePreview({
  url,
  type: typeProp,
  mimeType,
  alt,
  initialPage = 1,
  className,
  ...props
}: FilePreviewProps) {
  const type = typeProp ?? detectType(url, mimeType)

  const fallback = <Skeleton className="h-64 w-full rounded-ds-md" />

  return (
    <div className={cn('flex flex-col gap-ds-03', className)} {...props}>
      {type === 'image' && (
        <React.Suspense fallback={fallback}>
          <LazyImagePreview url={url} alt={alt} />
        </React.Suspense>
      )}
      {type === 'pdf' && (
        <React.Suspense fallback={fallback}>
          <LazyPdfPreview url={url} initialPage={initialPage} />
        </React.Suspense>
      )}
      {type === 'video' && <VideoPreview url={url} />}
      {type === 'audio' && <AudioPreview url={url} />}
      {type === 'embed' && <EmbedPreview url={url} />}

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="xs"
          startIcon={<IconDownload className="h-3.5 w-3.5" />}
          asChild
        >
          <a href={url} download target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </Button>
      </div>
    </div>
  )
}

export { FilePreview }
export type { FileType }
