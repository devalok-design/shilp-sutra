'use client'

import { IconBrandGithub, IconCircleCheck, IconExternalLink, IconSparkles } from '@tabler/icons-react'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const principles = [
  {
    title: 'Soul, intention, execution.',
    body: 'Three steps. Skip any and the work is incomplete. We build, write, and ship in that order.',
  },
  {
    title: 'Mediums, not masters.',
    body: 'The work serves the maker and the user. The studio is a vessel, never the centre of the story.',
  },
  {
    title: 'Listen deeply, question deeply, push beyond.',
    body: 'Every project starts with a long conversation. Then a longer one with the work itself.',
  },
]

const services = [
  { name: 'Brand identity', tag: 'Foundational' },
  { name: 'Product design', tag: 'Software' },
  { name: 'Editorial & print', tag: 'Tactile' },
  { name: 'Naming + writing', tag: 'Language' },
  { name: 'Spatial + retail', tag: 'Place' },
  { name: 'Strategy + research', tag: 'Foundational' },
]

export function DevalokShowcase() {
  return (
    <div className="flex flex-col gap-ds-09">
      <header className="flex flex-col gap-ds-04 max-w-3xl">
        <div className="flex items-center gap-ds-04">
          <img
            src="https://devalok-public-assets.s3.ap-south-1.amazonaws.com/brand/devalok/logos/chakra-brand.svg"
            alt=""
            aria-hidden
            className="w-12 h-12"
          />
          <Badge variant="soft" color="accent">
            The house brand
          </Badge>
        </div>
        <Text variant="heading-2xl" className="text-surface-fg">
          आत्मतः शिल्पं कृत्वा
        </Text>
        <Text variant="body-lg" className="text-surface-fg-muted italic">
          Atmatah Shilpam Kritvah · From the soul, we craft.
        </Text>
        <Text variant="body-md" className="text-surface-fg-muted">
          Devalok is a design and strategy studio in Bengaluru. We work in brand, product,
          editorial, and place. shilp-sutra is the library we built for ourselves. It powers
          Karm, Patrika, Sahayak, and every digital surface we ship.
        </Text>
        <img
          src="https://devalok-public-assets.s3.ap-south-1.amazonaws.com/brand/devalok/logos/wordmark-brand.svg"
          alt="Devalok"
          className="h-8 self-start mt-ds-03"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-04">
        {principles.map((p) => (
          <Card key={p.title}>
            <CardHeader>
              <CardTitle className="text-[length:var(--typo-heading-sm-size)]">{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Text variant="body-sm" className="text-surface-fg-muted">
                {p.body}
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_20rem] gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle>What the studio does</CardTitle>
            <CardDescription>Six practices, one philosophy.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-ds-02">
              {services.map((s) => (
                <li
                  key={s.name}
                  className="group/row flex items-center justify-between gap-ds-03 p-ds-03 rounded-ds-md bg-surface-overlay border border-transparent hover:border-surface-border-strong transition-colors duration-fast-02 ease-productive-standard cursor-pointer"
                >
                  <div className="flex items-center gap-ds-03 min-w-0">
                    <IconCircleCheck size={14} className="text-accent-11 shrink-0" />
                    <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">{s.name}</span>
                  </div>
                  <Badge size="sm" variant="soft" color="neutral">
                    {s.tag}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Built on shilp-sutra</CardTitle>
            <CardDescription>Surfaces using this library</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-03">
            <Surface name="Karm" what="Project tool" />
            <Surface name="Patrika" what="Editorial" />
            <Surface name="Sahayak" what="Studio publication" />
            <Surface name="shilp-sutra.devalok.in" what="The site you're on" current />
            <Button startIcon={<IconBrandGithub size={14} />} variant="soft" size="sm" fullWidth>
              See the code
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-accent-2 border-accent-7">
        <CardContent className="flex items-center justify-between gap-ds-04 py-ds-06">
          <div className="flex items-start gap-ds-03">
            <IconSparkles size={20} className="text-accent-11 mt-1 shrink-0" />
            <div className="flex flex-col gap-ds-01">
              <Text variant="heading-sm" className="text-surface-fg">
                Working on something?
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                If shilp-sutra speaks to you, the studio probably does too. Namaskar.
              </Text>
            </div>
          </div>
          <Button size="lg" onClickAsync={async () => { await sleep(1500) }}>
            Talk to Devalok
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function Surface({ name, what, current }: { name: string; what: string; current?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-ds-02">
      <div className="flex flex-col">
        <Text variant="body-sm" className="text-surface-fg">
          {name}
        </Text>
        <Text variant="body-xs" className="text-surface-fg-subtle">
          {what}
        </Text>
      </div>
      {current ? (
        <Badge variant="soft" color="accent" size="sm">
          You are here
        </Badge>
      ) : (
        <IconExternalLink size={12} className="text-surface-fg-subtle" />
      )}
    </div>
  )
}
