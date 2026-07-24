'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { IconBrandGithub, IconMenu2, IconX } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SHILP_SUTRA_MINOR } from '@/lib/version'
import { track } from '@/lib/analytics'
import { BrandSwitcher } from './brand-switcher'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { href: '/components', label: 'Components' },
  { href: '/presets', label: 'Presets' },
  { href: '/theming', label: 'Theming' },
  { href: '/showcase', label: 'Showcase' },
  { href: '/docs', label: 'Docs' },
] as const

/**
 * Floating pill, fixed, centered, max-w-4xl.
 *
 * Card surface is persistent — the pill's bg/border/shadow/backdrop-blur
 * render at all times, including at the very top of the page. It never
 * goes transparent; only the top offset tweens slightly closer to the
 * edge once scrolled (scrollY > 24), via framer-motion.
 *
 * Responsiveness:
 *   <md  → logo + github + theme + hamburger (brand-switcher in drawer)
 *   md+  → logo + nav + brand + theme + github (hamburger hidden)
 *
 * Reduced motion: top tween is replaced by a snap.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <motion.header
        initial={false}
        animate={{ top: scrolled ? 8 : 14 }}
        transition={{ duration: 0.24, ease: [0.2, 0, 0.38, 0.9] }}
        className="fixed left-1/2 -translate-x-1/2 z-popover w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl print:hidden"
      >
        <div
          className={[
            'flex items-center justify-between gap-ds-02 sm:gap-ds-03',
            // 10px corners no longer need the extra inset that the full-pill
            // version required — left padding back to a normal value, symmetric
            // with the right side's button-relative padding.
            'px-ds-04 sm:px-ds-05 py-ds-02b',
            // Rounded rectangle — 10px corners on a ~56px bar reads clearly
            // as a rectangle, not a pill. Earlier 24px (rounded-bubble) was
            // still half the bar height and looked capsule-y.
            'rounded-surface border',
            'forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
            // Themed floating bar. Light: near-white raised surface. Dark: the
            // raised dark surface (the wordmark swaps to its white variant in
            // dark, below, so nothing vanishes). Translucent + blurred so the
            // backdrop shows through.
            'bg-surface-raised/80 border-surface-border-subtle backdrop-blur-2xl backdrop-saturate-150 shadow-overlay',
          ].join(' ')}
        >
          {/* Logo cluster — on mobile the BrandSwitcher sits inline with the
              wordmark so the colour-picker is reachable next to the brand it
              colours. On md+ the switcher relocates to the rightmost controls
              slot (rendered below) and this cluster is logo-only. */}
          <div className="flex items-center gap-ds-03 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-ds-02 group min-w-0 overflow-hidden"
              onClick={() => setOpen(false)}
            >
              <img
                src="/brand/shilp-sutra/wordmark.svg?v=2"
                alt="Shilp Sutra"
                className="h-[18px] w-auto shrink-0 dark:hidden"
              />
              <img
                src="/brand/shilp-sutra/wordmark-white.svg"
                alt="Shilp Sutra"
                className="hidden h-[18px] w-auto shrink-0 dark:block"
              />
              {/* Version superscript — takes the exact slot the brand wordmark
                  gives "1.0", styled to match it, wired to the LIVE version. */}
              <span className="text-[8px] font-medium leading-none tracking-tight shrink-0 hidden sm:inline text-surface-fg-muted self-start -ml-[2px] mt-[1px]">
                {SHILP_SUTRA_MINOR}
              </span>
            </Link>
            <div className="md:hidden">
              <BrandSwitcher align="start" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-ds-05">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Order: github → light/dark → hamburger(mobile) → brand (rightmost).
              Everything except BrandSwitcher is ghost — no chip background —
              so the corner is the single coloured anchor. Hover-state on ghost
              still surfaces a subtle bg, signalling tap. */}
          <div className="flex items-center gap-ds-01">
            <a
              href="https://github.com/devalok-design/shilp-sutra"
              target="_blank"
              rel="noreferrer"
              aria-label="View on GitHub"
              onClick={() => track('cta_click', { cta: 'github', location: 'header' })}
            >
              <Button variant="ghost" size="icon-sm" aria-label="GitHub" className="text-surface-fg-muted hover:text-surface-fg">
                <IconBrandGithub size={16} />
              </Button>
            </a>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon-md"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </Button>
            {/* Desktop only — mobile has its copy beside the logo. */}
            <div className="hidden md:inline-flex">
              <BrandSwitcher />
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden fixed inset-0 z-popover bg-surface-base/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              id="mobile-nav"
              key="panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0.38, 0.9] }}
              style={{ top: '4.75rem' }}
              className="md:hidden fixed inset-x-ds-03 sm:inset-x-ds-04 z-popover origin-top rounded-overlay-lg border border-surface-border-subtle/70 bg-surface-base/95 backdrop-blur-2xl backdrop-saturate-150 shadow-overlay"
              aria-label="Primary"
            >
              {/* Drawer is nav-only now — GitHub, theme, and BrandSwitcher all
                  live in the bar at every breakpoint. */}
              <div className="px-ds-04 py-ds-04 flex flex-col gap-ds-04 max-h-[calc(100vh-6rem)] overflow-y-auto">
                <ul className="flex flex-col gap-ds-01">
                  {navLinks.map((link) => {
                    const isAccent = 'accent' in link && link.accent
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={[
                            'flex items-center gap-ds-02 px-ds-03 py-ds-03 rounded-control text-ds-md',
                            isAccent
                              ? 'text-secondary-11 hover:bg-secondary-2'
                              : 'text-surface-fg hover:bg-surface-raised-hover',
                          ].join(' ')}
                        >
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
