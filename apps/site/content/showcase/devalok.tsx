'use client'

import { useState } from 'react'

import { motion } from 'framer-motion'

import {
  IconArrowUpRight,
  IconBrandGithub,
  IconBuildingArch,
  IconBulb,
  IconCircleCheck,
  IconCompass,
  IconDeviceLaptop,
  IconFeather,
  IconNotebook,
} from '@tabler/icons-react'

import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

const principles = [
  {
    title: 'Soul, intention, execution.',
    body: 'Three stages, always in that order. The soul of the work is settled in a room of long conversation. The intention is written down before a single pixel moves. The execution is where we earn the right to call it craft.',
  },
  {
    title: 'Mediums, not masters.',
    body: 'A brand identity, a product surface, a printed page, a retail wall. Every medium is a vessel for someone else’s vision. We carry it. We do not centre ourselves in it.',
  },
  {
    title: 'Listen deeply, question deeply, push beyond.',
    body: 'Every project starts with a long conversation. Then a longer one with the work itself, where the easy answer is set aside and the harder one earns its place.',
  },
]

const practices: { name: string; tag: string; body: string; Icon: typeof IconCompass }[] = [
  {
    name: 'Brand identity',
    tag: 'Foundational',
    body: 'Naming, marks, systems, and the philosophy that holds them together.',
    Icon: IconCompass,
  },
  {
    name: 'Product design',
    tag: 'Software',
    body: 'Web and software surfaces built on shilp-sutra. Considered, accessible, fast.',
    Icon: IconDeviceLaptop,
  },
  {
    name: 'Editorial & print',
    tag: 'Tactile',
    body: 'Books, publications, and printed objects. Substantial in the hand, slow in the read.',
    Icon: IconNotebook,
  },
  {
    name: 'Naming + writing',
    tag: 'Language',
    body: 'Names that carry meaning. Copy that sounds like the brand thinking out loud.',
    Icon: IconFeather,
  },
  {
    name: 'Spatial + retail',
    tag: 'Place',
    body: 'Stores, studios, and exhibition spaces where a brand becomes a room you walk into.',
    Icon: IconBuildingArch,
  },
  {
    name: 'Strategy + research',
    tag: 'Foundational',
    body: 'The interviews, the field notes, the positioning work that the visible work rests on.',
    Icon: IconBulb,
  },
]

const surfaces: { name: string; what: string; href?: string; current?: boolean }[] = [
  { name: 'Karm', what: 'Studio project tool', href: 'https://karm.devalok.in' },
  { name: 'Manas', what: 'Devalok publication', href: 'https://manas.devalok.in' },
  { name: 'Sahayak', what: 'Studio newsletter', href: 'https://sahayak.devalok.in' },
  { name: 'Patrika', what: 'Print + editorial', href: 'https://patrika.devalok.in' },
  { name: 'shilp-sutra.devalok.in', what: 'The site you are reading', current: true },
]

const ramp: { token: string; label: string; role: string }[] = [
  { token: 'bg-accent-3', label: 'Whisper', role: 'Background tints, soft surfaces, hover states.' },
  { token: 'bg-accent-9', label: 'Signal', role: 'Primary action, the load-bearing brand colour.' },
  { token: 'bg-accent-11', label: 'Voice', role: 'Emphasis text, accent type, italic transliterations.' },
]

const work = {
  brand: [
    { name: 'DIVINI', meta: 'Probiotic tea, identity + packaging' },
    { name: 'Padmavarna', meta: 'Heritage textile house, naming + system' },
    { name: 'Sthala Studio', meta: 'Architecture practice, mark + voice' },
  ],
  product: [
    { name: 'Karm', meta: 'Studio operating system, end-to-end' },
    { name: 'Manas', meta: 'Long-form publication, reading experience' },
    { name: 'Sahayak', meta: 'Newsletter platform, editorial UI' },
  ],
  editorial: [
    { name: 'Patrika Vol. IV', meta: 'Annual studio book, design + print' },
    { name: 'Manas Field Notes', meta: 'Quarterly print companion' },
    { name: 'Sahayak Letters', meta: 'Bound archive, cloth + foil' },
  ],
}

