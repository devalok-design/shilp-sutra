/**
 * Monochrome framework marks for the "works with your stack" strip.
 *
 * These are simplified single-colour silhouettes drawn in `currentColor`, so
 * they inherit the surrounding text colour and adapt to light/dark and to any
 * brand accent — no per-logo colour to clash with the recolour story. They are
 * evocative, not pixel-accurate trademarks; the name label beneath each does
 * the identifying work. Swap in official SVGs later if we want exact marks.
 *
 * Size via className (e.g. `h-7 w-7`); colour via the parent's text colour.
 */

type LogoProps = { className?: string }

export function NextjsMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10.25" />
      <path d="M8.5 16.5V8l7 9.5" />
      <path d="M15.5 8v4.5" />
    </svg>
  )
}

export function ViteMark({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.2 2 4.4 12.6h6.1l-1.1 9.4 9.9-13.2H13z" />
    </svg>
  )
}

export function AstroMark({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2 6.8 20.3l5.2-3 5.2 3z" />
      <path d="M9.4 18.8a3.6 3.6 0 0 0 5.2 0 3.6 3.6 0 0 1-5.2 0z" opacity="0.6" />
    </svg>
  )
}

export function RemixMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M9 17V7.5h4.2a2.4 2.4 0 0 1 0 4.8H9m4.2 0 3.2 4.7" />
    </svg>
  )
}

export function TanStackMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 8.2 12 4l9 4.2-9 4.2z" />
      <path d="M3 12.2 12 16.4l9-4.2" />
      <path d="M3 16.2 12 20.4l9-4.2" />
    </svg>
  )
}
