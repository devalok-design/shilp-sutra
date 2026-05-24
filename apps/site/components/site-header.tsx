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
 * Floating pill — fixed, centered, max-w-4xl. Reads as light glass at-rest so
 * the aurora-bloom underneath the hero bleeds through (saturate-150 amplifies
 * the bloom's pastels through the bar). On scroll past the bloom we ramp the
 * bg opacity up + drop a stronger shadow so the pill stays legible against
 * solid page surfaces.
 *
 * Responsiveness:
 *   <md  → logo + theme + hamburger only; drawer floats below pill, also pill-skinned
 *   md+  → logo + nav + theme + brand + github
 *
 * Reduced motion: scroll-state transition still happens (color / opacity only),
 * the top-position tween snaps. No bounce on mount.
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
      {/* Skip link — visible only on keyboard focus */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-ds-04 focus:left-1/2 focus:-translate-x-1/2 focus:z-popover focus:px-ds-04 focus:py-ds-02 focus:rounded-full focus:bg-accent-9 focus:text-accent-fg focus:shadow-overlay focus:text-ds-sm focus:font-medium"
      >
        Skip to content
      </a>

      <motion.header
        initial={false}
        animate={{ top: scrolled ? 8 : 14 }}
        transition={{ duration: 0.22, ease: [0.2, 0, 0.38, 0.9] }}
        className="fixed left-1/2 -translate-x-1/2 z-popover w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl print:hidden"
      >
        <div
          className={[
            'flex items-center justify-between gap-ds-02 sm:gap-ds-03',
            'pl-ds-04 pr-ds-02 sm:pl-ds-05 sm:pr-ds-02 py-ds-02',
            'rounded-full border backdrop-blur-2xl backdrop-saturate-150',
            'transition-[background-color,border-color,box-shadow] duration-moderate-01 ease-productive-standard',
            // forced-colors: blur fails; reinstate solid border for legibility
            'forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
            scrolled
              ? 'bg-surface-base/85 border-surface-border-subtle/70 shadow-overlay'
              : 'bg-surface-base/40 border-surface-border-subtle/30 shadow-raised',
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

          <div className="flex items-center gap-ds-01">
            <div className="hidden md:inline-flex">
              <BrandSwitcher />
            </div>
            <ThemeToggle />
            <a
              href="https://github.com/devalok-design/shilp-sutra"
              target="_blank"
              rel="noreferrer"
              aria-label="View on GitHub"
              className="hidden md:inline-flex"
            >
              <Button variant="ghost" size="icon-md" aria-label="GitHub">
                <IconBrandGithub size={18} />
              </Button>
            </a>
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
                    Settings
                  </span>
                  <div className="px-ds-03">
                    <BrandSwitcher />
                  </div>
                  <a
                    href="https://github.com/devalok-design/shilp-sutra"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-ds-03 px-ds-03 py-ds-03 rounded-ds-md text-ds-md text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover"
                  >
                    <IconBrandGithub size={18} />
                    GitHub
                  </a>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
