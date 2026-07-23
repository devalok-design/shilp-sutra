'use client'

import { IconDownload } from '@tabler/icons-react'
import * as React from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Icon } from '../ui/icon'
import { cn } from '../ui/lib/utils'
import { Skeleton } from '../ui/skeleton'
import { TruncatedText } from '../ui/truncated-text'

// Sub-components: direct imports for non-peer-dep renderers,
// React.lazy for renderers that pull in optional peer deps
// (react-zoom-pan-pinch, react-pdf) to preserve code-splitting.
const LazyImagePreview = React.lazy(() => import('./file-preview/image-preview'))
const LazyDocumentPreview = React.lazy(() => import('./file-preview/document-preview'))
import AudioPreview from './file-preview/audio-preview'
import EmbedPreview from './file-preview/embed-preview'
import VideoPreview from './file-preview/video-preview'

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

// ============================================================
// FilePreview — Main component (router)
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
  const fallback = <Skeleton className="h-64 w-full rounded-control" />

  return (
    <div className={cn('flex flex-col gap-ds-03', className)} {...props}>
      {/* File info bar */}
      {(fileName || fileSize) && (
        <div className="flex items-center gap-ds-03">
          {fileName && (
            <TruncatedText mode="middle" className="min-w-0 text-body-sm font-semibold text-surface-fg">
              {fileName}
            </TruncatedText>
          )}
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
          <LazyDocumentPreview url={url} initialPage={initialPage} onError={onError} />
        </React.Suspense>
      )}
      {type === 'video' && <VideoPreview url={url} onError={onError} />}
      {type === 'audio' && <AudioPreview url={url} fileName={fileName} onError={onError} />}
      {type === 'embed' && <EmbedPreview url={url} embedUrl={getEmbedUrl(url)} onError={onError} />}

      {/* Download — not shown for audio (it has its own layout) */}
      {type !== 'audio' && (
        <div className="flex justify-end">
          <Button variant="ghost" size="xs" startIcon={<Icon icon={IconDownload} />} asChild>
            <a href={url} download target="_blank" rel="noopener noreferrer">Download</a>
          </Button>
        </div>
      )}
    </div>
  )
}

export { FilePreview }
export type { FileType }
