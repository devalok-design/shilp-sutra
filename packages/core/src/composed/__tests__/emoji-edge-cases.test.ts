import { describe, expect,it } from 'vitest'

import { type EmojiDataset,lookupEmoji, searchEmoji, SHEET_COLS, SHEET_ROWS, SPRITESHEET_URL } from '../extensions/emoji-data'
import { EmojiNode } from '../extensions/emoji-node'

// ── EmojiNode edge cases ──────────────────────────────────────────

describe('EmojiNode edge cases', () => {
  describe('renderHTML', () => {
    const renderHTML = (attrs: Record<string, unknown>) => {
      // @ts-expect-error — testing with mock node
      return EmojiNode.config.renderHTML?.call(EmojiNode, { node: { attrs } })
    }

    it('handles compound emoji (ZWJ sequences like 👨‍👩‍👧‍👦)', () => {
      const result = renderHTML({ id: 'family_man_woman_girl_boy', native: '👨‍👩‍👧‍👦', set: 'apple', x: 5, y: 3 })
      expect(result[1]['aria-label']).toBe('👨‍👩‍👧‍👦')
      expect(result[2]).toBe('👨‍👩‍👧‍👦')
    })

    it('handles flag emoji (regional indicators)', () => {
      const result = renderHTML({ id: 'flag-us', native: '🇺🇸', set: 'twitter', x: 1, y: 2 })
      expect(result[2]).toBe('🇺🇸')
      expect(result[1]['data-emoji-set']).toBe('twitter')
    })

    it('handles emoji with skin tone modifiers', () => {
      const result = renderHTML({ id: 'thumbsup', native: '👍🏽', set: 'google', x: 10, y: 20 })
      expect(result[2]).toBe('👍🏽')
    })

    it('preserves x=0 y=0 (valid position for # keycap emoji)', () => {
      const result = renderHTML({ id: 'hash', native: '#️⃣', set: 'apple', x: 0, y: 0 })
      expect(result[1]['data-emoji-x']).toBe(0)
      expect(result[1]['data-emoji-y']).toBe(0)
    })

    it('handles very large x/y coordinates', () => {
      const result = renderHTML({ id: 'test', native: '🧪', set: 'apple', x: 60, y: 60 })
      expect(result[1]['data-emoji-x']).toBe(60)
      expect(result[1]['data-emoji-y']).toBe(60)
    })
  })

  describe('parseHTML round-trip', () => {
    it('survives renderHTML → parseHTML round-trip', () => {
      const original = { id: 'grinning', native: '😀', set: 'apple', x: 32, y: 21 }
      // @ts-expect-error — testing with mock node
      const html = EmojiNode.config.renderHTML?.call(EmojiNode, { node: { attrs: original } })
      const rules = EmojiNode.config.parseHTML?.call(EmojiNode) ?? []
      const getAttrs = rules[0].getAttrs

      // Simulate DOM element from rendered HTML
      const el = {
        getAttribute: (name: string) => {
          const map: Record<string, string> = {
            'data-emoji-id': html[1]['data-emoji-id'],
            'data-emoji-set': html[1]['data-emoji-set'],
            'data-emoji-x': String(html[1]['data-emoji-x']),
            'data-emoji-y': String(html[1]['data-emoji-y']),
          }
          return map[name] ?? null
        },
        textContent: html[2],
      }

      // @ts-expect-error — mock DOM
      const parsed = getAttrs(el)
      expect(parsed).toEqual(original)
    })

    it('round-trips native set correctly', () => {
      const original = { id: 'heart', native: '❤️', set: 'native', x: 0, y: 0 }
      // @ts-expect-error — testing with mock node
      const html = EmojiNode.config.renderHTML?.call(EmojiNode, { node: { attrs: original } })
      const rules = EmojiNode.config.parseHTML?.call(EmojiNode) ?? []

      const el = {
        getAttribute: (name: string) => {
          const map: Record<string, string> = {
            'data-emoji-id': 'heart',
            'data-emoji-set': 'native',
            'data-emoji-x': '0',
            'data-emoji-y': '0',
          }
          return map[name] ?? null
        },
        textContent: html[2],
      }

      // @ts-expect-error — mock DOM
      const parsed = rules[0].getAttrs(el)
      expect(parsed.set).toBe('native')
      expect(parsed.native).toBe('❤️')
    })
  })

  describe('renderText', () => {
    const renderText = (attrs: Record<string, unknown>) => {
      // @ts-expect-error — testing with mock node
      return EmojiNode.config.renderText?.call(EmojiNode, { node: { attrs } })
    }

    it('returns ZWJ family emoji correctly for getText()', () => {
      expect(renderText({ native: '👨‍👩‍👧‍👦' })).toBe('👨‍👩‍👧‍👦')
    })

    it('returns undefined/empty for completely missing attrs', () => {
      expect(renderText({})).toBe('')
    })
  })
})

