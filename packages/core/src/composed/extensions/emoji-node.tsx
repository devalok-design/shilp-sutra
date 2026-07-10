import { Node } from '@tiptap/core'
import { type NodeViewProps,NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react'

// Native-only since the frimousse migration — renders the native emoji
// character. (The emoji-mart spritesheet/art-style rendering was removed.)
export interface EmojiNodeAttrs {
  id: string
  native: string
}

function EmojiNodeView({ node }: NodeViewProps) {
  const { native } = node.attrs as EmojiNodeAttrs
  return (
    <NodeViewWrapper as="span" className="inline">
      <span>{native}</span>
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
          native: dom.textContent ?? '',
        }
      },
    }]
  },

  renderHTML({ node }) {
    return ['span', {
      'data-emoji-id': node.attrs.id,
      'role': 'img',
      'aria-label': node.attrs.native,
    }, node.attrs.native ?? '']
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmojiNodeView)
  },
})
