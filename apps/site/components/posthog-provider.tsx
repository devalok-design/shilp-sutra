'use client'

/**
 * PostHog analytics for the marketing site.
 *
 * INERT UNTIL CONFIGURED: if `NEXT_PUBLIC_POSTHOG_KEY` is unset, this renders
 * children untouched and never loads posthog-js — zero network, zero cost. Set
 * the key (and optionally `NEXT_PUBLIC_POSTHOG_HOST`, default US cloud) in the
 * Railway env to activate. Autocapture records CTA / install-command clicks;
 * pageviews are captured manually on App-Router route changes below.
 */

import { Suspense, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
// Ingestion proxied first-party via f.devalok.in (shared Devalok EU proxy) to survive
// adblockers. Override with NEXT_PUBLIC_POSTHOG_HOST. ui_host below points at the real
// EU app (the proxy fronts ingestion, not the toolbar/replay app).
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://f.devalok.in'
const UI_HOST = 'https://eu.posthog.com'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!KEY || !pathname) return
    let url = window.origin + pathname
    const qs = searchParams?.toString()
    if (qs) url += `?${qs}`
    posthog.capture('$pageview', { $current_url: url })
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return
    posthog.init(KEY, {
      api_host: HOST,
      ui_host: UI_HOST,
      capture_pageview: false, // captured manually on route change
      capture_pageleave: true,
    })
  }, [])

  // Not configured → pass through, load nothing.
  if (!KEY) return <>{children}</>

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
