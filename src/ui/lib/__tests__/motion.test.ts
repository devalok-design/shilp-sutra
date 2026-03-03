import { describe, it, expect } from 'vitest'
import { motion, duration, easings, durations } from '../motion'

describe('motion()', () => {
  it('returns productive-standard easing', () => {
    expect(motion('standard', 'productive')).toBe('cubic-bezier(0.2, 0, 0.38, 0.9)')
  })

  it('returns expressive-entrance easing', () => {
    expect(motion('entrance', 'expressive')).toBe('cubic-bezier(0, 0, 0.3, 1)')
  })

  it('returns expressive-exit easing', () => {
    expect(motion('exit', 'expressive')).toBe('cubic-bezier(0.4, 0.14, 1, 1)')
  })
})

describe('duration()', () => {
  it('returns fast-01 value', () => {
    expect(duration('fast-01')).toBe('70ms')
  })

  it('returns slow-02 value', () => {
    expect(duration('slow-02')).toBe('700ms')
  })

  it('returns instant value', () => {
    expect(duration('instant')).toBe('0ms')
  })
})

describe('easings', () => {
  it('exposes all 6 mode curves', () => {
    expect(Object.keys(easings.productive)).toEqual(['standard', 'entrance', 'exit'])
    expect(Object.keys(easings.expressive)).toEqual(['standard', 'entrance', 'exit'])
  })
})

describe('durations', () => {
  it('exposes all 7 duration values', () => {
    expect(Object.keys(durations)).toEqual([
      'instant', 'fast-01', 'fast-02', 'moderate-01', 'moderate-02', 'slow-01', 'slow-02',
    ])
  })
})
