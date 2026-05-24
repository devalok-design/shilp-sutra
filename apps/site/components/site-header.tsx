'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { IconBrandGithub, IconMenu2, IconX } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { BrandSwitcher } from './brand-switcher'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/theming', label: 'Theming' },
  { href: '/docs/install-vite', label: 'Docs' },
  { href: '/agents', label: 'For AI editors', accent: true },
] as const

export function SiteHeader() {
  const [open, setOpen] = useState(false)

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
    <header className="sticky top-0 z-popover bg-surface-base/80 backdrop-blur-md border-b border-surface-border-subtle">
      <div className="mx-auto max-w-6xl px-page-x h-16 flex items-center justify-between gap-ds-03">
        <Link href="/" className="flex items-center gap-ds-02 group min-w-0" onClick={() => setOpen(false)}>
          <span className="text-ds-lg font-semibold tracking-tight text-surface-fg truncate">
            shilp-sutra
          </span>
          <span className="text-ds-xs text-surface-fg-subtle font-mono mt-0.5 shrink-0">v0.39</span>
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

        <div className="flex items-center gap-ds-02">
          {/* BrandSwitcher: drawer-only on mobile (less frequent action). */}
          <div className="hidden md:inline-flex">
            <BrandSwitcher />
          </div>
          {/* ThemeToggle stays — one-tap, used daily. */}
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden fixed inset-0 top-16 bg-surface-base/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              id="mobile-nav"
              key="panel"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="md:hidden absolute inset-x-0 top-16 z-popover bg-surface-base border-b border-surface-border-subtle shadow-overlay"
              aria-label="Primary"
            >
              <div className="mx-auto max-w-6xl px-page-x py-ds-05 flex flex-col gap-ds-05">
                <ul className="flex flex-col gap-ds-01">
                  {navLinks.map((link) => {
                    const isAccent = 'accent' in link && link.accent
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={[
                            'flex items-center gap-ds-02 px-ds-03 py-ds-04 rounded-ds-md text-ds-md',
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
                <div className="pt-ds-04 border-t border-surface-border-subtle flex flex-col gap-ds-03">
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
                    className="flex items-center gap-ds-03 px-ds-03 py-ds-04 rounded-ds-md text-ds-md text-surface-fg-muted hover:text-surface-fg hover:bg-surface-raised-hover"
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
    </header>
  )
}
