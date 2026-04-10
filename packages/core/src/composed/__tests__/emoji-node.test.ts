import { describe, it, expect } from 'vitest'
import { EmojiNode } from '../extensions/emoji-node'

describe('EmojiNode', () => {
  const ext = EmojiNode

  it('has correct name', () => {
    expect(ext.name).toBe('emojiNode')
  })

  it('is inline and atom', () => {
    const config = ext.config
    expect(config.inline).toBe(true)
    expect(config.atom).toBe(true)
    expect(config.group).toBe('inline')
    expect(config.selectable).toBe(false)
  })

  it('defines all required attributes with defaults', () => {
    const attrs = ext.config.addAttributes?.call(ext) ?? {}
    expect(attrs).toHaveProperty('id')
    expect(attrs).toHaveProperty('native')
    expect(attrs).toHaveProperty('set')
    expect(attrs).toHaveProperty('x')
    expect(attrs).toHaveProperty('y')
    expect(attrs.set.default).toBe('native')
    expect(attrs.x.default).toBe(0)
    expect(attrs.y.default).toBe(0)
  })

  it('renderText returns native character', () => {
    const node = { attrs: { native: '😀', id: 'grinning', set: 'apple', x: 32, y: 21 } }
    // @ts-expect-error — testing internal method with mock node
    const text = ext.config.renderText?.call(ext, { node })
    expect(text).toBe('😀')
  })

  it('renderText returns empty string when native is null', () => {
    const node = { attrs: { native: null } }
    // @ts-expect-error — testing internal method with mock node
    const text = ext.config.renderText?.call(ext, { node })
    expect(text).toBe('')
  })

  it('renderHTML produces correct data attributes', () => {
    const node = { attrs: { id: 'grinning', native: '😀', set: 'apple', x: 32, y: 21 } }
    // @ts-expect-error — testing internal method with mock node
    const result = ext.config.renderHTML?.call(ext, { node, HTMLAttributes: {} })
    expect(result).toEqual([
      'span',
      {
        'data-emoji-id': 'grinning',
        'data-emoji-set': 'apple',
        'data-emoji-x': 32,
        'data-emoji-y': 21,
        'role': 'img',
        'aria-label': '😀',
      },
      '😀',
    ])
  })

  it('renderHTML handles null native gracefully', () => {
    const node = { attrs: { id: 'test', native: null, set: 'native', x: 0, y: 0 } }
    // @ts-expect-error — testing internal method with mock node
    const result = ext.config.renderHTML?.call(ext, { node, HTMLAttributes: {} })
    expect(result[2]).toBe('')
  })

  it('parseHTML matches span[data-emoji-id]', () => {
    const rules = ext.config.parseHTML?.call(ext) ?? []
    expect(rules).toHaveLength(1)
    expect(rules[0].tag).toBe('span[data-emoji-id]')
  })

  it('parseHTML getAttrs extracts all attributes from DOM element', () => {
    const rules = ext.config.parseHTML?.call(ext) ?? []
    const getAttrs = rules[0].getAttrs

    // Mock a DOM element
    const el = {
      getAttribute: (name: string) => {
        const map: Record<string, string> = {
          'data-emoji-id': 'grinning',
          'data-emoji-set': 'apple',
          'data-emoji-x': '32',
          'data-emoji-y': '21',
        }
        return map[name] ?? null
      },
      textContent: '😀',
    }

    // @ts-expect-error — mock DOM element
    const attrs = getAttrs(el)
    expect(attrs).toEqual({
      id: 'grinning',
      set: 'apple',
      x: 32,
      y: 21,
      native: '😀',
    })
  })

  it('parseHTML getAttrs handles missing attributes with defaults', () => {
    const rules = ext.config.parseHTML?.call(ext) ?? []
    const getAttrs = rules[0].getAttrs

    const el = {
      getAttribute: () => null,
      textContent: '',
    }

    // @ts-expect-error — mock DOM element
    const attrs = getAttrs(el)
    expect(attrs).toEqual({
      id: null,
      set: 'native',
      x: 0,
      y: 0,
      native: '',
    })
  })
})
