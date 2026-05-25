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
  // bannerH = current --beta-banner-h on <html>, in pixels. Pushed up when the
  // public-beta strip is visible (BetaBanner writes it). 0 otherwise.
  const [bannerH, setBannerH] = useState(0)

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24)
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    return () => window.removeEventListener('scroll', sync)
  }, [])

  useEffect(() => {
    const readBanner = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--beta-banner-h')
      const px = parseFloat(raw) || 0
      setBannerH(px)
    }
    readBanner()
    // BetaBanner mutates `style` on <html> when it mounts / dismisses / resizes.
    const observer = new MutationObserver(readBanner)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener('resize', readBanner)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', readBanner)
    }
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
        animate={{ top: bannerH + (scrolled ? 8 : 14) }}
        transition={{ duration: 0.24, ease: [0.2, 0, 0.38, 0.9] }}
        className="fixed left-1/2 -translate-x-1/2 z-popover w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-4xl print:hidden"
      >
        <div
          className={[
            'flex items-center justify-between gap-ds-02 sm:gap-ds-03',
            // 10px corners no longer need the extra inset that the full-pill
            // version required — left padding back to a normal value, symmetric
            // with the right side's button-relative padding.
            'pl-ds-04 pr-ds-02 sm:pl-ds-05 sm:pr-ds-02 py-ds-02',
            // Rounded rectangle — 10px corners on a ~56px bar reads clearly
            // as a rectangle, not a pill. Earlier 24px (rounded-bubble) was
            // still half the bar height and looked capsule-y.
            'rounded-surface border',
            // Tween skin properties together so the pill "materializes" on scroll
            // instead of popping. backdrop-filter transitions are supported across
            // modern Chrome/Safari/Firefox.
            'transition-[background-color,border-color,box-shadow,backdrop-filter] duration-moderate-02 ease-productive-standard',
            'forced-colors:bg-[Canvas] forced-colors:border-[CanvasText]',
            // At-rest: chrome is fully absent — bg, blur, border, shadow all off.
            // The bar's elements (logo, nav, controls) float directly on the
            // page; only BrandSwitcher's solid-accent disc gives any visual
            // anchor. The pill *materializes* on scroll, not before.
            // Scrolled: bg/65 + heavy blur + saturate so the bloom (or any
            // scrolling content underneath) reads as frost through the bar.
            scrolled
              ? 'bg-surface-base/65 backdrop-blur-2xl backdrop-saturate-150 border-surface-border-subtle/60 shadow-overlay'
              : 'bg-transparent backdrop-blur-none border-transparent shadow-none',
          ].join(' ')}
        >
          {/* Logo cluster — on mobile the BrandSwitcher sits inline with the
              wordmark so the colour-picker is reachable next to the brand it
              colours. On md+ the switcher relocates to the rightmost controls
              slot (rendered below) and this cluster is logo-only. */}
          <div className="flex items-center gap-ds-03 min-w-0">
            <Link
              href="/"
              className="flex items-center gap-ds-02 group min-w-0"
              onClick={() => setOpen(false)}
            >
              <span className="text-ds-md sm:text-ds-lg font-semibold tracking-tight text-surface-fg truncate">
                shilp-sutra
              </span>
              {/* At rest the pill is transparent over the bloom, so muted text
                  gets swallowed. Bump to full-strength surface-fg (mode-aware)
                  while !scrolled; revert to subtle once the backdrop-blur
                  scrim is doing the contrast work. */}
              <span
                className={[
                  'text-ds-xs font-mono mt-0.5 shrink-0 hidden sm:inline',
                  scrolled ? 'text-surface-fg-subtle' : 'text-surface-fg',
                ].join(' ')}
              >
                v{SHILP_SUTRA_MINOR}
              </span>
            </Link>
            <div className="md:hidden">
              <BrandSwitcher align="start" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-ds-05">
            {navLinks.map((link) => {
              const isAccent = 'accent' in link && link.accent
              // At rest the pill chrome is transparent; muted-grey gets
              // swallowed by the bloom. Use full-strength surface-fg until
              // backdrop-blur materialises, then step back to muted with a
              // hover bump so the focused link still surfaces.
              const base = isAccent
                ? 'inline-flex items-center gap-ds-02 text-ds-sm text-accent-11 hover:text-accent-12 transition-colors duration-fast-01'
                : scrolled
                  ? 'text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01'
                  : 'text-ds-sm text-surface-fg hover:text-accent-11 transition-colors duration-fast-01'
              return (
                <Link key={link.href} href={link.href} className={base}>
                  {isAccent && <span className="w-1.5 h-1.5 rounded-pill bg-accent-9" />}
                  {link.label}
                </Link>
              )
            })}
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
            >
              <Button variant="ghost" size="icon-md" aria-label="GitHub">
                <IconBrandGithub size={18} />
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
              style={{ top: `calc(${bannerH}px + 4.75rem)` }}
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
                              ? 'text-accent-11 hover:bg-accent-2'
                              : 'text-surface-fg hover:bg-surface-raised-hover',
                          ].join(' ')}
                        >
                          {isAccent && <span className="w-1.5 h-1.5 rounded-pill bg-accent-9" />}
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
