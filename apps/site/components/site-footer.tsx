import Link from 'next/link'
import { IconBrandGithub, IconBrandNpm, IconHeartFilled } from '@tabler/icons-react'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Text } from '@devalok/shilp-sutra/ui/text'

const linkGroups = [
  {
    heading: 'Product',
    links: [
      { label: 'Components', href: '/components' },
      { label: 'Theming', href: '/theming' },
      { label: 'Showcase', href: '/showcase' },
      { label: 'Docs', href: '/docs' },
    ],
  },
  {
    heading: 'Package',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@devalok/shilp-sutra', external: true },
      { label: 'GitHub', href: 'https://github.com/devalok-design/shilp-sutra', external: true },
      {
        label: 'Changelog',
        href: 'https://github.com/devalok-design/shilp-sutra/blob/main/CHANGELOG.md',
        external: true,
      },
    ],
  },
  {
    heading: 'For AI',
    links: [
      { label: 'Docs MCP', href: '/docs' },
      {
        label: 'AGENTS.md',
        href: 'https://github.com/devalok-design/shilp-sutra/blob/main/AGENTS.md',
        external: true,
      },
      {
        label: 'llms.txt',
        href: 'https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/llms.txt',
        external: true,
      },
    ],
  },
  {
    heading: 'Devalok',
    links: [
      { label: 'devalok.in', href: 'https://devalok.in', external: true },
      { label: 'Karm', href: 'https://karm.devalok.in', external: true },
    ],
  },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border-subtle bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-page-x py-ds-11">
        <div className="grid grid-cols-2 gap-x-ds-06 gap-y-ds-09 md:grid-cols-6">
          {/* Brand block */}
          <div className="col-span-2 flex flex-col gap-ds-05">
            <Link href="/" className="self-start" aria-label="Shilp Sutra home">
              <img
                src="/brand/shilp-sutra/logo-full.svg"
                alt="Shilp Sutra"
                className="h-8 w-auto dark:hidden"
              />
              <img
                src="/brand/shilp-sutra/logo-full-white.svg"
                alt="Shilp Sutra"
                className="hidden h-8 w-auto dark:block"
              />
            </Link>
            <Text variant="body-sm" className="max-w-xs text-surface-fg-muted">
              A React design system that takes your brand&apos;s shape. Pick one colour and your
              whole interface matches it.
            </Text>
            <div className="mt-ds-01 flex items-center gap-ds-03">
              <a
                href="https://www.npmjs.com/package/@devalok/shilp-sutra"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="soft" size="sm" startIcon={<IconBrandNpm size={16} />}>
                  npm
                </Button>
              </a>
              <a
                href="https://github.com/devalok-design/shilp-sutra"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="soft" size="sm" startIcon={<IconBrandGithub size={16} />}>
                  GitHub
                </Button>
              </a>
            </div>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="flex flex-col gap-ds-03">
              <Text
                variant="label-sm"
                className="font-semibold uppercase tracking-wide text-surface-fg-subtle"
              >
                {group.heading}
              </Text>
              <ul className="flex flex-col gap-ds-02">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...('external' in link && link.external
                        ? { target: '_blank', rel: 'noreferrer' }
                        : {})}
                      className="text-ds-sm text-surface-fg-muted transition-colors duration-fast-01 hover:text-surface-fg"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Signature + legal */}
        <div className="mt-ds-10 flex flex-col gap-ds-04 border-t border-surface-border-subtle pt-ds-06 sm:flex-row sm:items-center sm:justify-between">
          <Text variant="body-sm" className="inline-flex items-center gap-ds-01 text-surface-fg-muted">
            Made in Bharat with
            <IconHeartFilled size={14} className="text-accent-9" aria-label="love" />
            by
            <Link
              href="https://devalok.in"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-surface-fg underline-offset-2 transition-colors duration-fast-01 hover:text-accent-11 hover:underline"
            >
              Devalok
            </Link>
            , for the world.
          </Text>
          <Text variant="body-xs" className="text-surface-fg-subtle">
            MIT · © 2026 Devalok Design and Strategy Studio
          </Text>
        </div>
      </div>
    </footer>
  )
}