// ── Spritesheet math edge cases ──────────────────────────────────

describe('spritesheet positioning edge cases', () => {
  it('position at (0,0) produces 0% 0%', () => {
    const bgPos = `${(100 / (SHEET_COLS - 1)) * 0}% ${(100 / (SHEET_ROWS - 1)) * 0}%`
    expect(bgPos).toBe('0% 0%')
  })

  it('position at max (60,60) produces 100% 100%', () => {
    const bgPos = `${(100 / (SHEET_COLS - 1)) * 60}% ${(100 / (SHEET_ROWS - 1)) * 60}%`
    expect(bgPos).toBe('100% 100%')
  })

  it('position at middle produces ~50%', () => {
    const x = 30
    const pct = (100 / (SHEET_COLS - 1)) * x
    expect(pct).toBeCloseTo(50, 0)
  })

  it('SPRITESHEET_URL never produces native URL (native set uses text rendering)', () => {
    // This should never be called with 'native', but if it were, it'd produce a bogus URL.
    // The EmojiNodeView guards against this with `if (set === 'native')` branch.
    const url = SPRITESHEET_URL('native')
    expect(url).toContain('emoji-datasource-native')
    // This URL would 404 — which is fine because we never use it.
  })
})

// ── emoji-data search edge cases ────────────────────────────────

describe('searchEmoji edge cases', () => {
  const data: EmojiDataset = {
    emojis: {
      '+1': { id: '+1', name: 'Thumbs Up', keywords: ['thumbsup', 'yes', 'ok'], skins: [{ unified: '1f44d', native: '👍', x: 1, y: 2 }] },
      '-1': { id: '-1', name: 'Thumbs Down', keywords: ['thumbsdown', 'no'], skins: [{ unified: '1f44e', native: '👎', x: 3, y: 4 }] },
      '100': { id: '100', name: 'Hundred Points', keywords: ['score', 'perfect'], skins: [{ unified: '1f4af', native: '💯', x: 5, y: 6 }] },
      smile: { id: 'smile', name: 'Smiling Face', skins: [{ unified: '1f604', native: '😄', x: 7, y: 8 }] },
      smiley: { id: 'smiley', name: 'Smiley Face', skins: [{ unified: '1f603', native: '😃', x: 9, y: 10 }] },
    },
  }

  it('handles numeric emoji IDs', () => {
    const results = searchEmoji(data, '100')
    expect(results.some((r) => r.id === '100')).toBe(true)
  })

  it('handles special characters in emoji IDs', () => {
    const results = searchEmoji(data, '+1')
    expect(results.some((r) => r.id === '+1')).toBe(true)
  })

  it('handles partial matches that overlap (smile vs smiley)', () => {
    const results = searchEmoji(data, 'smile')
    expect(results.length).toBeGreaterThanOrEqual(2)
    const ids = results.map((r) => r.id)
    expect(ids).toContain('smile')
    expect(ids).toContain('smiley')
  })

  it('empty string query with limit=0 returns empty', () => {
    const results = searchEmoji(data, '', 0)
    expect(results).toHaveLength(0)
  })

  it('handles empty dataset', () => {
    const empty: EmojiDataset = { emojis: {} }
    expect(searchEmoji(empty, 'anything')).toHaveLength(0)
    expect(searchEmoji(empty, '')).toHaveLength(0)
  })
})

// ── lookupEmoji edge cases ──────────────────────────────────────

describe('lookupEmoji edge cases', () => {
  it('returns first skin when multiple exist', () => {
    const data: EmojiDataset = {
      emojis: {
        wave: {
          id: 'wave',
          name: 'Waving Hand',
          skins: [
            { unified: '1f44b', native: '👋', x: 1, y: 1 },
            { unified: '1f44b-1f3fb', native: '👋🏻', x: 2, y: 2 },
          ],
        },
      },
    }
    const result = lookupEmoji(data, 'wave')
    expect(result?.native).toBe('👋')
    expect(result?.x).toBe(1)
  })

  it('handles emoji where skins have no x/y (native set data)', () => {
    const data: EmojiDataset = {
      emojis: {
        grin: {
          id: 'grin',
          name: 'Grinning Face',
          skins: [{ unified: '1f600', native: '😀' }],
        },
      },
    }
    const result = lookupEmoji(data, 'grin')
    expect(result?.x).toBe(0)
    expect(result?.y).toBe(0)
  })
})
