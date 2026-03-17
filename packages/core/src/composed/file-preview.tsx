'use client'

import * as React from 'react'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { Button } from '../ui/button'
import { IconDownload, IconZoomIn, IconZoomOut, IconZoomReset } from '@tabler/icons-react'

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

  // Embed patterns
  if (url.includes('figma.com') || url.includes('loom.com') || url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')) {
    return 'embed'
  }

  return 'image' // fallback
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // Figma
  if (url.includes('figma.com')) return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(url)}`

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([^?]+)/)
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`

  return url
}

// ============================================================
// Sub-renderers
// ============================================================

function ImagePreview({ url, alt }: { url: string; alt?: string }) {
  const [zoom, setZoom] = React.useState(1)
  const [loaded, setLoaded] = React.useState(false)

  return (
    <div className="relative flex flex-col items-center gap-ds-03">
      <div className="overflow-auto max-h-[70vh] max-w-full rounded-ds-md bg-surface-sunken">
        {!loaded && <Skeleton className="h-64 w-full rounded-ds-md" />}
        <img
          src={url}
          alt={alt ?? ''}
          onLoad={() => setLoaded(true)}
          className={cn('max-w-full transition-transform', !loaded && 'hidden')}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        />
      </div>
      <div className="flex items-center gap-ds-02">
        <Button variant="ghost" size="icon-xs" onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))} aria-label="Zoom out">
          <IconZoomOut className="h-ico-sm w-ico-sm" />
        </Button>
        <span className="text-ds-xs text-surface-fg-muted font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon-xs" onClick={() => setZoom((z) => Math.min(4, z + 0.25))} aria-label="Zoom in">
          <IconZoomIn className="h-ico-sm w-ico-sm" />
        </Button>
        <Button variant="ghost" size="icon-xs" onClick={() => setZoom(1)} aria-label="Reset zoom">
          <IconZoomReset className="h-ico-sm w-ico-sm" />
        </Button>
      </div>
    </div>
  )
}

function PdfPreview({ url, initialPage }: { url: string; initialPage?: number }) {
  const src = initialPage && initialPage > 1 ? `${url}#page=${initialPage}` : url
  return (
    <iframe
      src={src}
      title="PDF preview"
      className="h-[70vh] w-full rounded-ds-md border border-surface-border bg-surface-sunken"
    />
  )
}

function VideoPreview({ url }: { url: string }) {
  return (
    <video
      src={url}
      controls
      className="max-h-[70vh] w-full rounded-ds-md bg-black"
    />
  )
}

function AudioPreview({ url }: { url: string }) {
  return (
    <audio
      src={url}
      controls
      className="w-full"
    />
  )
}

function EmbedPreview({ url }: { url: string }) {
  const [loaded, setLoaded] = React.useState(false)
  const embedUrl = getEmbedUrl(url)

  return (
    <div className="relative">
      {!loaded && <Skeleton className="h-[70vh] w-full rounded-ds-md" />}
      <iframe
        src={embedUrl}
        title="Embedded content"
        onLoad={() => setLoaded(true)}
        className={cn('h-[70vh] w-full rounded-ds-md border border-surface-border', !loaded && 'hidden')}
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

  return (
    <div className={cn('flex flex-col gap-ds-03', className)} {...props}>
      {type === 'image' && <ImagePreview url={url} alt={alt} />}
      {type === 'pdf' && <PdfPreview url={url} initialPage={initialPage} />}
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
