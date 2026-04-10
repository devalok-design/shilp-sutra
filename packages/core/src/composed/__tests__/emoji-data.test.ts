import { describe, it, expect } from 'vitest'
import { lookupEmoji, searchEmoji, SPRITESHEET_URL, SHEET_COLS, SHEET_ROWS, type EmojiDataset } from '../extensions/emoji-data'

// Minimal mock dataset
const mockData: EmojiDataset = {
  emojis: {
    grinning: {
      id: 'grinning',
      name: 'Grinning Face',
      keywords: ['smile', 'happy'],
      skins: [{ unified: '1f600', native: '😀', x: 32, y: 21 }],
    },
    heart: {
      id: 'heart',
      name: 'Red Heart',
      keywords: ['love'],
      skins: [{ unified: '2764', native: '❤️', x: 54, y: 16 }],
    },
    thumbsup: {
      id: 'thumbsup',
      name: 'Thumbs Up',
      keywords: ['like', 'approve', 'ok'],
      skins: [{ unified: '1f44d', native: '👍', x: 16, y: 10 }],
    },
    'no-skin': {
      id: 'no-skin',
      name: 'No Skin Emoji',
      skins: [],
    },
  },
  sheet: { cols: 61, rows: 61 },
}

describe('lookupEmoji', () => {
  it('finds emoji by id', () => {
    const result = lookupEmoji(mockData, 'grinning')
    expect(result).toEqual({
      id: 'grinning',
      name: 'Grinning Face',
      native: '😀',
      x: 32,
      y: 21,
    })
  })

  it('returns null for unknown id', () => {
    expect(lookupEmoji(mockData, 'nonexistent')).toBeNull()
  })

  it('returns null for emoji with no skins', () => {
    expect(lookupEmoji(mockData, 'no-skin')).toBeNull()
  })
})

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
    const results = searchEmoji(mockData, '', 1)
    expect(results).toHaveLength(1)
  })

  it('returns empty array when nothing matches', () => {
    const results = searchEmoji(mockData, 'zzzznotreal')
    expect(results).toHaveLength(0)
  })

  it('handles emoji with missing x/y (defaults to 0)', () => {
    const dataWithNoCoords: EmojiDataset = {
      emojis: {
        test: {
          id: 'test',
          name: 'Test',
          skins: [{ unified: '1234', native: '🧪' }],
        },
      },
    }
    const results = searchEmoji(dataWithNoCoords, 'test')
    expect(results[0].x).toBe(0)
    expect(results[0].y).toBe(0)
  })

  it('handles emoji with no skins gracefully in results', () => {
    const results = searchEmoji(mockData, 'no-skin')
    expect(results).toHaveLength(1)
    expect(results[0].native).toBe('')
    expect(results[0].x).toBe(0)
    expect(results[0].y).toBe(0)
  })
})

describe('spritesheet constants', () => {
  it('SPRITESHEET_URL generates correct CDN URL for each set', () => {
    expect(SPRITESHEET_URL('apple')).toBe(
      'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.0.1/img/apple/sheets-256/64.png',
    )
    expect(SPRITESHEET_URL('google')).toBe(
      'https://cdn.jsdelivr.net/npm/emoji-datasource-google@15.0.1/img/google/sheets-256/64.png',
    )
    expect(SPRITESHEET_URL('twitter')).toBe(
      'https://cdn.jsdelivr.net/npm/emoji-datasource-twitter@15.0.1/img/twitter/sheets-256/64.png',
    )
  })

  it('sheet dimensions match emoji-mart v15', () => {
    expect(SHEET_COLS).toBe(61)
    expect(SHEET_ROWS).toBe(61)
  })
})
