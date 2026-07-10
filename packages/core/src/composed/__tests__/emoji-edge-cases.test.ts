import { describe, expect,it } from 'vitest'

import { type EmojiDataset, searchEmoji } from '../extensions/emoji-data'
import { EmojiNode } from '../extensions/emoji-node'

// EmojiNode is native-only since the frimousse migration — attrs are just
// { id, native } (no set / x / y spritesheet coordinates).

describe('EmojiNode edge cases', () => {
  describe('renderHTML', () => {
    const renderHTML = (attrs: Record<string, unknown>) => {
      // @ts-expect-error — testing with mock node
      return EmojiNode.config.renderHTML?.call(EmojiNode, { node: { attrs } })
    }

    it('handles compound emoji (ZWJ sequences like 👨‍👩‍👧‍👦)', () => {
      const result = renderHTML({ id: 'family_man_woman_girl_boy', native: '👨‍👩‍👧‍👦' })
      expect(result[1]['aria-label']).toBe('👨‍👩‍👧‍👦')
      expect(result[2]).toBe('👨‍👩‍👧‍👦')
    })

    it('handles flag emoji (regional indicators)', () => {
      const result = renderHTML({ id: 'flag-us', native: '🇺🇸' })
      expect(result[2]).toBe('🇺🇸')
      expect(result[1]['data-emoji-id']).toBe('flag-us')
    })

    it('handles emoji with skin tone modifiers', () => {
      const result = renderHTML({ id: 'thumbsup', native: '👍🏽' })
      expect(result[2]).toBe('👍🏽')
    })
  })

  describe('parseHTML round-trip', () => {
    it('survives renderHTML → parseHTML round-trip', () => {
      const original = { id: 'grinning', native: '😀' }
      // @ts-expect-error — testing with mock node
      const html = EmojiNode.config.renderHTML?.call(EmojiNode, { node: { attrs: original } })
      const rules = EmojiNode.config.parseHTML?.call(EmojiNode) ?? []
      const el = {
        getAttribute: (name: string) => (name === 'data-emoji-id' ? html[1]['data-emoji-id'] : null),
        textContent: html[2],
      }
      // @ts-expect-error — mock DOM
      const parsed = rules[0].getAttrs(el)
      expect(parsed).toEqual(original)
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

    it('returns empty string for missing native attr', () => {
      expect(renderText({})).toBe('')
    })
  })
})

// ── emoji-data search edge cases ────────────────────────────────

describe('searchEmoji edge cases', () => {
  const data: EmojiDataset = {
    emojis: {
      '+1': { id: '+1', name: 'Thumbs Up', keywords: ['thumbsup', 'yes', 'ok'], skins: [{ native: '👍' }] },
      '-1': { id: '-1', name: 'Thumbs Down', keywords: ['thumbsdown', 'no'], skins: [{ native: '👎' }] },
      '100': { id: '100', name: 'Hundred Points', keywords: ['score', 'perfect'], skins: [{ native: '💯' }] },
      smile: { id: 'smile', name: 'Smiling Face', skins: [{ native: '😄' }] },
      smiley: { id: 'smiley', name: 'Smiley Face', skins: [{ native: '😃' }] },
    },
  }

  it('handles numeric emoji IDs', () => {
    expect(searchEmoji(data, '100').some((r) => r.id === '100')).toBe(true)
  })

  it('handles special characters in emoji IDs', () => {
    expect(searchEmoji(data, '+1').some((r) => r.id === '+1')).toBe(true)
  })

  it('handles partial matches that overlap (smile vs smiley)', () => {
    const ids = searchEmoji(data, 'smile').map((r) => r.id)
    expect(ids).toContain('smile')
    expect(ids).toContain('smiley')
  })

  it('empty string query with limit=0 returns empty', () => {
    expect(searchEmoji(data, '', 0)).toHaveLength(0)
  })

  it('handles empty dataset', () => {
    const empty: EmojiDataset = { emojis: {} }
    expect(searchEmoji(empty, 'anything')).toHaveLength(0)
    expect(searchEmoji(empty, '')).toHaveLength(0)
  })
})
