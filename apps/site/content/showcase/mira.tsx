'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  IconCheck,
  IconHeart,
  IconLeaf,
  IconMapPin,
  IconRecycle,
  IconShieldCheck,
  IconShoppingBag,
  IconStarFilled,
  IconTruck,
} from '@tabler/icons-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@devalok/shilp-sutra/ui/accordion'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Combobox } from '@devalok/shilp-sutra/ui/combobox'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@devalok/shilp-sutra/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@devalok/shilp-sutra/ui/tabs'
import { Text } from '@devalok/shilp-sutra/ui/text'
import { ToggleGroup, ToggleGroupItem } from '@devalok/shilp-sutra/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@devalok/shilp-sutra/ui/tooltip'

type ColourId = 'haldi' | 'kumkum' | 'neel' | 'sage' | 'kala'

type Colour = {
  id: ColourId
  name: string
  story: string
  /** Fabric dye colours — intentionally explicit, declared once here. */
  value: string
  /** Second gradient stop, also explicit. */
  shade: string
}

const COLOURS: readonly Colour[] = [
  { id: 'haldi', name: 'Haldi', story: 'Turmeric root, sun-fixed.', value: 'oklch(0.78 0.14 78)', shade: 'oklch(0.62 0.13 60)' },
  { id: 'kumkum', name: 'Kumkum', story: 'Madder root, six-dip.', value: 'oklch(0.56 0.18 25)', shade: 'oklch(0.42 0.16 18)' },
  { id: 'neel', name: 'Neel', story: 'Sanganer indigo vat.', value: 'oklch(0.42 0.13 245)', shade: 'oklch(0.30 0.10 250)' },
  { id: 'sage', name: 'Sage', story: 'Pomegranate skin + iron.', value: 'oklch(0.70 0.06 145)', shade: 'oklch(0.55 0.07 140)' },
  { id: 'kala', name: 'Kala', story: 'Iron-mordant black.', value: 'oklch(0.32 0.02 40)', shade: 'oklch(0.20 0.02 40)' },
] as const

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL'
const SIZES: readonly { id: Size; available: boolean }[] = [
  { id: 'XS', available: true },
  { id: 'S', available: true },
  { id: 'M', available: true },
  { id: 'L', available: false },
  { id: 'XL', available: true },
]

const BLENDS = [
  { value: 'mulmul', label: 'Mulmul cotton', description: '90 GSM, four-warp weave' },
  { value: 'khadi', label: 'Khadi cotton', description: '140 GSM, hand-spun yarn' },
  { value: 'cotton-silk', label: 'Cotton with ahimsa silk', description: '120 GSM, peace silk weft' },
  { value: 'linen', label: 'Belgian linen blend', description: '160 GSM, looser drape' },
]

const REVIEWS = [
  {
    name: 'Anjali R.',
    initials: 'AR',
    location: 'Bengaluru',
    rating: 5,
    title: 'Worth the wait.',
    body: 'The Haldi shade is exactly the warm yellow I hoped for. Cotton is light enough for May afternoons here. Stitching at the side vent is clean.',
    daysAgo: 4,
  },
  {
    name: 'Vikram S.',
    initials: 'VS',
    location: 'Brooklyn, NY',
    rating: 5,
    title: 'Held up to a wedding.',
    body: 'Wore the Neel to a cousins reception in Jaipur. Five hours of dancing and the fabric still felt cool. Bled a touch on the first wash, settled after that.',
    daysAgo: 12,
  },
  {
    name: 'Priya M.',
    initials: 'PM',
    location: 'London',
    rating: 4,
    title: 'Run slightly large.',
    body: 'I size down on Mira. The shoulders sit two fingers wider than my usual M. Otherwise the khadi is gorgeous and softens beautifully.',
    daysAgo: 23,
  },
]

