'use client'

import { IconBookmark, IconClock, IconShare3 } from '@tabler/icons-react'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const moreReading = [
  { title: 'The slow web is finally winning.', author: 'Mridula Iyer', read: '11 min' },
  { title: 'Why every brand needs a stylebook.', author: 'Goutham Paneer', read: '7 min' },
  { title: 'On the loss of margins.', author: 'Yogin Sharma', read: '14 min' },
]

export function PatrikaShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-ds-09">
      <article className="flex flex-col gap-ds-06">
        {/* Issue cover photograph */}
        <div className="relative rounded-ds-md overflow-hidden border border-surface-border-subtle aspect-[16/9]">
          <img
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80"
            alt="Open editorial spread — Patrika Vol. iv cover"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-ds-06 text-white">
            <span className="text-ds-xs uppercase tracking-wider opacity-90">Patrika · Issue 14</span>
            <h2 className="text-ds-2xl font-semibold leading-tight mt-ds-02">
              Vol. iv — Margins
            </h2>
          </div>
        </div>

        <header className="flex flex-col gap-ds-04">
          <div className="flex items-center gap-ds-02">
            <Badge variant="soft" color="accent">
              Vol. iv · Essay
            </Badge>
            <span className="text-ds-xs text-surface-fg-subtle">Patrika · Issue 14</span>
          </div>

          <Text variant="heading-2xl" className="text-surface-fg">
            We forgot what design was for.
          </Text>

          <Text variant="body-lg" className="text-surface-fg-muted">
            For most of the last century, design served a question: what would make this object
            better to live with? Then somewhere between Helvetica and the App Store, the question
            quietly changed.
          </Text>

          <div className="flex items-center justify-between gap-ds-03 pt-ds-04 border-t border-surface-border-subtle">
            <div className="flex items-center gap-ds-03">
              <Avatar size="sm">
                <AvatarFallback>ML</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <Text variant="body-sm" className="text-surface-fg">
                  Mudit Lal
                </Text>
                <Text variant="body-xs" className="text-surface-fg-subtle">
                  23 May 2026 · Updated today
                </Text>
              </div>
            </div>
            <div className="flex items-center gap-ds-04 text-ds-xs text-surface-fg-muted">
              <span className="inline-flex items-center gap-ds-02">
                <IconClock size={12} />9 min
              </span>
              <Button variant="ghost" size="icon-sm" aria-label="Bookmark">
                <IconBookmark size={14} />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Share">
                <IconShare3 size={14} />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-ds-04">
          <Text variant="body-md" className="text-surface-fg">
            The new question is one of conversion. Every pixel earns its keep by moving a metric.
            The button gets bigger because the metric demands it. The colour gets louder because
            the metric demands it. The thinking happens at the metric, not at the user, and the
            object that results is not designed so much as optimised.
          </Text>

          <Text variant="body-md" className="text-surface-fg">
            This is a working theory. Take it apart in the margins. The whole issue lives at
            patrika.devalok.in.
          </Text>

          <figure className="my-ds-04 p-ds-06 rounded-ds-md bg-accent-2 border-l-4 border-accent-9">
            <Text variant="heading-sm" className="text-surface-fg italic">
              &ldquo;The most useful design questions are still the oldest ones. They just stopped being asked.&rdquo;
            </Text>
            <Text variant="body-xs" className="text-surface-fg-subtle mt-ds-02">
              — from the cover essay
            </Text>
          </figure>
        </div>
      </article>

      <aside className="flex flex-col gap-ds-05">
        <Card>
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">More from this issue</CardTitle>
            <CardDescription>Vol. iv · Margins</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col">
              {moreReading.map((m, i) => (
                <li
                  key={i}
                  className="group/row flex flex-col gap-ds-01 px-ds-02 -mx-ds-02 py-ds-03 rounded-ds-md border-b border-surface-border-subtle last:border-b-0 hover:bg-surface-raised-hover transition-colors duration-fast-02 ease-productive-standard cursor-pointer"
                >
                  <span className="text-ds-md text-surface-fg font-semibold line-clamp-2">{m.title}</span>
                  <span className="text-ds-xs text-surface-fg-subtle">
                    {m.author} · {m.read}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-accent-2 border-accent-7">
          <CardHeader>
            <CardTitle className="text-[length:var(--typo-heading-sm-size)]">Subscribe</CardTitle>
            <CardDescription>One slow letter, monthly</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ds-03">
            <input
              type="email"
              placeholder="namaskar@devalok.in"
              className="h-ds-md px-ds-04 rounded-ds-md border border-surface-border bg-surface-overlay text-ds-md text-surface-fg placeholder:text-surface-fg-subtle focus:outline-hidden focus:ring-2 focus:ring-accent-9"
            />
            <Button size="md" fullWidth onClickAsync={async () => { await sleep(1000) }}>
              Send me Patrika
            </Button>
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
