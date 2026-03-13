import { describe, it, expect } from 'vitest'
import { springs, tweens, stagger, withReducedMotion } from '../motion'

describe('springs', () => {
  it('has snappy, smooth, bouncy, gentle keys', () => {
    expect(Object.keys(springs)).toEqual(['snappy', 'smooth', 'bouncy', 'gentle'])
  })

  it.each(['snappy', 'smooth', 'bouncy', 'gentle'] as const)(
    '%s has type: "spring"',
    (key) => {
      expect(springs[key]).toHaveProperty('type', 'spring')
    },
  )
})

describe('tweens', () => {
  it('has fade, colorShift keys', () => {
    expect(Object.keys(tweens)).toEqual(['fade', 'colorShift'])
  })

  it.each(['fade', 'colorShift'] as const)('%s has type: "tween"', (key) => {
    expect(tweens[key]).toHaveProperty('type', 'tween')
  })
})

describe('stagger()', () => {
  it('returns visible/hidden transitions with staggerChildren', () => {
    const result = stagger()
    expect(result.visible.transition).toHaveProperty('staggerChildren', 0.04)
    expect(result.hidden.transition).toHaveProperty('staggerChildren', 0.04)
  })

  it('accepts a custom delay', () => {
    const result = stagger(0.1)
    expect(result.visible.transition.staggerChildren).toBe(0.1)
    expect(result.hidden.transition.staggerChildren).toBe(0.1)
  })
})

describe('withReducedMotion()', () => {
  it('returns a transition with duration: 0', () => {
    const result = withReducedMotion(springs.smooth)
    expect(result).toHaveProperty('duration', 0)
  })

  it('preserves original transition properties', () => {
    const result = withReducedMotion(springs.smooth)
    expect(result).toHaveProperty('type', 'spring')
  })
})