export function DevalokShowcase() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="flex flex-col gap-ds-09">
      <header className="flex flex-col gap-ds-04 max-w-3xl">
        <div className="flex items-center gap-ds-04">
          <img
            src="https://devalok-public-assets.s3.ap-south-1.amazonaws.com/brand/devalok/logos/chakra-brand.svg"
            alt=""
            aria-hidden
            width={48}
            height={48}
            loading="eager"
            decoding="async"
            className="w-12 h-12"
          />
          <Badge variant="soft" color="accent">
            The house brand
          </Badge>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col gap-ds-02"
          role="group"
          aria-label="Atmatah Shilpam Kritvah. From the soul, we craft."
        >
          <Text variant="heading-2xl" className="text-surface-fg text-balance">
            आत्मतः शिल्पं कृत्वा
          </Text>
          <Text variant="body-lg" className="text-accent-11 italic" aria-hidden>
            Atmatah Shilpam Kritvah
          </Text>
          <Text variant="body-lg" className="text-surface-fg text-balance" aria-hidden>
            From the soul, we craft.
          </Text>
        </motion.div>
        <Text variant="body-md" className="text-surface-fg-muted max-w-[65ch]">
          Devalok is a design and strategy studio in Bengaluru. We work in brand, product, editorial,
          and place. The studio sits at the meeting point of soul, intention, and execution. Three
          stages we refuse to collapse. shilp-sutra is the library we built for ourselves. It powers
          Karm, Manas, Sahayak, Patrika, and every digital surface we ship.
        </Text>
        <img
          src="https://devalok-public-assets.s3.ap-south-1.amazonaws.com/brand/devalok/logos/wordmark-brand.svg"
          alt="Devalok"
          width={160}
          height={32}
          loading="eager"
          decoding="async"
          className="h-8 w-auto self-start mt-ds-03"
        />
      </header>

      <section className="flex flex-col gap-ds-05">
        <div className="flex flex-col gap-ds-02 max-w-2xl">
          <Text variant="heading-lg" className="text-surface-fg">
            Three principles, in order.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            The studio runs on a small set of beliefs. We read them aloud at the start of every
            project. They settle most of the arguments before they start.
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-04">
          {principles.map((p) => (
            <Card key={p.title} className="shadow-raised">
              <CardHeader className="min-w-0">
                <CardTitle className="text-[length:var(--typo-heading-sm-size)] line-clamp-2 text-balance">
                  {p.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="min-w-0">
                <Text variant="body-sm" className="text-surface-fg-muted line-clamp-6">
                  {p.body}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle>Practices</CardTitle>
            <CardDescription>Six rooms in the studio, one philosophy across all of them.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-ds-03">
              {practices.map((p) => (
                <li
                  key={p.name}
                  className="flex flex-col gap-ds-02 p-ds-04 rounded-ds-md bg-surface-overlay border border-transparent hover:border-surface-border-strong transition-colors duration-fast-02 ease-productive-standard"
                >
                  <div className="flex items-center justify-between gap-ds-02">
                    <div className="flex items-center gap-ds-02 min-w-0">
                      <p.Icon size={16} className="text-accent-11 shrink-0" aria-hidden />
                      <span className="text-ds-md text-surface-fg font-semibold line-clamp-1">
                        {p.name}
                      </span>
                    </div>
                    <Badge size="sm" variant="soft" color="neutral">
                      {p.tag}
                    </Badge>
                  </div>
                  <Text variant="body-xs" className="text-surface-fg-muted">
                    {p.body}
                  </Text>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Built on shilp-sutra</CardTitle>
            <CardDescription>Surfaces the studio ships on this library.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-03">
            {surfaces.map((s) => (
              <Surface key={s.name} {...s} />
            ))}
            <Button
              startIcon={<IconBrandGithub size={14} />}
              variant="soft"
              size="sm"
              fullWidth
              asChild
            >
              <a
                href="https://github.com/devalok-design/shilp-sutra"
                target="_blank"
                rel="noreferrer"
              >
                Read the source
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-ds-04">
        <div className="flex flex-col gap-ds-02 max-w-2xl">
          <Text variant="heading-lg" className="text-surface-fg">
            Why the studio exists.
          </Text>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-04">
          <Text variant="body-md" className="text-surface-fg">
            Design has been flattened. A logo generator, a template, a script that writes the
            About page in the voice of every other About page. The work that results is fine, and
            fine is the problem. A brand is a living presence. Fine is the absence of one.
          </Text>
          <Text variant="body-md" className="text-surface-fg">
            We started Devalok because the studios we wanted to hire did not exist near us, and
            the ones that did were quietly closing. So we built the place we wished we could call.
            Soulful craft, made by a small team that signs its name to every line of it.
          </Text>
          <Text variant="body-md" className="text-surface-fg">
            The work is slower than the brief usually wants. It is also more honest than the
            brief usually expects. That trade is the studio. We will not move it. The clients who
            stay, stay because of it.
          </Text>
        </div>
      </section>

      <Card className="bg-accent-2 border-accent-7 shadow-raised">
        <CardHeader>
          <CardTitle className="text-[length:var(--typo-heading-sm-size)]">House ramp</CardTitle>
          <CardDescription>
            Three steps on the Devalok accent ramp. We eat our own dogfood. Every colour on this
            page is read from the same tokens you would consume from the library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-04">
            {ramp.map((r) => (
              <div key={r.label} className="flex flex-col gap-ds-02">
                <div
                  className={`h-20 rounded-ds-md ${r.token} border border-surface-border`}
                  aria-hidden
                />
                <div className="flex items-center justify-between gap-ds-02">
                  <Text variant="body-sm" className="text-surface-fg font-semibold">
                    {r.label}
                  </Text>
                  <code className="text-ds-xs text-surface-fg-subtle">{r.token}</code>
                </div>
                <Text variant="body-xs" className="text-surface-fg-muted">
                  {r.role}
                </Text>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-ds-04">
        <div className="flex flex-col gap-ds-02 max-w-2xl">
          <Text variant="heading-lg" className="text-surface-fg">
            Recent work.
          </Text>
          <Text variant="body-md" className="text-surface-fg-muted">
            A small slice across the three rooms we work in most often. Full case studies live on
            Manas.
          </Text>
        </div>
        <Tabs defaultValue="brand">
          <div className="overflow-x-auto -mx-ds-02 px-ds-02">
            <TabsList variant="line" color="accent">
              <TabsTrigger value="brand">Brand</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="editorial">Editorial</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="brand">
            <WorkGrid items={work.brand} />
          </TabsContent>
          <TabsContent value="product">
            <WorkGrid items={work.product} />
          </TabsContent>
          <TabsContent value="editorial">
            <WorkGrid items={work.editorial} />
          </TabsContent>
        </Tabs>
      </section>

      <Card className="bg-accent-2 border-accent-7">
        <CardContent className="flex flex-col gap-ds-04 py-ds-06">
          <div className="flex items-start gap-ds-03">
            <IconFeather size={20} className="text-accent-11 mt-1 shrink-0" aria-hidden />
            <div className="flex flex-col gap-ds-01">
              <Text variant="heading-sm" className="text-surface-fg">
                Conversation, understanding, creation.
              </Text>
              <Text variant="body-sm" className="text-surface-fg-muted">
                Every project here started with a long first conversation. Leave an address and we
                will write back ourselves. Namaskar.
              </Text>
            </div>
          </div>
          <form
            className="flex flex-col sm:flex-row gap-ds-03 sm:items-center"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="you@studio.com"
              aria-label="Your email address"
              className="sm:flex-1"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (sent) setSent(false)
              }}
              required
            />
            <Button
              size="lg"
              variant="soft"
              disabled={!email.trim()}
              onClickAsync={async () => {
                await sleep(1500)
                setEmail('')
                setSent(true)
              }}
            >
              Start the conversation
            </Button>
          </form>
          {sent ? (
            <Text variant="body-sm" className="text-accent-11" role="status">
              Address received. We will write back ourselves. Namaskar.
            </Text>
          ) : null}
        </CardContent>
      </Card>

      <footer className="flex flex-col items-center gap-ds-02 py-ds-06 text-center">
        <Text variant="heading-md" className="text-accent-11 italic">
          Atmatah Shilpam Kritvah.
        </Text>
        <Text variant="body-sm" className="text-surface-fg-muted">
          Devalok, Bengaluru. Different by Design.
        </Text>
      </footer>
    </div>
  )
}

function Surface({
  name,
  what,
  href,
  current,
}: {
  name: string
  what: string
  href?: string
  current?: boolean
}) {
  const body = (
    <>
      <div className="flex flex-col min-w-0">
        <Text variant="body-sm" className="text-surface-fg font-semibold line-clamp-1">
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
        <IconArrowUpRight
          size={14}
          className="text-surface-fg-subtle group-hover:text-accent-11 transition-colors duration-fast-02 ease-productive-standard shrink-0"
          aria-hidden
        />
      )}
    </>
  )

  if (href && !current) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group flex items-center justify-between gap-ds-03 rounded-ds-sm -mx-ds-02 px-ds-02 py-ds-01 hover:bg-surface-overlay transition-colors duration-fast-02 ease-productive-standard"
      >
        {body}
      </a>
    )
  }

  return (
    <div className="group flex items-center justify-between gap-ds-03 -mx-ds-02 px-ds-02 py-ds-01">
      {body}
    </div>
  )
}

function WorkGrid({ items }: { items: { name: string; meta: string }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-04 mt-ds-04">
      {items.map((item) => (
        <Card key={item.name} className="shadow-raised">
          <CardHeader>
            <div className="flex items-center justify-between gap-ds-02 min-w-0">
              <CardTitle className="text-[length:var(--typo-heading-sm-size)] line-clamp-2 min-w-0">
                {item.name}
              </CardTitle>
              <IconCircleCheck size={14} className="text-accent-11 shrink-0" aria-hidden />
            </div>
            <CardDescription className="line-clamp-3">{item.meta}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
