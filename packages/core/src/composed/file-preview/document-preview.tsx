'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { tweens } from '../../ui/lib/motion'
import { Skeleton } from '../../ui/skeleton'
import { Button } from '../../ui/button'
import { Icon } from '../../ui/icon'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ErrorFallback, Toolbar } from './shared'

// ============================================================
// PDF Preview — Adobe/Google Drive style
// ============================================================

export default function DocumentPreview({ url, initialPage, onError }: { url: string; initialPage: number; onError?: (msg: string) => void }) {
  React.useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }, [])

  const [numPages, setNumPages] = React.useState(0)
  const [page, setPage] = React.useState(initialPage)
  const [pageInput, setPageInput] = React.useState(String(initialPage))
  const [error, setError] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = React.useState(false)

  // Sync page input when page changes via buttons
  React.useEffect(() => { setPageInput(String(page)) }, [page])

  // Keyboard nav — scoped to container focus/hover
  React.useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const el = containerRef.current
      if (!el) return
      const hasFocus = el.contains(document.activeElement)
      if (!hasFocus && !hovered) return

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
  }, [numPages, hovered])

  function handlePageInputSubmit(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      const n = parseInt(pageInput, 10)
      if (n >= 1 && n <= numPages) setPage(n)
      else setPageInput(String(page))
    }
  }

  if (error) return <ErrorFallback message="Could not load PDF" url={url} />

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center gap-ds-03"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={-1}
    >
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
          <Button variant="ghost" size="icon-xs" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page (←)" title="Previous page">
            <Icon icon={IconChevronLeft} size="sm" />
          </Button>
          <div className="flex items-center gap-ds-01 text-ds-xs text-surface-fg-muted">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputSubmit}
              onBlur={() => setPageInput(String(page))}
              className="w-8 bg-transparent text-center font-mono text-surface-fg outline-hidden focus:bg-surface-raised-hover rounded-ds-sm"
              aria-label="Page number"
            />
            <span>/ {numPages}</span>
          </div>
          <Button variant="ghost" size="icon-xs" onClick={() => setPage((p) => Math.min(numPages, p + 1))} disabled={page >= numPages} aria-label="Next page (→)" title="Next page">
            <Icon icon={IconChevronRight} size="sm" />
          </Button>
        </Toolbar>
      )}
    </div>
  )
}
