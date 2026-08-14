import { AST_NODE_TYPES } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'
import { findJSXAttribute, getJSXElementName } from '../util/jsx'

/**
 * `<Progress>` with no accessible name announces as just "progressbar, 72%" —
 * the value is already carried by `aria-valuenow`, so what's missing is WHAT
 * is progressing. The component itself only warns about this at runtime
 * (dev console); this rule catches it statically at lint time instead.
 *
 * Only targets the smart all-in-one `<Progress>` — `<Progress.Track>` and
 * other compound parts take `aria-label`/`aria-labelledby` directly and
 * aren't this rule's concern.
 */
type MessageIds = 'missingLabel'

const LABEL_ATTRS = ['label', 'aria-label', 'aria-labelledby']

export default createRule<[], MessageIds>({
  name: 'require-progress-label',
  meta: {
    type: 'problem',
    docs: {
      description:
        '<Progress> needs an accessible name via `label`, `aria-label`, or `aria-labelledby` — otherwise it announces as just "progressbar" with a percentage.',
      category: 'recommended',
      recommended: 'warn',
      appliesFrom: '0.4.0',
    },
    schema: [],
    messages: {
      missingLabel:
        '<Progress> has no accessible name. Pass `label`, `aria-label`, or `aria-labelledby` so screen readers announce what is progressing.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (getJSXElementName(node) !== 'Progress') return
        // A spread might carry the label at runtime — can't statically rule it out.
        const hasSpread = node.attributes.some(
          (attr) => attr.type === AST_NODE_TYPES.JSXSpreadAttribute,
        )
        if (hasSpread) return
        const hasLabel = LABEL_ATTRS.some((name) => findJSXAttribute(node, name) != null)
        if (!hasLabel) {
          context.report({ node, messageId: 'missingLabel' })
        }
      },
    }
  },
})
