'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { IconBrandGithub, IconMenu2, IconX } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { SHILP_SUTRA_MINOR } from '@/lib/version'
import { BrandSwitcher } from './brand-switcher'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { href: '/showcase', label: 'Showcase' },
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/theming', label: 'Theming' },
  { href: '/docs', label: 'Docs' },
  { href: '/agents', label: 'For AI editors', accent: true },
] as const

/**
 * Floating pill, fixed, centered, max-w-4xl.
 *
 * At-rest (top of page): pill chrome is fully invisible — no bg, no border,
 * no shadow, no backdrop-blur. The aurora-bloom reads through untouched.
 * Only the logo + soft-tinted controls float over the bloom.
 *
 * Scrolled (scrollY > 24): the pill emerges. Backdrop-blur fades in,
 * surface-base/85 fills the body, border + overlay shadow appear, and
 * the bar snaps closer to the top edge. All four properties tween
 * together via CSS transitions on bg/border/shadow/backdrop-filter, with
 * framer-motion driving the top-position move.
 *
 * Controls are `variant="soft"` (accent-3 tint + accent-11 icon) so each
 * button reads as interactable even when the pill chrome is invisible.
 *
 * Responsiveness:
 *   <md  → logo + github + theme + hamburger (brand-switcher in drawer)
 *   md+  → logo + nav + brand + theme + github (hamburger hidden)
 *
 * Reduced motion: top tween is replaced by a snap, color tween still
 * runs (it's a visual signal, not motion).
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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-ds-04 focus:left-1/2 focus:-translate-x-1/2 focus:z-popover focus:px-ds-04 focus:py-ds-02 focus:rounded-full focus:bg-accent-9 focus:text-accent-fg focus:shadow-overlay focus:text-ds-sm focus:font-medium"
      >
        Skip to content
      </a>

      <motion.header
        initial={false}
        animate={{ top: scrolled ? 8 : 14 }}
        transition={{ duration: 0.24, ease: [0.2, 0, 0.38, 0.9] }}
        className="fixed left-1/2 -translate-x-1/2 z-popover w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl print:hidden"
      >
        <div
          className={[
            'flex items-center justify-between gap-ds-02 sm:gap-ds-03',
            // Logo gets more breathing room on the left; controls hug the right edge.
            'pl-ds-06 pr-ds-02 sm:pl-ds-07 sm:pr-ds-02 py-ds-02',
            'rounded-full border',
            // Tween skin properties together so the pill "materializes" on scroll
            // instead of popping. backdrop-filter transitions are supported across
            // modern Chrome/Safari/Firefox.
            'transition-[background-color,border-color,box-shadow,backdrop-filter] duration-moderate-02 ease-productive-standard',
            'forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
            // At-rest still feels "merged" — bg/25 + blur-md is subtle enough that
            // the bloom passes through (amplified by saturate-150), but heavy enough
            // that text + tinted controls have a substrate to read against.
            // Scrolled drops bg-opacity to 65 so the blur is *visible*, not solid.
            scrolled
              ? 'bg-surface-base/65 backdrop-blur-2xl backdrop-saturate-150 border-surface-border-subtle/60 shadow-overlay'
              : 'bg-surface-base/25 backdrop-blur-md backdrop-saturate-150 border-transparent shadow-none',
          ].join(' ')}
        >
          <Link
            href="/"
            className="flex items-center gap-ds-02 group min-w-0"
            onClick={() => setOpen(false)}
          >
            <span className="text-ds-md sm:text-ds-lg font-semibold tracking-tight text-surface-fg truncate">
              shilp-sutra
            </span>
            <span className="text-ds-xs text-surface-fg-subtle font-mono mt-0.5 shrink-0 hidden sm:inline">
              v{SHILP_SUTRA_MINOR}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-ds-05">
            {navLinks.map((link) => {
              const isAccent = 'accent' in link && link.accent
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    isAccent
                      ? 'inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors duration-fast-01'
                      : 'text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01'
                  }
                >
                  {isAccent && <span className="w-1.5 h-1.5 rounded-full bg-accent-9" />}
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Order: brand → github → hamburger(mobile) → theme (rightmost).
              ThemeToggle owns the corner — it's solid accent so the corner reads
              loud-and-clear as a tap target, even at-rest over the bloom. */}
          <div className="flex items-center gap-ds-01">
            <div className="hidden md:inline-flex">
              <BrandSwitcher />
            </div>
            <a
              href="https://github.com/devalok-design/shilp-sutra"
              target="_blank"
              rel="noreferrer"
              aria-label="View on GitHub"
            >
              <Button variant="soft" size="icon-md" aria-label="GitHub">
                <IconBrandGithub size={18} />
              </Button>
            </a>
            <Button
              variant="soft"
              size="icon-md"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
            </Button>
            <ThemeToggle />
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
              className="md:hidden fixed inset-x-ds-03 sm:inset-x-ds-04 top-[4.75rem] z-popover origin-top rounded-ds-xl border border-surface-border-subtle/70 bg-surface-base/95 backdrop-blur-2xl backdrop-saturate-150 shadow-overlay"
              aria-label="Primary"
            >
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
                            'flex items-center gap-ds-02 px-ds-03 py-ds-03 rounded-ds-md text-ds-md',
                            isAccent
                              ? 'text-accent-11 hover:bg-accent-2'
                              : 'text-surface-fg hover:bg-surface-raised-hover',
                          ].join(' ')}
                        >
                          {isAccent && <span className="w-1.5 h-1.5 rounded-full bg-accent-9" />}
                          {link.label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <div className="pt-ds-03 border-t border-surface-border-subtle flex flex-col gap-ds-03">
                  <span className="text-ds-xs text-surface-fg-subtle uppercase tracking-wide px-ds-03">
                    Brand
                  </span>
                  <div className="px-ds-03">
                    <BrandSwitcher />
                  </div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
