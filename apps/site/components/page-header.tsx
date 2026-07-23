import type { ReactNode } from 'react'

/**
 * Page header — five slots, every one optional except title. Threaded
 * through every top-level page so hierarchy reads the same everywhere:
 *
 *   eyebrow      tiny, uppercase, subtle — context anchor
 *   ──────────────────────────────────────────────────────
 *   Title        heading-2xl, primary fg — what this page is
 *   Subtitle     ds-lg muted — tagline, on its own line
 *   Description  ds-md muted — supporting paragraph(s)
 *   meta         chip row, link row — anything tertiary
 *
 * Karm finesse applied: subtitle on its own line (never inline with title
 * after an em-dash), eyebrow at the tiniest scale, gap-ds-03 between
 * structural elements, mt-ds-04 before the meta row when present.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  description,
  meta,
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  className?: string
}) {
  return (
    <header className={['flex flex-col gap-ds-03 max-w-3xl mb-ds-09', className].filter(Boolean).join(' ')}>
      {eyebrow && (
        <div className="text-ds-xs text-surface-fg-subtle">{eyebrow}</div>
      )}
      <h1 className="font-display text-[length:var(--typo-heading-2xl-size)] font-[number:var(--typo-heading-2xl-weight)] leading-[var(--typo-heading-2xl-leading)] tracking-[var(--typo-heading-2xl-tracking)] text-surface-fg text-balance">
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
