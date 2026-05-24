import Link from 'next/link'
import { IconBrandGithub } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { BrandSwitcher } from './brand-switcher'
import { ThemeToggle } from './theme-toggle'

const navLinks = [
  { href: '/components', label: 'Components' },
  { href: '/blocks', label: 'Blocks' },
  { href: '/theming', label: 'Theming' },
  { href: '/docs/install-vite', label: 'Docs' },
] as const

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-popover bg-surface-base/80 backdrop-blur-md border-b border-surface-border-subtle">
      <div className="mx-auto max-w-6xl px-ds-page-x h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-ds-02 group">
          <span className="text-ds-lg font-semibold tracking-tight text-surface-fg">
            shilp-sutra
          </span>
          <span className="text-ds-xs text-surface-fg-subtle font-mono mt-0.5">v0.39</span>
        </Link>

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

        <div className="flex items-center gap-ds-02">
          <BrandSwitcher />
          <ThemeToggle />
          <a
            href="https://github.com/devalok-design/shilp-sutra"
            target="_blank"
            rel="noreferrer"
            aria-label="View on GitHub"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon-md" aria-label="GitHub">
              <IconBrandGithub size={18} />
            </Button>
          </a>
        </div>
      </div>
    </header>
  )
}
