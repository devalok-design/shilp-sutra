import { findJSXAttribute, getJSXAttributeValueNode, getJSXElementName, getJSXStringAttributeValue } from '../util/jsx'
import { createRule } from '../util/create-rule'

const COMPONENTS = new Set(['Button', 'SplitButton', 'ButtonGroup', 'IconButton'])

/**
 * v0.32.0 removed these Button variants/colors:
 *   variant="default"     → variant="solid"
 *   variant="destructive" → variant="solid" color="error"
 *   color="default"       → color="accent"
 */
type MessageIds =
  | 'deprecatedVariantDefault'
  | 'deprecatedVariantDestructive'
  | 'deprecatedColorDefault'

export default createRule<[], MessageIds>({
  name: 'no-deprecated-button-variant',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Replace removed Button variant/color values (default, destructive) with their current equivalents.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.32.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      deprecatedVariantDefault:
        '`variant="default"` was removed in 0.32.0. Use `variant="solid"`.',
      deprecatedVariantDestructive:
        '`variant="destructive"` was removed in 0.32.0. Use `variant="solid" color="error"`.',
      deprecatedColorDefault:
        '`color="default"` was removed in 0.32.0. Use `color="accent"`.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = getJSXElementName(node)
        if (!name || !COMPONENTS.has(name)) return

        const variant = findJSXAttribute(node, 'variant')
        if (variant) {
          const v = getJSXStringAttributeValue(variant)
          const target = getJSXAttributeValueNode(variant)
          if (v === 'default' && target) {
            context.report({
              node: variant,
              messageId: 'deprecatedVariantDefault',
              fix: (fixer) => fixer.replaceText(target, '"solid"'),
            })
          } else if (v === 'destructive' && target) {
            // Replace the destructive value AND add color="error".
            // Use the attribute-level node range so we control both edits in one fix.
            context.report({
              node: variant,
              messageId: 'deprecatedVariantDestructive',
              fix: (fixer) => {
                const hasColor = findJSXAttribute(node, 'color') != null
                if (hasColor) {
                  return fixer.replaceText(target, '"solid"')
                }
                return fixer.replaceText(variant, 'variant="solid" color="error"')
              },
            })
          }
        }

        const color = findJSXAttribute(node, 'color')
        if (color) {
          const c = getJSXStringAttributeValue(color)
          const target = getJSXAttributeValueNode(color)
          if (c === 'default' && target) {
            context.report({
              node: color,
              messageId: 'deprecatedColorDefault',
              fix: (fixer) => fixer.replaceText(target, '"accent"'),
            })
          }
        }
      },
    }
  },
})
