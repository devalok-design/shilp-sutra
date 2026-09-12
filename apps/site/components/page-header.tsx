import type { ReactNode } from 'react'

/**
 * Page header — four slots, every one optional except title. Threaded
 * through every top-level page so hierarchy reads the same everywhere:
 *
 *   Title        heading-2xl, primary fg — what this page is
 *   Subtitle     ds-lg muted — tagline, on its own line
 *   Description  ds-md muted — supporting paragraph(s)
 *   meta         chip row, link row — anything tertiary
 *
 * There is deliberately NO eyebrow slot. A small label above the title is
 * banned outright by the house type rules — "the kicker-over-heading is a
 * template in any typeface", so being mixed-case does not excuse it. The
 * title and its size are what signpost the page. Context that genuinely
 * carries information (a category, a version, an industry) belongs in
 * `meta`, below the title, which is the sanctioned position for it.
 *
 * Karm finesse applied: subtitle on its own line (never inline with title
 * after an em-dash), gap-ds-03 between structural elements, mt-ds-04
 * before the meta row when present.
 */
export function PageHeader({
  title,
  subtitle,
  description,
  meta,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={['flex flex-col gap-ds-03 max-w-3xl mb-ds-09', className].filter(Boolean).join(' ')}>
      <h1 className="text-heading-2xl text-surface-fg text-balance">
        {title}
      </h1>
      {subtitle && (
        <p className="text-ds-lg text-surface-fg-muted leading-snug max-w-2xl text-balance">{subtitle}</p>
      )}
      {description && (
        <p className="text-ds-md text-surface-fg-muted leading-relaxed max-w-2xl">{description}</p>
      )}
      {meta && <div className="mt-ds-04">{meta}</div>}
    </header>
  )
}
