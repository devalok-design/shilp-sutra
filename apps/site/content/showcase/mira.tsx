'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconHeart, IconShoppingBag, IconStar, IconTruck } from '@tabler/icons-react'
import { Badge } from '@devalok/shilp-sutra/ui/badge'
import { Button } from '@devalok/shilp-sutra/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@devalok/shilp-sutra/ui/card'
import { Text } from '@devalok/shilp-sutra/ui/text'

const colours = [
  { id: 'haldi', name: 'Haldi', value: 'oklch(0.75 0.14 70)' },
  { id: 'kumkum', name: 'Kumkum', value: 'oklch(0.55 0.18 25)' },
  { id: 'neel', name: 'Neel', value: 'oklch(0.45 0.12 240)' },
  { id: 'sage', name: 'Sage', value: 'oklch(0.7 0.06 145)' },
] as const

const sizes = ['XS', 'S', 'M', 'L', 'XL'] as const

const related = [
  { name: 'Linen kurta · Tulsi', price: '₹4,800', tag: 'New' },
  { name: 'Block-print dupatta', price: '₹2,400', tag: '' },
  { name: 'Cotton trouser · Mool', price: '₹3,600', tag: 'Last few' },
]

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function MiraShowcase() {
  const [colour, setColour] = useState<(typeof colours)[number]['id']>('haldi')
  const [size, setSize] = useState<(typeof sizes)[number]>('M')
  const [favourite, setFavourite] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  const activeColour = colours.find((c) => c.id === colour) ?? colours[0]

  const addToBag = async () => {
    await sleep(800)
    setCartCount((c) => c + 1)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-ds-08">
      {/* Product image */}
      <div className="relative rounded-ds-md overflow-hidden border border-surface-border-subtle min-h-[420px] flex items-end">
        {/* Base photograph — handwoven cotton kurta */}
        <img
          src="https://images.unsplash.com/photo-1517254797898-04c1aa6cd95a?auto=format&fit=crop&w=900&q=80"
          alt="Handwoven cotton kurta, draped"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Colour wash overlaying the photo — recolours with active swatch */}
        <AnimatePresence initial={false}>
          <motion.div
            key={activeColour.id}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute inset-0 mix-blend-multiply"
            style={{
              background: `linear-gradient(135deg, ${activeColour.value} 0%, oklch(0.6 0.1 ${activeColour.value.match(/\s([0-9.]+)\)/)?.[1]}) 100%)`,
            }}
          />
        </AnimatePresence>
        <div className="relative z-[1] p-ds-06 flex items-end justify-between w-full text-surface-fg-inverted">
          <Badge variant="solid" color="accent">
            Slow-made · {activeColour.name}
          </Badge>
          <Button
            variant="ghost"
            size="icon-md"
            aria-label={favourite ? 'Remove from favourites' : 'Add to favourites'}
            onClick={() => setFavourite((v) => !v)}
          >
            <IconHeart
              size={20}
              className={favourite ? 'fill-accent-9 text-accent-9' : 'text-surface-fg-inverted'}
            />
          </Button>
        </div>
      </div>

      {/* Product details */}
      <div className="flex flex-col gap-ds-05">
        <header className="flex flex-col gap-ds-02">
          <Text variant="label-sm" className="text-surface-fg-subtle">
            Mira · The everyday kurta
          </Text>
          <Text variant="heading-xl" className="text-surface-fg">
            The Khadi shirt, in{' '}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeColour.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="inline-block"
              >
                {activeColour.name}
              </motion.span>
            </AnimatePresence>
            .
          </Text>
          <div className="flex items-center gap-ds-03 mt-ds-02">
            <Text variant="heading-md" className="text-surface-fg">
              ₹5,200
            </Text>
            <Text variant="body-sm" className="text-surface-fg-subtle line-through">
              ₹6,400
            </Text>
            <Badge color="success" size="sm">
              ₹1,200 off
            </Badge>
          </div>
        </header>

        <Text variant="body-sm" className="text-surface-fg-muted">
          Handwoven Khadi cotton, breathable for Indian summers. Mandarin collar, side-vent
          hemline. Washes softer with every wear.
        </Text>

        <div className="flex flex-col gap-ds-02">
          <Text variant="label-sm" className="text-surface-fg-muted">
            Colour · {activeColour.name}
          </Text>
          <div className="flex items-center gap-ds-02">
            {colours.map((c) => {
              const active = c.id === colour
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.name}
                  aria-pressed={active}
                  onClick={() => setColour(c.id)}
                  className="relative w-9 h-9 rounded-full border border-surface-border-subtle hover:scale-105 transition-transform duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
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
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-ds-02">
          <div className="flex items-center justify-between">
            <Text variant="label-sm" className="text-surface-fg-muted">
              Size · {size}
            </Text>
            <a
              href="#"
              className="text-ds-xs text-surface-fg-subtle underline underline-offset-2 hover:text-surface-fg"
            >
              Size guide
            </a>
          </div>
          <div className="relative flex items-center gap-ds-02">
            {sizes.map((s) => {
              const active = s === size
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className="relative min-w-10 h-10 px-ds-03 rounded-ds-md border border-surface-border-subtle text-ds-sm text-surface-fg-muted hover:border-surface-border transition-colors duration-fast-01 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-accent-9 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
                >
                  {active && (
                    <motion.span
                      layoutId="mira-size-pill"
                      className="absolute inset-0 -m-px rounded-ds-md border-2 border-accent-9 bg-accent-3"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <span className={active ? 'relative z-[1] text-accent-11' : 'relative z-[1]'}>{s}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-ds-02 mt-ds-02">
          <Button
            size="lg"
            startIcon={
              <span className="relative">
                <IconShoppingBag size={16} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                      className="absolute -top-2 -right-2 min-w-4 h-4 px-1 rounded-full bg-accent-fg text-accent-9 text-[10px] font-bold flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
            }
            fullWidth
            onClickAsync={addToBag}
          >
            Add to bag
          </Button>
          <Button size="lg" variant="soft">
            Buy now
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-ds-04 text-ds-xs text-surface-fg-muted pt-ds-03 border-t border-surface-border-subtle">
          <span className="inline-flex items-center gap-ds-02">
            <IconTruck size={12} /> Free shipping over ₹2,500
          </span>
          <span className="inline-flex items-center gap-ds-02">
            <IconStar size={12} /> 4.8 · 312 reviews
          </span>
        </div>
      </div>

      {/* Related */}
      <div className="lg:col-span-2 mt-ds-05">
        <Text variant="heading-md" className="text-surface-fg mb-ds-04">
          Worn together
        </Text>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-ds-04">
          {related.map((r) => (
            <Card key={r.name}>
              <CardHeader>
                <CardTitle className="text-[length:var(--typo-heading-sm-size)]">{r.name}</CardTitle>
                <CardDescription>{r.price}</CardDescription>
              </CardHeader>
              <CardContent>
                {r.tag && (
                  <Badge variant="soft" color="accent" size="sm">
                    {r.tag}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
