'use client'

import {
  IconMaximize,
  IconMinimize,
  IconZoomIn,
  IconZoomOut,
  IconZoomReset,
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import * as React from 'react'
import { TransformComponent,TransformWrapper } from 'react-zoom-pan-pinch'

import { MotionPreference } from '../../motion/motion-preference'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import { tweens } from '../../ui/lib/motion'
import { cn } from '../../ui/lib/utils'
import { Skeleton } from '../../ui/skeleton'
import { ErrorFallback, Toolbar, ToolbarDivider } from './shared'

// ============================================================
// Image Preview — Google Drive / Figma style
// ============================================================

export default function ImagePreview({ url, alt, onError }: { url: string; alt?: string; onError?: (msg: string) => void }) {
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
    ? 'fixed inset-0 z-modal flex flex-col items-center justify-center bg-black/90 backdrop-blur-xs'
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
        onTransform={(_: unknown, state: { scale: number }) => setZoom(Math.round(state.scale * 100))}
      >
        {({ zoomIn, zoomOut, resetTransform, centerView }) => {
          controlsRef.current = { zoomIn, zoomOut, resetTransform, centerView }
          return (
            <MotionPreference>
              <>
                <div className={cn(
                  'overflow-hidden rounded-control bg-surface-sunken',
                  fullscreen ? 'flex-1 w-full' : 'max-h-[70vh] max-w-full',
                )}>
                  {!loaded && <Skeleton className="h-64 w-full rounded-control" />}
                  <TransformComponent
                    wrapperClass={cn('w-full!', fullscreen && 'h-full!')}
                    contentClass="w-full! flex! items-center! justify-center!"
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
                    <Button variant="ghost" size="icon-xs" onClick={() => zoomOut()} aria-label="Zoom out (-)" title="Zoom out">
                      <Icon icon={IconZoomOut} size="sm" />
                    </Button>
                    <span className="text-caption font-mono text-surface-fg-muted w-12 text-center tabular-nums select-none">
                      {zoom}%
                    </span>
                    <Button variant="ghost" size="icon-xs" onClick={() => zoomIn()} aria-label="Zoom in (+)" title="Zoom in">
                      <Icon icon={IconZoomIn} size="sm" />
                    </Button>
                    <ToolbarDivider />
                    <Button variant="ghost" size="icon-xs" onClick={() => resetTransform()} aria-label="Reset zoom (0)" title="Reset zoom">
                      <Icon icon={IconZoomReset} size="sm" />
                    </Button>
                    <ToolbarDivider />
                    <Button variant="ghost" size="icon-xs" onClick={() => setFullscreen((f) => !f)} aria-label={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen (F)'} title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                      {fullscreen ? <Icon icon={IconMinimize} size="sm" /> : <Icon icon={IconMaximize} size="sm" />}
                    </Button>
                  </Toolbar>
                )}
              </>
            </MotionPreference>
          )
        }}
      </TransformWrapper>
    </div>
  )
}
