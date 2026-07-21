import posthog from 'posthog-js'

/**
 * Fire a named product-analytics event.
 *
 * No-op when PostHog isn't loaded — during SSR, or in any environment where
 * `NEXT_PUBLIC_POSTHOG_KEY` is unset (the provider never calls `init`, so
 * `__loaded` stays false). Call sites never need to guard themselves.
 *
 * These are the site's *named* conversion events. Pageviews/pageleaves come
 * from the provider; incidental clicks come from autocapture. Use `track` only
 * for funnel-meaningful actions (install-command copy, primary CTAs, outbound).
 */
export function track(event: string, props?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return
  if (!posthog.__loaded) return
  posthog.capture(event, props)
}
