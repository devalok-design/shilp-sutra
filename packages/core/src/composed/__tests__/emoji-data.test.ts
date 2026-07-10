import { describe, expect,it } from 'vitest'

import { type EmojiDataset, searchEmoji } from '../extensions/emoji-data'

// Minimal mock dataset (native-only since the frimousse migration — no x/y sprites).
const mockData: EmojiDataset = {
  emojis: {
    grinning: { id: 'grinning', name: 'Grinning Face', keywords: ['smile', 'happy'], skins: [{ native: '😀' }] },
    heart: { id: 'heart', name: 'Red Heart', keywords: ['love'], skins: [{ native: '❤️' }] },
    thumbsup: { id: 'thumbsup', name: 'Thumbs Up', keywords: ['like', 'approve', 'ok'], skins: [{ native: '👍' }] },
    'no-skin': { id: 'no-skin', name: 'No Skin Emoji', skins: [] },
  },
}

describe('searchEmoji', () => {
  it('returns first N emojis when query is empty', () => {
    const results = searchEmoji(mockData, '', 2)
    expect(results).toHaveLength(2)
    expect(results[0].id).toBe('grinning')
    expect(results[1].id).toBe('heart')
  })

  it('searches by id', () => {
    const results = searchEmoji(mockData, 'grin')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('grinning')
  })

  it('searches by name (case-insensitive)', () => {
    const results = searchEmoji(mockData, 'Red Heart')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('heart')
  })

  it('searches by keyword', () => {
    const results = searchEmoji(mockData, 'approve')
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('thumbsup')
  })

  it('respects limit', () => {
    expect(searchEmoji(mockData, '', 1)).toHaveLength(1)
  })

  it('returns empty array when nothing matches', () => {
    expect(searchEmoji(mockData, 'zzzznotreal')).toHaveLength(0)
  })

  it('resolves native char; empty string when no skins', () => {
    expect(searchEmoji(mockData, 'grin')[0].native).toBe('😀')
    const noSkin = searchEmoji(mockData, 'no-skin')
    expect(noSkin).toHaveLength(1)
    expect(noSkin[0].native).toBe('')
  })
})
