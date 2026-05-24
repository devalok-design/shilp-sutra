import Link from 'next/link'
import { Text } from '@devalok/shilp-sutra/ui/text'

const linkGroups = [
  {
    heading: 'Package',
    links: [
      { label: 'npm', href: 'https://www.npmjs.com/package/@devalok/shilp-sutra', external: true },
      { label: 'GitHub', href: 'https://github.com/devalok-design/shilp-sutra', external: true },
      { label: 'Changelog', href: 'https://github.com/devalok-design/shilp-sutra/blob/main/CHANGELOG.md', external: true },
      { label: 'Migration', href: 'https://github.com/devalok-design/shilp-sutra/blob/main/MIGRATION.md', external: true },
    ],
  },
  {
    heading: 'Explore',
    links: [
      { label: 'Components', href: '/components' },
      { label: 'Blocks', href: '/blocks' },
      { label: 'Theming', href: '/theming' },
      { label: 'Docs', href: '/docs/install-vite' },
      { label: 'Storybook', href: 'https://devalok-design.github.io/shilp-sutra/', external: true },
    ],
  },
  {
    heading: 'For agents',
    links: [
      { label: 'AGENTS.md', href: 'https://github.com/devalok-design/shilp-sutra/blob/main/AGENTS.md', external: true },
      { label: 'llms.txt', href: 'https://github.com/devalok-design/shilp-sutra/blob/main/packages/core/llms.txt', external: true },
      { label: 'Agent Skill', href: 'https://github.com/devalok-design/shilp-sutra/tree/main/skills/shilp-sutra', external: true },
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
      <div className="mx-auto max-w-6xl px-page-x py-ds-09">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-ds-08">
          <div className="col-span-2 md:col-span-2 flex flex-col gap-ds-03">
            <Text variant="heading-sm" className="text-surface-fg">shilp-sutra</Text>
            <Text variant="body-sm" className="text-surface-fg-muted max-w-sm">
              Devalok's React design system. Tailwind 4 CSS-first, OKLCH tokens, 119 accessible components.
            </Text>
          </div>
          {linkGroups.map((group) => (
            <div key={group.heading} className="flex flex-col gap-ds-02">
              <Text variant="label-md" className="text-surface-fg-subtle">{group.heading}</Text>
              <ul className="flex flex-col gap-ds-02">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      {...('external' in link && link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                      className="text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-ds-09 pt-ds-06 border-t border-surface-border-subtle flex flex-col sm:flex-row justify-between gap-ds-03">
          <Text variant="body-xs" className="text-surface-fg-subtle">
            MIT · © 2026 Devalok Design &amp; Strategy Studios
          </Text>
          <Text variant="body-xs" className="text-surface-fg-subtle">
            Built with shilp-sutra. Hosted on Railway.
          </Text>
        </div>
      </div>
    </footer>
  )
}
