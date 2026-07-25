import type { ReactNode } from 'react'
import { Righteous } from 'next/font/google'

/**
 * Righteous is the display face the poster sets the prize figure in (Figma
 * "Shilp-Sutra | Visual Identity", node 125:6918). It is NOT part of the design
 * system's type ramp — `--font-display` is Manrope — so it is scoped to this one
 * route rather than loaded globally, and exposed as a CSS variable the hero
 * reaches for on exactly one element.
 */
const righteous = Righteous({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-righteous',
})

export default function BuildathonLayout({ children }: { children: ReactNode }) {
  return <div className={righteous.variable}>{children}</div>
}
