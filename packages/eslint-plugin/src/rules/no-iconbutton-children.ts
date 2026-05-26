import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'
import { findJSXAttribute, getJSXElementName } from '../util/jsx'

/**
 * `IconButton` rejects `children` by design — the icon goes through the
 * `icon` prop. Wrong:
 *
 *   <IconButton><Icon icon={IconArrowRight} /></IconButton>   // TS error
 *
 * Right:
 *
 *   <IconButton icon={<Icon icon={IconArrowRight} />} aria-label="Submit" />
 *
 * This rule autofixes the children form when `icon` is not already set.
 * Source: hiring-platform audit (F-20).
 */
type MessageIds = 'iconButtonChildren' | 'iconButtonChildrenWithIcon'

function findOpeningElementParent(
  open: TSESTree.JSXOpeningElement,
): TSESTree.JSXElement | null {
  const parent = open.parent
  return parent.type === AST_NODE_TYPES.JSXElement ? parent : null
}

export default createRule<[], MessageIds>({
  name: 'no-iconbutton-children',
  meta: {
    type: 'problem',
    docs: {
      description:
        'IconButton requires the icon via the `icon` prop, not children. The type explicitly omits children.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.1.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      iconButtonChildren:
        '`<IconButton>` does not accept children. Pass the icon via `icon={...}` instead.',
      iconButtonChildrenWithIcon:
        '`<IconButton>` does not accept children. The `icon` prop is already set — drop the children.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXOpeningElement(node) {
        if (getJSXElementName(node) !== 'IconButton') return
        const el = findOpeningElementParent(node)
        if (!el) return
        // Filter only "meaningful" children: text + JSX. Whitespace-only text is ignored.
        const meaningfulChildren = el.children.filter((c) => {
          if (c.type === AST_NODE_TYPES.JSXText) return c.value.trim().length > 0
          if (c.type === AST_NODE_TYPES.JSXExpressionContainer) {
            return c.expression.type !== AST_NODE_TYPES.JSXEmptyExpression
          }
          return true
        })
        if (meaningfulChildren.length === 0) return

        const hasIconProp = findJSXAttribute(node, 'icon') != null

        if (hasIconProp) {
          context.report({
            node: el,
            messageId: 'iconButtonChildrenWithIcon',
          })
          return
        }

        // Autofix: turn <IconButton ...>{X}</IconButton> into <IconButton ... icon={X} />
        if (meaningfulChildren.length === 1) {
          const child = meaningfulChildren[0]
          if (!child) return
          const childSrc = context.sourceCode.getText(child)
          // Wrap JSXText in quotes; everything else stays as-is
          const iconExpr =
            child.type === AST_NODE_TYPES.JSXText
              ? `"${childSrc.trim()}"`
              : child.type === AST_NODE_TYPES.JSXExpressionContainer
                ? context.sourceCode.getText(child.expression)
                : childSrc

          context.report({
            node: el,
            messageId: 'iconButtonChildren',
            fix: (fixer) => {
              // Drop the closing tag + replace children + close as self-closing
              const openingEnd = node.range[1]
              const closing = el.closingElement
              if (!closing) return null

              // New opening: insert ` icon={iconExpr}` before the `>` of the opening,
              // turn opening into self-closing (` />`) and remove everything from
              // the opening's `>` through the closing tag's `>`.

              // Strategy: replace [start of opening `>`, end of closing tag] with ` icon={X} />`.
              // The `>` of the opening is the last char of node.range — replaceTextRange wants the index of `>`.
              const lastChar = openingEnd - 1
              return fixer.replaceTextRange(
                [lastChar, closing.range[1]],
                ` icon={${iconExpr}} />`,
              )
            },
          })
        } else {
          // Multiple children — no autofix, just flag.
          context.report({
            node: el,
            messageId: 'iconButtonChildren',
          })
        }
      },
    }
  },
})
