import { findJSXAttribute, getJSXElementName } from '../util/jsx'
import {
  getLiteralClassNameNode,
  quoteClassName,
  renderClassName,
  rewriteClassName,
  tokenizeClassName,
} from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * TW4 renamed gradient utilities. `bg-gradient-to-r` is the TW3 spelling;
 * `bg-linear-to-r` is the TW4 successor. Also handles `bg-gradient-to-{r,l,t,b,tr,tl,br,bl}`.
 */
function rewriteToken(token: string): string | null {
  const match = token.match(/^((?:hover|focus|active|disabled|group-hover|dark):)*bg-gradient-to-(r|l|t|b|tr|tl|br|bl)$/)
  if (!match) return null
  const [, modifiers, dir] = match
  return `${modifiers ?? ''}bg-linear-to-${dir}`
}

type MessageIds = 'tw3GradientTo'

export default createRule<[], MessageIds>({
  name: 'no-bg-gradient-to',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Replace TW3-era `bg-gradient-to-*` with TW4 `bg-linear-to-*`.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.37.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      tw3GradientTo:
        '`bg-gradient-to-*` is TW3-era; TW4 (shilp-sutra 0.37+) renamed to `bg-linear-to-*`.',
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
        const rewritten = rewriteClassName(tokenized, rewriteToken)
        if (!rewritten) return

        context.report({
          node: literal,
          messageId: 'tw3GradientTo',
          fix: (fixer) => fixer.replaceText(literal, quoteClassName(literal, renderClassName(rewritten))),
        })
      },
    }
  },
})
