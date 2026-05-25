'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconBookmark,
  IconBookmarkFilled,
  IconBubble,
  IconClock,
  IconHeart,
  IconHeartFilled,
  IconShare3,
  IconUserPlus,
} from '@tabler/icons-react'

import { Avatar, AvatarFallback } from '@devalok/shilp-sutra/ui/avatar'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@devalok/shilp-sutra/ui/breadcrumb'
import { Button } from '@devalok/shilp-sutra/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@devalok/shilp-sutra/ui/card'
import { FormField } from '@devalok/shilp-sutra/ui/form'
import { Input } from '@devalok/shilp-sutra/ui/input'
import { Label } from '@devalok/shilp-sutra/ui/label'
import { Progress } from '@devalok/shilp-sutra/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@devalok/shilp-sutra/ui/tooltip'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

type IssueEntry = {
  number: string
  title: string
  author: string
  read: string
  active?: boolean
}

const issueContents: IssueEntry[] = [
  { number: '01', title: 'Editor’s note: a defence of the slow page.', author: 'Mudit Lal', read: '3 min' },
  { number: '02', title: 'We forgot what design was for.', author: 'Mudit Lal', read: '9 min', active: true },
  { number: '03', title: 'A taxonomy of empty whitespace.', author: 'Mridula Iyer', read: '12 min' },
  { number: '04', title: 'Photo essay: Ranthambore, off-season.', author: 'Aparna Bhatkar', read: '6 min' },
  { number: '05', title: 'Letters from the margin (a column).', author: 'Goutham Paneer', read: '4 min' },
  { number: '06', title: 'The body of the book is the body.', author: 'Yogin Sharma', read: '11 min' },
  { number: '07', title: 'On second drafts, and why they matter.', author: 'Amal Saji', read: '5 min' },
]

const essays = [
  { kicker: 'Essay', title: 'The slow web is finally winning.', author: 'Mridula Iyer', read: '11 min' },
  { kicker: 'Column', title: 'Why every brand needs a stylebook.', author: 'Goutham Paneer', read: '7 min' },
  { kicker: 'Essay', title: 'On the loss of margins.', author: 'Yogin Sharma', read: '14 min' },
]

const letters = [
  { from: 'Anaida P., Pune', subject: 'On Issue 13’s closing paragraph.', preview: 'I read it three times before I understood what it had cost you to leave it that bare. Thank you for trusting the reader.' },
  { from: 'Vihaan K., Goa', subject: 'A small correction.', preview: 'The Rams quote in your sixth column has the wrong attribution year. It is 1976, not 1979. Otherwise, a quiet, careful piece.' },
  { from: 'Rhea S., Bengaluru', subject: 'Re: the slow web.', preview: 'My team printed the essay and pinned it to the studio wall. We are trying to write fewer, longer things now. It is harder than it sounds.' },
]