const RELATED = [
  {
    name: 'Block-print dupatta',
    sub: 'Sanganer floral, vegetable-dyed',
    inr: '₹2,400',
    usd: '$29',
    tag: 'New batch',
    img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Mool cotton trouser',
    sub: 'Pleated front, drawstring',
    inr: '₹3,600',
    usd: '$44',
    tag: 'Last few',
    img: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Tulsi linen kurta',
    sub: 'Belgian linen, mandarin collar',
    inr: '₹4,800',
    usd: '$58',
    tag: '',
    img: 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Bandhini scarf',
    sub: 'Kutch tie-dye, mulmul',
    inr: '₹1,800',
    usd: '$22',
    tag: '',
    img: 'https://images.unsplash.com/photo-1601762603339-fd61e28b698a?auto=format&fit=crop&w=600&q=80',
  },
]

type CartLine = { colour: ColourId; size: Size; blend: string }

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function MiraShowcase() {
  const [colour, setColour] = useState<ColourId>('haldi')
  const [size, setSize] = useState<Size>('M')
  const [blend, setBlend] = useState<string>('khadi')
  const [favourite, setFavourite] = useState(false)
  const [cart, setCart] = useState<CartLine[]>([])
  const [tab, setTab] = useState<'description' | 'reviews' | 'story' | 'shipping'>('description')

  const activeColour = useMemo(() => COLOURS.find((c) => c.id === colour) ?? COLOURS[0], [colour])
  const activeBlend = BLENDS.find((b) => b.value === blend) ?? BLENDS[0]

  const addToBag = async () => {
    await sleep(900)
    setCart((c) => [...c, { colour, size, blend }])
  }

  const toggleFavourite = () => setFavourite((v) => !v)

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col gap-ds-06">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Kurtas</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Hand-spun cotton</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Mira-001</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-ds-06">
          {/* Hero photograph + colour wash */}
          <div className="relative rounded-ds-md overflow-hidden border border-surface-border-subtle min-h-[480px] flex items-end isolate">
            <img
              src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80"
              alt="Hand-spun cotton kurta, photographed in Bangalore studio"
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <AnimatePresence initial={false}>
              <motion.div
                key={activeColour.id}
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.62 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 mix-blend-multiply"
                style={{
                  background: `linear-gradient(135deg, ${activeColour.value} 0%, ${activeColour.shade} 100%)`,
                }}
              />
            </AnimatePresence>

            <div className="relative z-[1] p-ds-05 flex items-end justify-between w-full text-surface-fg-inverted">
              <div className="flex flex-col gap-ds-02">
                <Badge variant="solid" color="accent" size="sm">
                  Slow-made · {activeColour.name}
                </Badge>
                <span className="text-ds-xs text-surface-fg-inverted/80">{activeColour.story}</span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-md"
                    aria-label={favourite ? 'Saved to your shelf' : 'Save to your shelf'}
                    aria-pressed={favourite}
                    onClick={toggleFavourite}
                  >
                    <IconHeart
                      size={20}
                      className={favourite ? 'fill-accent-9 text-accent-9' : 'text-surface-fg-inverted'}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{favourite ? 'Saved' : 'Save to your shelf'}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Product details */}
          <div className="flex flex-col gap-ds-05">
            <header className="flex flex-col gap-ds-02">
              <div className="flex items-center gap-ds-02">
                <Text variant="label-sm" className="text-surface-fg-subtle uppercase tracking-wide">
                  Mira-001 · The everyday kurta
                </Text>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-success-3 text-success-11">
                      <IconLeaf size={11} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Certified organic cotton</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent-3 text-accent-11">
                      <IconShieldCheck size={11} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Fair Trade certified weavers</TooltipContent>
                </Tooltip>
              </div>
              <Text variant="heading-xl" className="text-surface-fg">
                The khadi shirt, in{' '}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={activeColour.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="inline-block text-accent-11"
                  >
                    {activeColour.name}.
                  </motion.span>
                </AnimatePresence>
              </Text>
              <div className="flex items-center gap-ds-03 mt-ds-01">
                <Text variant="heading-md" className="text-surface-fg">
                  ₹4,800
                </Text>
                <Text variant="body-sm" className="text-surface-fg-subtle">
                  / $58 USD
                </Text>
                <Badge variant="soft" color="success" size="sm">
                  Free domestic shipping
                </Badge>
              </div>
              <div className="flex items-center gap-ds-02 text-ds-xs text-surface-fg-muted mt-ds-01">
                <span className="inline-flex items-center gap-ds-01">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStarFilled key={i} size={11} className={i < 4 ? 'text-accent-9' : 'text-surface-border'} />
                  ))}
                </span>
                <span>4.8 · 312 reviews</span>
                <span className="text-surface-border">·</span>
                <span className="inline-flex items-center gap-ds-01">
                  <IconMapPin size={11} /> Ships from Bangalore
                </span>
              </div>
            </header>

            {/* Colour swatches — drive the hero wash */}
            <div className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-muted">
                Colour · <span className="text-surface-fg">{activeColour.name}</span>
              </Text>
              <div className="flex items-center gap-ds-03">
                {COLOURS.map((c) => {
                  const active = c.id === colour
                  return (
                    <Tooltip key={c.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${c.name}: ${c.story}`}
                          aria-pressed={active}
                          onClick={() => setColour(c.id)}
                          className="relative w-9 h-9 rounded-full border border-surface-border-subtle transition-transform duration-fast-01 hover:scale-105 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
                          style={{ background: c.value }}
                        >
                          {active && (
                            <motion.span
                              layoutId="mira-colour-ring"
                              className="absolute -inset-1 rounded-full border-2 border-accent-9"
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {c.name} · {c.story}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>

            {/* Size — ToggleGroup with disabled out-of-stock */}
            <div className="flex flex-col gap-ds-02">
              <div className="flex items-center justify-between">
                <Text variant="label-sm" className="text-surface-fg-muted">
                  Size · <span className="text-surface-fg">{size}</span>
                </Text>
                <a
                  href="#size-guide"
                  className="text-ds-xs text-surface-fg-subtle underline underline-offset-2 hover:text-surface-fg"
                >
                  Size guide
                </a>
              </div>
              <ToggleGroup
                type="single"
                variant="outline"
                size="md"
                value={size}
                onValueChange={(v) => v && setSize(v as Size)}
                className="flex gap-ds-02"
              >
                {SIZES.map((s) => (
                  <ToggleGroupItem
                    key={s.id}
                    value={s.id}
                    disabled={!s.available}
                    aria-label={s.available ? `Size ${s.id}` : `Size ${s.id} out of stock`}
                    className="min-w-11"
                  >
                    {s.id}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {SIZES.some((s) => !s.available) && (
                <Text variant="body-xs" className="text-surface-fg-subtle">
                  Size L is between batches. The next run is dyed in early June.
                </Text>
              )}
            </div>

            {/* Fabric blend Combobox */}
            <div className="flex flex-col gap-ds-02">
              <Text variant="label-sm" className="text-surface-fg-muted">
                Fabric blend
              </Text>
              <Combobox
                options={BLENDS}
                value={blend}
                onValueChange={(v) => setBlend(v)}
                placeholder="Choose a fabric"
                searchPlaceholder="mulmul, khadi, linen..."
                accessibleLabel="Choose a fabric blend"
                size="md"
              />
              <Text variant="body-xs" className="text-surface-fg-subtle">
                Picked: {activeBlend.description}. Warp from Pollachi, weft hand-spun in Channapatna.
              </Text>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-ds-02 mt-ds-02">
              <Button
                size="lg"
                startIcon={<IconShoppingBag size={16} />}
                fullWidth
                onClickAsync={addToBag}
              >
                Add to bag · ₹4,800
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="lg" variant="soft" aria-label={`Open bag with ${cart.length} items`}>
                    Bag · {cart.length}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Your bag</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-ds-03 mt-ds-04">
                    {cart.length === 0 ? (
                      <Text variant="body-sm" className="text-surface-fg-muted">
                        Empty for now. Pick a colour, then a size, then come back.
                      </Text>
                    ) : (
                      cart.map((line, i) => {
                        const lineColour = COLOURS.find((c) => c.id === line.colour) ?? COLOURS[0]
                        const lineBlend = BLENDS.find((b) => b.value === line.blend) ?? BLENDS[0]
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-ds-03 p-ds-03 rounded-ds-md border border-surface-border-subtle"
                          >
                            <span
                              className="w-10 h-10 rounded-ds-sm shrink-0 border border-surface-border-subtle"
                              style={{ background: lineColour.value }}
                              aria-hidden
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-ds-sm text-surface-fg font-semibold line-clamp-1">
                                Mira · {lineColour.name}
                              </span>
                              <span className="text-ds-xs text-surface-fg-subtle line-clamp-1">
                                Size {line.size} · {lineBlend.label}
                              </span>
                            </div>
                            <span className="text-ds-sm text-surface-fg">₹4,800</span>
                          </div>
                        )
                      })
                    )}
                    {cart.length > 0 && (
                      <>
                        <div className="flex items-center justify-between pt-ds-03 border-t border-surface-border-subtle">
                          <Text variant="label-sm" className="text-surface-fg-muted">
                            Subtotal
                          </Text>
                          <Text variant="heading-sm" className="text-surface-fg">
                            ₹{(cart.length * 4800).toLocaleString('en-IN')}
                          </Text>
                        </div>
                        <Button size="md" fullWidth>
                          Checkout
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex flex-wrap items-center gap-ds-04 text-ds-xs text-surface-fg-muted pt-ds-03 border-t border-surface-border-subtle">
              <span className="inline-flex items-center gap-ds-02">
                <IconTruck size={12} /> Ships in 3 working days
              </span>
              <span className="inline-flex items-center gap-ds-02">
                <IconRecycle size={12} /> 30-day return on unworn pieces
              </span>
            </div>
          </div>
        </div>

        {/* Tabs: description / reviews / story / shipping */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList variant="line">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews · 312</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="shipping">Ships from</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="pt-ds-04">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-05">
              <Text variant="body-md" className="text-surface-fg-muted">
                A hand-spun cotton kurta cut for the long Indian summer. The warp is mill-spun Pollachi
                cotton; the weft is khadi yarn spun on a Channapatna charkha. Mandarin collar, side-vent
                hemline, mother-of-pearl buttons. Each piece softens with every wash and holds its colour
                through twenty cycles of cold-water rinse.
              </Text>
              <Accordion type="single" defaultValue="material" collapsible>
                <AccordionItem value="material">
                  <AccordionTrigger>Material</AccordionTrigger>
                  <AccordionContent>
                    100% organic cotton. 140 GSM khadi weave. Vegetable-dyed in small batches at our
                    Sanganer studio. Slight variation between pieces is the mark of hand-dyeing.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="care">
                  <AccordionTrigger>Care</AccordionTrigger>
                  <AccordionContent>
                    Cold-water hand wash for the first three cycles. Dry in shade. Iron on the reverse
                    while damp. Do not bleach. The Kumkum and Neel shades will release dye on the first
                    wash, which is part of how vegetable dyes settle.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="shipping">
                  <AccordionTrigger>Shipping</AccordionTrigger>
                  <AccordionContent>
                    Free across India over ₹2,500. Flat $14 to USA, UK, EU, Singapore, Australia. We ship
                    DDP, so duties are included at checkout. Each piece is wrapped in unbleached khadi
                    cloth and shipped in a recycled-card box.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="returns">
                  <AccordionTrigger>Returns</AccordionTrigger>
                  <AccordionContent>
                    30 days on unworn pieces with the tag attached. We pay return shipping inside India
                    and credit return shipping internationally. Vegetable-dyed pieces with intentional
                    shade variation are not returnable for variation alone.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-ds-04">
            <div className="flex flex-col gap-ds-04">
              {REVIEWS.map((r) => (
                <div key={r.name} className="flex gap-ds-04 pb-ds-04 border-b border-surface-border-subtle last:border-b-0">
                  <Avatar size="md">
                    <AvatarFallback colorSeed={r.name}>{r.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-ds-01 flex-1">
                    <div className="flex items-center gap-ds-02 flex-wrap">
                      <span className="text-ds-md text-surface-fg font-semibold">{r.name}</span>
                      <Badge variant="soft" color="success" size="xs">
                        <IconCheck size={10} className="mr-ds-01" />
                        Verified buyer
                      </Badge>
                      <span className="text-ds-xs text-surface-fg-subtle">· {r.location}</span>
                    </div>
                    <div className="flex items-center gap-ds-02">
                      <span className="inline-flex items-center gap-ds-01">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IconStarFilled
                            key={i}
                            size={11}
                            className={i < r.rating ? 'text-accent-9' : 'text-surface-border'}
                          />
                        ))}
                      </span>
                      <span className="text-ds-xs text-surface-fg-subtle">{r.daysAgo} days ago</span>
                    </div>
                    <Text variant="body-md" className="text-surface-fg font-semibold mt-ds-01">
                      {r.title}
                    </Text>
                    <Text variant="body-sm" className="text-surface-fg-muted">
                      {r.body}
                    </Text>
                  </div>
                </div>
              ))}
              <Button variant="soft" size="md" className="self-start">
                Show all 312 reviews
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="story" className="pt-ds-04">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-ds-05 items-start">
              <img
                src="https://images.unsplash.com/photo-1604608672516-f1b9b1d1f5e8?auto=format&fit=crop&w=700&q=80"
                alt="A weaver at a pit loom in Channapatna"
                className="rounded-ds-md border border-surface-border-subtle w-full"
                loading="lazy"
              />
              <div className="flex flex-col gap-ds-03">
                <Text variant="heading-sm" className="text-surface-fg">
                  Three hands made this piece.
                </Text>
                <Text variant="body-md" className="text-surface-fg-muted">
                  The yarn is spun by Lakshmi on a charkha in Channapatna, woven by Murugan at a pit loom
                  the next village over, and dyed by the Singh family in Sanganer. We pay each step on
                  per-piece rates the artisan sets, and we publish the breakdown on every order receipt.
                </Text>
                <Text variant="body-md" className="text-surface-fg-muted">
                  Mira is named after Mira Behn, who spent her life learning to spin so she could teach
                  others. The everyday kurta is our version of that practice: one shirt, made slowly, for
                  the next ten years of your wardrobe.
                </Text>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="pt-ds-04">
            <div className="flex flex-col gap-ds-03">
              <Text variant="body-md" className="text-surface-fg-muted">
                Hand-finished and shipped from our studio in Bangalore. Wrapped in unbleached khadi and a
                recycled-card box. Tracked, signed, and carbon-offset on the courier leg.
              </Text>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-ds-03 text-ds-sm">
                <li className="p-ds-03 rounded-ds-md border border-surface-border-subtle">
                  <div className="text-surface-fg font-semibold">India</div>
                  <div className="text-surface-fg-muted">3 working days · free over ₹2,500</div>
                </li>
                <li className="p-ds-03 rounded-ds-md border border-surface-border-subtle">
                  <div className="text-surface-fg font-semibold">USA · UK · EU</div>
                  <div className="text-surface-fg-muted">7-9 working days · flat $14 · DDP</div>
                </li>
                <li className="p-ds-03 rounded-ds-md border border-surface-border-subtle">
                  <div className="text-surface-fg font-semibold">Singapore · Australia</div>
                  <div className="text-surface-fg-muted">5-7 working days · flat $14</div>
                </li>
                <li className="p-ds-03 rounded-ds-md border border-surface-border-subtle">
                  <div className="text-surface-fg font-semibold">Rest of world</div>
                  <div className="text-surface-fg-muted">10-14 working days · flat $22</div>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related products */}
        <div>
          <div className="flex items-end justify-between mb-ds-04">
            <Text variant="heading-md" className="text-surface-fg">
              Worn together
            </Text>
            <Text variant="body-sm" className="text-surface-fg-subtle">
              Four pieces our customers pair with Mira
            </Text>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-ds-04">
            {RELATED.map((r) => (
              <Card key={r.name} interactive size="sm">
                <div className="relative h-40 rounded-t-ds-md overflow-hidden -m-ds-04 mb-ds-03 border-b border-surface-border-subtle">
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover" loading="lazy" />
                  {r.tag && (
                    <div className="absolute top-ds-02 left-ds-02">
                      <Badge variant="solid" color="accent" size="xs">
                        {r.tag}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="text-[length:var(--typo-heading-sm-size)]">{r.name}</CardTitle>
                  <CardDescription>{r.sub}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 pt-ds-03 flex items-center justify-between">
                  <span className="text-ds-sm text-surface-fg font-semibold">{r.inr}</span>
                  <span className="text-ds-xs text-surface-fg-subtle">{r.usd}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
