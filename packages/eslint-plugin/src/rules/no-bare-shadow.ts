import { findJSXAttribute, getJSXElementName } from '../util/jsx'
import { getLiteralClassNameNode, tokenizeClassName } from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * TW4 has no `--shadow-DEFAULT`. Bare `shadow` class silently renders no
 * shadow. Use `shadow-raised`, `shadow-overlay`, `shadow-floating`, etc.
 *
 * Warn-only (no autofix) — the consumer must choose the intent:
 *   - card-on-page surface → `shadow-raised`
 *   - dropdown / popover  → `shadow-floating`
 *   - dialog / modal      → `shadow-overlay`
 */
type MessageIds = 'bareShadow'

const STATE_MODIFIER = /^((?:hover|focus|active|disabled|group-hover|dark):)+/

export default createRule<[], MessageIds>({
  name: 'no-bare-shadow',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Bare `shadow` class renders no shadow in TW4. Use `shadow-raised`, `shadow-floating`, `shadow-overlay`, etc.',
      category: 'recommended',
      recommended: 'warn',
      appliesFrom: '0.37.0',
    },
    schema: [],
    messages: {
      bareShadow:
        'Bare `shadow` renders no shadow in TW4. Pick an explicit name: `shadow-raised` (cards/panels), `shadow-floating` (dropdowns/popovers), `shadow-overlay` (dialogs/sheets), or `shadow-ring` (focus ring).',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = getJSXElementName(node)
        if (!name) return
        const className = findJSXAttribute(node, 'className')
        if (!className) return
        const literal = getLiteralClassNameNode(className)
        if (!literal || typeof literal.value !== 'string') return

        const tokenized = tokenizeClassName(literal.value)
        for (const token of tokenized.tokens) {
          const stripped = token.replace(STATE_MODIFIER, '')
          if (stripped === 'shadow') {
            context.report({ node: literal, messageId: 'bareShadow' })
            return
          }
        }
      },
    }
  },
})