const photoEssay = [
  { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=70', alt: 'Lone road through snowfields, dawn.' },
  { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=70', alt: 'Mountain reflected in still glacial water.' },
  { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=70', alt: 'Mist clearing over a forest valley.' },
  { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=600&q=70', alt: 'Yosemite valley at high noon.' },
]

const keepReading = [
  {
    kicker: 'Vol. iii · Essay',
    title: 'A taxonomy of empty whitespace.',
    read: '12 min',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=70',
  },
  {
    kicker: 'Vol. iii · Photo essay',
    title: 'Ranthambore, off-season.',
    read: '6 min',
    image: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=600&q=70',
  },
  {
    kicker: 'Vol. ii · Column',
    title: 'The body of the book is the body.',
    read: '11 min',
    image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=600&q=70',
  },
]

export function PatrikaShowcase() {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(284)
  const [bookmarked, setBookmarked] = useState(false)
  const [following, setFollowing] = useState(false)

  const toggleLike = () => {
    setLiked((prev) => {
      setLikes((n) => (prev ? n - 1 : n + 1))
      return !prev
    })
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_18rem] gap-ds-09">
        <article className="flex flex-col gap-ds-07">
          {/* Reading-progress strip */}
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="flex flex-col gap-ds-03"
          >
            <div className="flex items-center justify-between gap-ds-04">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Patrika</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#">Issue 14</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Margins</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <span className="text-ds-xs text-surface-fg-subtle tabular-nums shrink-0">
                42% read
              </span>
            </div>
            <Progress value={42} size="sm" />
          </motion.div>

          {/* Cover photograph as a captioned figure */}
          <figure className="flex flex-col gap-ds-02">
            <div className="relative rounded-surface overflow-hidden border border-surface-border-subtle aspect-[16/9]">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=80"
                alt="Open editorial spread, Patrika Vol. iv cover"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-ds-06 text-white">
                <span className="text-ds-xs uppercase tracking-wider opacity-90">
                  Patrika · Issue 14
                </span>
                <h2 className="text-ds-2xl font-semibold leading-tight mt-ds-02">
                  Vol. iv: Margins
                </h2>
              </div>
            </div>
            <figcaption className="text-ds-xs text-surface-fg-subtle">
              The Issue 14 cover, photographed on a single morning at the press in Sivakasi.
              Photograph by Aparna Bhatkar.
            </figcaption>
          </figure>

          {/* Article header */}
          <header className="flex flex-col gap-ds-04">
            <div className="flex items-center gap-ds-02 flex-wrap">
              <Badge variant="soft" color="accent">
                Vol. iv · Essay
              </Badge>
              <Badge variant="soft" color="neutral">
                Long read
              </Badge>
              <span className="text-ds-xs text-surface-fg-subtle">Patrika · Issue 14 · 23 May 2026</span>
            </div>

            <Text variant="heading-2xl" className="text-surface-fg text-balance">
              We forgot what design was for.
            </Text>

            <Text variant="body-lg" className="text-surface-fg-muted max-w-prose">
              For most of the last century, design served a question: what would make this object
              better to live with? Then somewhere between Helvetica and the App Store, the question
              quietly changed. This is a working theory about what changed, and what we might do
              about it.
            </Text>

            <div className="flex items-center justify-between gap-ds-03 pt-ds-04 border-t border-surface-border-subtle flex-wrap">
              <div className="flex items-center gap-ds-03">
                <Avatar size="md">
                  <AvatarFallback>ML</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <Text variant="body-sm" className="text-surface-fg font-medium">
                    Mudit Lal
                  </Text>
                  <Text variant="body-xs" className="text-surface-fg-subtle">
                    Edited by Mridula Iyer · Published 23 May 2026
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-ds-04 text-ds-xs text-surface-fg-muted">
                <span className="inline-flex items-center gap-ds-02">
                  <IconClock size={12} /> 9 min read
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                      aria-pressed={bookmarked}
                      onClick={() => setBookmarked((b) => !b)}
                    >
                      {bookmarked ? <IconBookmarkFilled size={14} /> : <IconBookmark size={14} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {bookmarked ? 'Saved to your bookmarks' : 'Save for later'}
                  </TooltipContent>
                </Tooltip>
                <Button variant="ghost" size="icon-sm" aria-label="Share article">
                  <IconShare3 size={14} />
                </Button>
              </div>
            </div>
          </header>

          {/* Body */}
          <div className="flex flex-col gap-ds-05">
            <Text variant="body-md" className="text-surface-fg max-w-prose">
              <span
                aria-hidden="true"
                className="float-left mr-ds-03 mt-ds-01 text-[3.5rem] leading-[0.85] font-serif font-semibold text-accent-11"
              >
                T
              </span>
              he new question, the one that quietly replaced the old one, is a question of
              conversion. Every pixel earns its keep by moving a metric. The button gets bigger
              because the metric demands it; the colour gets louder because the metric demands it;
              the copy gets shorter because attention is short and the metric is even shorter. The
              thinking happens at the metric, not at the user, and the object that results is not
              designed so much as optimised.
            </Text>

            <Text variant="body-md" className="text-surface-fg max-w-prose">
              Optimisation and design look similar from the outside. Both involve careful people
              making careful decisions about size, weight, colour, position. Both produce artefacts
              that are measurably better than the artefacts they replace. The difference is what
              they are better at. Optimisation makes things better at the metric. Design makes
              things better to live with. These are not the same thing
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center align-super text-ds-xs text-accent-11 hover:text-accent-12 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 rounded-ds-sm mx-ds-01 tabular-nums"
                    aria-label="Footnote 1"
                  >
                    [1]
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  Dieter Rams, in his 1976 lecture, named ten principles. The first was usefulness.
                  Conversion was not on the list.
                </TooltipContent>
              </Tooltip>
              , and the longer we pretend they are, the worse our objects get.
            </Text>

            <figure className="my-ds-03 pl-ds-05 sm:pl-ds-06 border-l-4 border-accent-9 max-w-prose">
              <p className="text-surface-fg italic font-serif text-ds-lg sm:text-ds-xl leading-snug">
                “The most useful design questions are still the oldest ones. They just stopped
                being asked, because they stopped being measurable.”
              </p>
              <figcaption className="text-ds-xs text-surface-fg-subtle mt-ds-03">
                From the cover essay, Vol. iv
              </figcaption>
            </figure>

            <Text variant="heading-md" className="text-surface-fg mt-ds-03 max-w-prose text-balance">
              What the old question used to do
            </Text>

            <Text variant="body-md" className="text-surface-fg max-w-prose">
              The old question, the one about living-with, was wider than the new question. It
              swept up considerations the metric will never see: how the object feels on the third
              day, how it ages, how it sits in a room beside other objects, how a stranger reads
              it, how a tired person reads it, how a kind person would have made it. None of these
              are anti-metric. Most of them, given enough time, do produce metrics. They are just
              not the metrics you can ship a release against.
            </Text>

            <Text variant="body-md" className="text-surface-fg max-w-prose">
              So they fall out of the brief, quietly, the way an unloved photograph falls out of an
              album. Nobody removes them. They are simply not invited to the next meeting, and the
              next meeting, and the next. After a while the brief is just the metric, and the
              metric is just the brief, and the people in the room have forgotten there was ever a
              difference.
            </Text>

            <Card className="bg-accent-2 border-accent-7 max-w-prose">
              <CardHeader className="pb-ds-02">
                <CardTitle className="text-[length:var(--typo-heading-sm-size)] text-accent-12">
                  What this means, in practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Text variant="body-md" className="text-accent-12">
                  Write the question down before you write the metric down. Keep the question
                  visible during reviews. If the metric ever contradicts the question, the
                  question wins, and the metric goes back to being a tool. This sounds obvious;
                  it is not, in any team I have worked on, common.
                </Text>
              </CardContent>
            </Card>

            <Text variant="body-md" className="text-surface-fg max-w-prose">
              I do not think this is anybody’s fault, exactly. Optimisation is honest work. The
              people doing it are usually kinder, smarter, and more diligent than the systems they
              are inside. But systems are heavier than people, and a system that only measures one
              thing will, given enough time, only produce the one thing. The corrective is not to
              throw the metric out. The corrective is to put the older question back where it can
              be seen, in the room, on the wall, in the brief, in the review.
            </Text>

            <Text variant="body-md" className="text-surface-fg max-w-prose">
              That is what Patrika is, for me: an attempt to keep the older question visible. The
              whole issue lives at patrika.devalok.in. Take it apart in the margins.
            </Text>
          </div>

          {/* End-of-article action cluster */}
          <div className="flex items-center justify-between gap-ds-03 py-ds-04 border-y border-surface-border-subtle flex-wrap">
            <div className="flex items-center gap-ds-02">
              <Button
                variant="ghost"
                size="sm"
                aria-label={liked ? 'Unlike article' : 'Like article'}
                aria-pressed={liked}
                onClick={toggleLike}
                startIcon={
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={liked ? 'liked' : 'unliked'}
                      initial={liked ? { scale: 1 } : false}
                      animate={liked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="inline-flex"
                    >
                      {liked ? (
                        <IconHeartFilled size={16} className="text-accent-11" />
                      ) : (
                        <IconHeart size={16} />
                      )}
                    </motion.span>
                  </AnimatePresence>
                }
              >
                <span className="tabular-nums" aria-live="polite">
                  {likes}
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark article'}
                aria-pressed={bookmarked}
                onClick={() => setBookmarked((b) => !b)}
                startIcon={
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={bookmarked ? 'saved' : 'unsaved'}
                      initial={bookmarked ? { scale: 1 } : false}
                      animate={bookmarked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="inline-flex"
                    >
                      {bookmarked ? <IconBookmarkFilled size={16} /> : <IconBookmark size={16} />}
                    </motion.span>
                  </AnimatePresence>
                }
              >
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Discuss in comments"
                startIcon={<IconBubble size={16} />}
              >
                Discuss (38)
              </Button>
            </div>
            <Button variant="ghost" size="sm" startIcon={<IconShare3 size={16} />}>
              Share
            </Button>
          </div>

          {/* Also in Issue 14 */}
          <section className="flex flex-col gap-ds-04">
            <div className="flex items-baseline justify-between gap-ds-03">
              <Text variant="heading-md" className="text-surface-fg">
                Also in Issue 14
              </Text>
              <Text variant="body-xs" className="text-surface-fg-subtle">
                Vol. iv · Margins
              </Text>
            </div>
            <Tabs defaultValue="essays" color="accent">
              <TabsList>
                <TabsTrigger value="essays">Essays</TabsTrigger>
                <TabsTrigger value="photo">Photo essay</TabsTrigger>
                <TabsTrigger value="letters">Letters</TabsTrigger>
              </TabsList>

              <TabsContent value="essays" className="pt-ds-04">
                <ul className="flex flex-col">
                  {essays.map((e) => (
                    <li
                      key={e.title}
                      className="group flex items-start justify-between gap-ds-04 py-ds-04 border-b border-surface-border-subtle last:border-b-0"
                    >
                      <div className="flex flex-col gap-ds-01 min-w-0">
                        <span className="text-ds-xs uppercase tracking-wider text-accent-11">
                          {e.kicker}
                        </span>
                        <span className="text-ds-md text-surface-fg font-semibold line-clamp-2">
                          {e.title}
                        </span>
                        <span className="text-ds-xs text-surface-fg-subtle truncate">
                          {e.author} · {e.read}
                        </span>
                      </div>
                      <Button variant="soft" size="sm" className="shrink-0">
                        Read
                      </Button>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="photo" className="pt-ds-04">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-ds-03">
                  {photoEssay.map((p) => (
                    <div
                      key={p.src}
                      className="relative aspect-square rounded-ds-md overflow-hidden border border-surface-border-subtle"
                    >
                      <img
                        src={p.src}
                        alt={p.alt}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-moderate-01 ease-productive-standard hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <Text variant="body-xs" className="text-surface-fg-subtle mt-ds-03">
                  Four frames from Aparna Bhatkar’s Ranthambore series. The full sequence runs to
                  twenty-two plates in print.
                </Text>
              </TabsContent>

              <TabsContent value="letters" className="pt-ds-04">
                <ul className="flex flex-col gap-ds-04">
                  {letters.map((l) => (
                    <li
                      key={l.subject}
                      className="flex flex-col gap-ds-01 pb-ds-04 border-b border-surface-border-subtle last:border-b-0 last:pb-0"
                    >
                      <span className="text-ds-xs text-surface-fg-subtle truncate">{l.from}</span>
                      <span className="text-ds-md text-surface-fg font-semibold line-clamp-2">
                        {l.subject}
                      </span>
                      <span className="text-ds-sm text-surface-fg-muted italic line-clamp-3">
                        “{l.preview}”
                      </span>
                    </li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          </section>

          {/* Keep reading */}
          <section className="flex flex-col gap-ds-04">
            <Text variant="heading-md" className="text-surface-fg">
              Keep reading
            </Text>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-04">
              {keepReading.map((r) => (
                <a
                  key={r.title}
                  href="#"
                  className="group flex flex-col gap-ds-03 rounded-surface bg-surface-raised border border-surface-border shadow-raised hover:shadow-raised-hover hover:border-surface-border-strong transition-shadow duration-fast-02 ease-productive-standard overflow-hidden focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9"
                >
                  <div className="relative aspect-[4/3] overflow-hidden border-b border-surface-border-subtle">
                    <img
                      src={r.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-moderate-01 ease-productive-standard group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex flex-col gap-ds-01 p-ds-04 pt-ds-02">
                    <span className="text-ds-xs uppercase tracking-wider text-accent-11">
                      {r.kicker}
                    </span>
                    <span className="text-ds-md text-surface-fg font-semibold line-clamp-2 group-hover:text-accent-11 transition-colors duration-fast-02 ease-productive-standard">
                      {r.title}
                    </span>
                    <span className="text-ds-xs text-surface-fg-subtle inline-flex items-center gap-ds-02">
                      <IconClock size={12} /> {r.read}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        </article>

        {/* Sticky sidebar */}
        <aside className="flex flex-col gap-ds-05 lg:sticky lg:top-ds-06 lg:self-start">
          {/* Author bio */}
          <Card>
            <CardContent className="flex flex-col gap-ds-04 pt-ds-05">
              <div className="flex items-center gap-ds-03">
                <Avatar size="lg">
                  <AvatarFallback>ML</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <Text variant="body-md" className="text-surface-fg font-medium truncate">
                    Mudit Lal
                  </Text>
                  <Text variant="body-xs" className="text-surface-fg-subtle truncate">
                    Editor, Patrika
                  </Text>
                </div>
              </div>
              <Text variant="body-sm" className="text-surface-fg-muted line-clamp-3">
                Writes about design, slow media, and the small economics of independent publishing.
                Based in Bengaluru.
              </Text>
              <Button
                variant="soft"
                color="accent"
                size="sm"
                fullWidth
                onClick={() => setFollowing((f) => !f)}
                startIcon={<IconUserPlus size={14} />}
                aria-pressed={following}
              >
                {following ? 'Following' : 'Follow'}
              </Button>
            </CardContent>
          </Card>

          {/* Numbered Issue ToC */}
          <Card>
            <CardHeader>
              <CardTitle className="text-[length:var(--typo-heading-sm-size)]">
                In this issue
              </CardTitle>
              <CardDescription>Vol. iv · Margins · 7 pieces</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ol className="flex flex-col">
                {issueContents.map((entry) => {
                  const isActive = entry.active
                  return (
                    <li key={entry.number}>
                      <a
                        href="#"
                        aria-current={isActive ? 'page' : undefined}
                        className={[
                          'flex items-start gap-ds-03 px-ds-03 -mx-ds-03 py-ds-03 rounded-ds-md border-l-2 transition-colors duration-fast-02 ease-productive-standard focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9',
                          isActive
                            ? 'bg-accent-3 border-accent-9 text-accent-11'
                            : 'border-transparent hover:bg-surface-raised-hover text-surface-fg',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'text-ds-xs tabular-nums shrink-0 mt-ds-01 font-medium',
                            isActive ? 'text-accent-11' : 'text-surface-fg-subtle',
                          ].join(' ')}
                        >
                          {entry.number}
                        </span>
                        <span className="flex flex-col gap-ds-01 min-w-0">
                          <span
                            className={[
                              'text-ds-sm leading-snug line-clamp-2',
                              isActive ? 'font-semibold' : 'font-medium',
                            ].join(' ')}
                          >
                            {entry.title}
                          </span>
                          <span className="text-ds-xs text-surface-fg-subtle truncate">
                            {entry.author} · {entry.read}
                          </span>
                        </span>
                      </a>
                    </li>
                  )
                })}
              </ol>
            </CardContent>
          </Card>

          {/* Subscribe */}
          <Card className="bg-accent-2 border-accent-7">
            <CardHeader>
              <CardTitle className="text-[length:var(--typo-heading-sm-size)]">
                Subscribe
              </CardTitle>
              <CardDescription>One slow letter, every first Sunday.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-ds-04">
              <FormField>
                <Label htmlFor="patrika-subscribe-email">Email</Label>
                <Input
                  id="patrika-subscribe-email"
                  type="email"
                  placeholder="namaskar@devalok.in"
                  autoComplete="email"
                />
              </FormField>
              <Button
                variant="solid"
                color="accent"
                size="md"
                fullWidth
                onClickAsync={async () => {
                  await sleep(1100)
                }}
              >
                Send me Patrika
              </Button>
              <Text variant="body-xs" className="text-surface-fg-subtle">
                No tracking pixels. Unsubscribe in one click. We send the letter from a person, not
                a platform.
              </Text>
            </CardContent>
          </Card>
        </aside>
      </div>
    </TooltipProvider>
  )
}
