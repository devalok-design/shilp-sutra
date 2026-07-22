import { Text } from '@devalok/shilp-sutra/ui/text'
import { TrackedLink } from './tracked-link'
import {
  AstroMark,
  NextjsMark,
  RemixMark,
  TanStackMark,
  ViteMark,
} from './framework-logos'

/**
 * "Does this work with my stack?" — a logo strip under the wedge row, to kill
 * the silent doubt before the reader scrolls on. Frameworks + doc slugs mirror
 * the install-section list. Install path is stable on Next + Vite; Astro,
 * Remix, and TanStack each ship a tested setup guide (copy-context §6).
 *
 * Server component; framework links are instrumented via TrackedLink (which is
 * itself the client boundary, so this section stays server-rendered).
 */
const frameworks = [
  { name: 'Next.js', slug: 'install-next-app-router', Mark: NextjsMark },
  { name: 'Vite', slug: 'install-vite', Mark: ViteMark },
  { name: 'Astro', slug: 'install-astro', Mark: AstroMark },
  { name: 'Remix', slug: 'install-remix', Mark: RemixMark },
  { name: 'TanStack', slug: 'install-tanstack-start', Mark: TanStackMark },
] as const

export function StackSupport() {
  return (
    <section className="mx-auto max-w-6xl px-page-x py-ds-12">
      <div className="flex flex-col gap-ds-08">
        <div className="flex flex-col gap-ds-03 max-w-3xl">
          <Text variant="label-md" className="text-surface-fg-subtle">
            Works with your stack
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            Fits the stack you already run.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            One install, one CSS import — then you&apos;re building. Each framework has a short
            setup guide, tested on a real project.
          </Text>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-ds-04">
          {frameworks.map((fw) => (
            <li key={fw.slug}>
              <TrackedLink
                href={`/docs/${fw.slug}`}
                event="framework_click"
                eventProps={{ framework: fw.name, location: 'stack-support' }}
                className="group flex flex-col items-center justify-center gap-ds-03 rounded-ds-lg border border-surface-border-subtle bg-surface-raised px-ds-04 py-ds-06 text-surface-fg-muted transition-[color,border-color,box-shadow] duration-fast-02 ease-productive-standard hover:border-surface-border-strong hover:text-surface-fg hover:shadow-raised focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
              >
                <fw.Mark className="h-7 w-7" />
                <Text variant="body-sm" className="text-current">
                  {fw.name}
                </Text>
              </TrackedLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
