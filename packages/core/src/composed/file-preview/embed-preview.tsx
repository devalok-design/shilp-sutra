'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { tweens } from '../../ui/lib/motion'
import { Skeleton } from '../../ui/skeleton'
import { ErrorFallback } from './shared'

// ============================================================
// Embed Preview — 16:9 with error timeout
// ============================================================

export default function EmbedPreview({ url, embedUrl, onError }: { url: string; embedUrl: string; onError?: (msg: string) => void }) {
  const [loaded, setLoaded] = React.useState(false)
  const [error, setError] = React.useState(false)

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
