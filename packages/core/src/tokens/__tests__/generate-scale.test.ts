import { describe, it, expect } from 'vitest'
import { generateScale, BRAND_PALETTES } from '../generate-scale'
import type { ScaleOptions, Scale } from '../generate-scale'

/** Parse an oklch() string into { l, c, h } */
function parseOklch(value: string) {
  const match = value.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/)
  if (!match) throw new Error(`Invalid oklch value: ${value}`)
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
  }
}

describe('generateScale', () => {
  const pinkScale = generateScale({ hue: 360, peakChroma: 0.19 })
  const neutralScale = generateScale({
    hue: 350,
    peakChroma: 0.01,
    isNeutral: true,
  })

  describe('structure', () => {
    it('produces 12 light steps', () => {
      expect(pinkScale.light).toHaveLength(12)
    })

    it('produces 12 dark steps', () => {
      expect(pinkScale.dark).toHaveLength(12)
    })

    it('steps are 1-indexed (step property)', () => {
      expect(pinkScale.light[0].step).toBe(1)
      expect(pinkScale.light[11].step).toBe(12)
      expect(pinkScale.dark[0].step).toBe(1)
      expect(pinkScale.dark[11].step).toBe(12)
    })
  })

  describe('oklch format', () => {
    it('each light step is valid oklch() format', () => {
      for (const step of pinkScale.light) {
        expect(step.value).toMatch(/^oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)$/)
      }
    })

    it('each dark step is valid oklch() format', () => {
      for (const step of pinkScale.dark) {
        expect(step.value).toMatch(/^oklch\([\d.]+\s+[\d.]+\s+[\d.]+\)$/)
      }
    })
  })

  describe('lightness', () => {
    it('light mode L descends from step 1 to step 12', () => {
      for (let i = 0; i < 11; i++) {
        const current = parseOklch(pinkScale.light[i].value).l
        const next = parseOklch(pinkScale.light[i + 1].value).l
        expect(current).toBeGreaterThan(next)
      }
    })

    it('dark mode L generally ascends from step 1 to step 12', () => {
      // Step 10 (solid hover) dips below step 9 by design, so we check
      // overall trend: step 1 is lowest, step 12 is highest
      const first = parseOklch(pinkScale.dark[0].value).l
      const last = parseOklch(pinkScale.dark[11].value).l
      expect(first).toBeLessThan(last)

      // Steps 1-9 should ascend
      for (let i = 0; i < 8; i++) {
        const current = parseOklch(pinkScale.dark[i].value).l
        const next = parseOklch(pinkScale.dark[i + 1].value).l
        expect(current).toBeLessThan(next)
      }

      // Step 10 dips (hover state), then 11-12 continue ascending
      const step11 = parseOklch(pinkScale.dark[10].value).l
      const step12 = parseOklch(pinkScale.dark[11].value).l
      expect(step11).toBeLessThan(step12)
    })

    it('light step 1 has L=0.99', () => {
      expect(parseOklch(pinkScale.light[0].value).l).toBeCloseTo(0.99, 2)
    })

    it('light step 12 has L=0.32', () => {
      expect(parseOklch(pinkScale.light[11].value).l).toBeCloseTo(0.32, 2)
    })

    it('dark step 1 has L=0.14', () => {
      expect(parseOklch(pinkScale.dark[0].value).l).toBeCloseTo(0.14, 2)
    })

    it('dark step 12 has L=0.88', () => {
      expect(parseOklch(pinkScale.dark[11].value).l).toBeCloseTo(0.88, 2)
    })
  })

  describe('chroma', () => {
    it('light step 9 has peak chroma', () => {
      const step9Chroma = parseOklch(pinkScale.light[8].value).c
      for (let i = 0; i < 12; i++) {
        if (i === 8) continue
        const otherChroma = parseOklch(pinkScale.light[i].value).c
        expect(step9Chroma).toBeGreaterThanOrEqual(otherChroma)
      }
    })

    it('light step 9 chroma equals peakChroma', () => {
      const step9Chroma = parseOklch(pinkScale.light[8].value).c
      expect(step9Chroma).toBeCloseTo(0.19, 3)
    })

    it('dark step 9 has boosted chroma (1.1x peak)', () => {
      const darkStep9Chroma = parseOklch(pinkScale.dark[8].value).c
      expect(darkStep9Chroma).toBeCloseTo(0.19 * 1.1, 2)
    })

    it('chroma reduces at extremes (steps 1-2 lower than step 9)', () => {
      const step9Chroma = parseOklch(pinkScale.light[8].value).c
      const step1Chroma = parseOklch(pinkScale.light[0].value).c
      const step2Chroma = parseOklch(pinkScale.light[1].value).c
      expect(step1Chroma).toBeLessThan(step9Chroma)
      expect(step2Chroma).toBeLessThan(step9Chroma)
    })

    it('chroma reduces at high extremes (steps 11-12 lower than step 9)', () => {
      const step9Chroma = parseOklch(pinkScale.light[8].value).c
      const step11Chroma = parseOklch(pinkScale.light[10].value).c
      const step12Chroma = parseOklch(pinkScale.light[11].value).c
      expect(step11Chroma).toBeLessThan(step9Chroma)
      expect(step12Chroma).toBeLessThan(step9Chroma)
    })
  })

  describe('hue', () => {
    it('all steps share the same hue', () => {
      for (const step of [...pinkScale.light, ...pinkScale.dark]) {
        expect(parseOklch(step.value).h).toBe(360)
      }
    })
  })

  describe('neutral scale', () => {
    it('keeps chroma low across all steps', () => {
      for (const step of [...neutralScale.light, ...neutralScale.dark]) {
        const { c } = parseOklch(step.value)
        expect(c).toBeLessThanOrEqual(0.015)
      }
    })

    it('step 9 chroma is the peakChroma value (0.01)', () => {
      const step9Chroma = parseOklch(neutralScale.light[8].value).c
      expect(step9Chroma).toBeCloseTo(0.01, 3)
    })
  })

  describe('reference preview values (pink light)', () => {
    // Validate against the approved token-preview.html
    const expectedPinkLight = [
      { step: 1, l: 0.99, c: 0.005 },
      { step: 2, l: 0.97, c: 0.015 },
      { step: 3, l: 0.93, c: 0.035 },
      { step: 4, l: 0.89, c: 0.055 },
      { step: 5, l: 0.84, c: 0.08 },
      { step: 6, l: 0.78, c: 0.10 },
      { step: 7, l: 0.70, c: 0.14 },
      { step: 8, l: 0.62, c: 0.17 },
      { step: 9, l: 0.55, c: 0.19 },
      { step: 10, l: 0.50, c: 0.19 },
      { step: 11, l: 0.43, c: 0.14 },
      { step: 12, l: 0.32, c: 0.08 },
    ]

    it.each(expectedPinkLight)(
      'light step $step matches preview (L=$l, C=$c)',
      ({ step, l, c }) => {
        const parsed = parseOklch(pinkScale.light[step - 1].value)
        expect(parsed.l).toBeCloseTo(l, 2)
        expect(parsed.c).toBeCloseTo(c, 2)
      }
    )
  })

  describe('reference preview values (pink dark)', () => {
    const expectedPinkDark = [
      { step: 1, l: 0.14, c: 0.005 },
      { step: 2, l: 0.17, c: 0.015 },
      { step: 3, l: 0.21, c: 0.04 },
      { step: 4, l: 0.25, c: 0.06 },
      { step: 5, l: 0.30, c: 0.08 },
      { step: 6, l: 0.36, c: 0.10 },
      { step: 7, l: 0.44, c: 0.13 },
      { step: 8, l: 0.53, c: 0.18 },
      { step: 9, l: 0.63, c: 0.21 },
      { step: 10, l: 0.58, c: 0.21 },
      { step: 11, l: 0.76, c: 0.13 },
      { step: 12, l: 0.88, c: 0.05 },
    ]

    it.each(expectedPinkDark)(
      'dark step $step matches preview (L=$l, C=$c)',
      ({ step, l, c }) => {
        const parsed = parseOklch(pinkScale.dark[step - 1].value)
        expect(parsed.l).toBeCloseTo(l, 2)
        expect(parsed.c).toBeCloseTo(c, 2)
      }
    )
  })
})

describe('BRAND_PALETTES', () => {
  it('has all 14 entries', () => {
    expect(Object.keys(BRAND_PALETTES)).toHaveLength(14)
  })

  const expectedNames = [
    'pink',
    'purple',
    'neutral',
    'red',
    'green',
    'yellow',
    'blue',
    'teal',
    'amber',
    'slate',
    'indigo',
    'cyan',
    'orange',
    'emerald',
  ]

  it.each(expectedNames)('includes %s palette', (name) => {
    expect(BRAND_PALETTES).toHaveProperty(name)
  })

  it('pink has correct config', () => {
    expect(BRAND_PALETTES.pink).toEqual({ hue: 360, peakChroma: 0.19 })
  })

  it('neutral is flagged as isNeutral', () => {
    expect(BRAND_PALETTES.neutral.isNeutral).toBe(true)
  })

  it('each palette generates a valid scale', () => {
    for (const [name, config] of Object.entries(BRAND_PALETTES)) {
      const scale = generateScale(config)
      expect(scale.light, `${name} light`).toHaveLength(12)
      expect(scale.dark, `${name} dark`).toHaveLength(12)
    }
  })
})
