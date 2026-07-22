'use client'

import Link, { type LinkProps } from 'next/link'
import type { ComponentProps } from 'react'
import { track } from '@/lib/analytics'

type TrackedLinkProps = LinkProps &
  Omit<ComponentProps<'a'>, keyof LinkProps> & {
    /** Event name fired on click (e.g. 'cta_click'). */
    event: string
    /** Event props (e.g. { cta: 'try-it-on', location: 'hero' }). */
    eventProps?: Record<string, unknown>
  }

/**
 * `next/link` that fires a named analytics event on click before navigating.
 * A thin client wrapper so server components (e.g. Hero) can instrument their
 * CTAs without going client themselves.
 */
export function TrackedLink({ event, eventProps, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, eventProps)
        onClick?.(e)
      }}
    />
  )
}
