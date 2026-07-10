import { describe, expect,it } from 'vitest'

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

  it('defines native-only attributes (id, native) — no set/x/y since the frimousse migration', () => {
    const attrs = ext.config.addAttributes?.call(ext) ?? {}
    expect(attrs).toHaveProperty('id')
    expect(attrs).toHaveProperty('native')
    expect(attrs).not.toHaveProperty('set')
    expect(attrs).not.toHaveProperty('x')
    expect(attrs).not.toHaveProperty('y')
    expect(attrs.id.default).toBe(null)
    expect(attrs.native.default).toBe(null)
  })

  it('renderText returns native character', () => {
    const node = { attrs: { native: '😀', id: 'grinning' } }
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
    const node = { attrs: { id: 'grinning', native: '😀' } }
    // @ts-expect-error — testing internal method with mock node
    const result = ext.config.renderHTML?.call(ext, { node, HTMLAttributes: {} })
    expect(result).toEqual([
      'span',
      {
        'data-emoji-id': 'grinning',
        'role': 'img',
        'aria-label': '😀',
      },
      '😀',
    ])
  })

  it('renderHTML handles null native gracefully', () => {
    const node = { attrs: { id: 'test', native: null } }
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
      getAttribute: (name: string) => (name === 'data-emoji-id' ? 'grinning' : null),
      textContent: '😀',
    }

    // @ts-expect-error — mock DOM element
    const attrs = getAttrs(el)
    expect(attrs).toEqual({
      id: 'grinning',
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
      native: '',
    })
  })
})
