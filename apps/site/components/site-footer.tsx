import Link from 'next/link'
import { IconHeartFilled } from '@tabler/icons-react'
import { Text } from '@devalok/shilp-sutra/ui/text'

// "Devalok" is deliberately not in this list — per the Figma footer spec it
// sits stacked under the brand blurb (its own row, first column), not as a
// fifth sibling column. See the JSX below.
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
      { label: 'Showcase', href: '/showcase' },
      { label: 'Components', href: '/components' },
      { label: 'Theming', href: '/theming' },
      { label: 'Docs', href: '/docs' },
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
] as const

const devalokGroup = {
  heading: 'Devalok',
  links: [
    { label: 'devalok.in', href: 'https://devalok.in', external: true },
    { label: 'Karm', href: 'https://karm.devalok.in', external: true },
    { label: 'BharatTools', href: 'https://bharattools.in', external: true },
    { label: 'Gurukul', href: 'https://gurukul.devalok.in', external: true },
  ],
} as const

export function SiteFooter() {
  return (
    <footer className="border-t border-surface-border-subtle bg-surface-sunken">
      <div className="mx-auto max-w-6xl px-page-x py-ds-09">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-ds-08">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-ds-06">
            <div className="flex flex-col gap-ds-03">
              <img
                src="/brand/shilp-sutra/wordmark.svg"
                alt="Shilp Sutra"
                className="h-6 w-auto dark:hidden"
              />
              <img
                src="/brand/shilp-sutra/wordmark-white.svg"
                alt="Shilp Sutra"
                className="h-6 w-auto hidden dark:block"
              />
              <Text variant="body-sm" className="text-surface-fg-muted max-w-sm">
                Your brand. Every component. Out of the box. A React design system from Devalok. Tailwind 4 · OKLCH · 120+ components · MIT.
              </Text>
            </div>
            <div className="flex flex-col gap-ds-02">
              <Text variant="label-md" className="text-surface-fg-subtle">{devalokGroup.heading}</Text>
              <ul className="flex flex-col gap-ds-02">
                {devalokGroup.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ds-sm text-surface-fg-muted hover:text-surface-fg transition-colors duration-fast-01"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
        <div className="mt-ds-09 pt-ds-06 border-t border-surface-border-subtle flex flex-col gap-ds-04">
          <Text variant="body-sm" className="text-surface-fg-muted text-center sm:text-left">
            Made in Bharat with{' '}
            <IconHeartFilled size={14} className="inline align-[-2px] text-accent-9" aria-label="love" />{' '}
            by{' '}
            <Link
              href="https://devalok.in"
              target="_blank"
              rel="noreferrer"
              className="text-surface-fg underline underline-offset-2 hover:text-accent-11 transition-colors duration-fast-01"
            >
              Devalok
            </Link>
            , for the world.
          </Text>
          <div className="flex flex-col sm:flex-row justify-between gap-ds-03">
            <Text variant="body-xs" className="text-surface-fg-subtle">
              MIT · © 2026{' '}
              <Link
                href="https://devalok.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-surface-fg-muted transition-colors duration-fast-01"
              >
                Devalok Design and Strategy Studio
              </Link>
            </Text>
            <Text variant="body-xs" className="text-surface-fg-subtle">
              Built with{' '}
              <Link
                href="https://github.com/devalok-design/shilp-sutra"
                target="_blank"
                rel="noreferrer"
                className="hover:text-surface-fg-muted transition-colors duration-fast-01"
              >
                shilp-sutra
              </Link>
              . Hosted on{' '}
              <Link
                href="https://railway.app"
                target="_blank"
                rel="noreferrer"
                className="hover:text-surface-fg-muted transition-colors duration-fast-01"
              >
                Railway
              </Link>
              .
            </Text>
          </div>
        </div>
      </div>
    </footer>
  )
}
