import { Node } from '@tiptap/core'
import { type NodeViewProps,NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

import { SHEET_COLS, SHEET_ROWS,SPRITESHEET_URL } from './emoji-data'

export interface EmojiNodeAttrs {
  id: string
  native: string
  set: string
  x: number
  y: number
}

function EmojiNodeView({ node }: NodeViewProps) {
  const { native, set, x, y } = node.attrs as EmojiNodeAttrs

  if (set === 'native') {
    return (
      <NodeViewWrapper as="span" className="inline">
        <span>{native}</span>
      </NodeViewWrapper>
    )
  }

  const bgSize = `${100 * SHEET_COLS}% ${100 * SHEET_ROWS}%`
  const bgPos = `${(100 / (SHEET_COLS - 1)) * x}% ${(100 / (SHEET_ROWS - 1)) * y}%`

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        role="img"
        aria-label={native}
        className="inline-block h-[1.2em] w-[1.2em] align-text-bottom"
        style={{
          backgroundImage: `url(${SPRITESHEET_URL(set)})`,
          backgroundSize: bgSize,
          backgroundPosition: bgPos,
        }}
      />
    </NodeViewWrapper>
  )
}

export const EmojiNode = Node.create({
  name: 'emojiNode',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: false,

  addAttributes() {
    return {
      id: { default: null },
      native: { default: null },
      set: { default: 'native' },
      x: { default: 0 },
      y: { default: 0 },
    }
  },

  renderText({ node }) {
    return node.attrs.native ?? ''
  },

  parseHTML() {
    return [{
      tag: 'span[data-emoji-id]',
      getAttrs: (el) => {
        const dom = el as HTMLElement
        return {
          id: dom.getAttribute('data-emoji-id'),
          set: dom.getAttribute('data-emoji-set') ?? 'native',
          x: parseInt(dom.getAttribute('data-emoji-x') ?? '0', 10),
          y: parseInt(dom.getAttribute('data-emoji-y') ?? '0', 10),
          native: dom.textContent ?? '',
        }
      },
    }]
  },

  renderHTML({ node }) {
    return ['span', {
      'data-emoji-id': node.attrs.id,
      'data-emoji-set': node.attrs.set,
      'data-emoji-x': node.attrs.x,
      'data-emoji-y': node.attrs.y,
      'role': 'img',
      'aria-label': node.attrs.native,
    }, node.attrs.native ?? '']
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmojiNodeView)
  },
})
