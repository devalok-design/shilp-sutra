import type { TSESTree } from '@typescript-eslint/utils'

import { tokenizeClassName } from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * `text-surface-fg-subtle` on `bg-surface-sunken` measures **4.38:1** — under
 * WCAG AA's 4.5. Every other text-on-surface pair in the system passes.
 *
 * The tokens are both fine; the pairing is not. `fg-subtle` is the faintest text
 * in the system and a sunken well is already a de-emphasised region, so putting
 * them together asks the quietest text to sit on the quietest ground. Wells take
 * `fg-muted` (7.06:1).
 *
 * Fixing this in the tokens was worse both ways: lightening the well needs
 * `#f2f2f2` to clear 4.5, which lands 3 levels from `panel-hover` and defeats
 * having a separate step; and darkening `fg-subtle` moves a token with 264
 * references to suit one pairing.
 *
 * Not autofixable — swapping to `fg-muted` changes the visual weight of the
 * text, which is a judgement the author should make.
 *
 * KNOWN LIMITATION: reads one string literal at a time. A pairing split across
 * two `cn()` arguments is invisible, because knowing which strings land on the
 * same element is not decidable from the AST. Catches the common case.
 *
 * See docs/audits/2026-08-26-surface-model-ds-audit.md (finding A3).
 */
const SUNKEN = ['bg-surface-sunken', 'bg-surface-sunken-hover']
const SUBTLE = 'text-surface-fg-subtle'

/** Strip responsive/theme/state modifiers so `dark:bg-surface-sunken` counts. */
function bare(token: string): string {
  const parts = token.split(':')
  return parts[parts.length - 1] ?? token
}

type MessageIds = 'subtleOnSunken'

export default createRule<[], MessageIds>({
  name: 'no-subtle-text-on-sunken',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Subtle foreground text on a sunken surface measures 4.38:1, under WCAG AA. Wells take surface-fg-muted.',
      category: 'recommended',
      recommended: 'error',
      appliesFrom: '0.57.0',
    },
    schema: [],
    messages: {
      subtleOnSunken:
        '`text-surface-fg-subtle` on `bg-surface-sunken` is 4.38:1, under WCAG AA (4.5). Use `text-surface-fg-muted` — 7.06:1.',
    },
  },
  defaultOptions: [],
  create(context) {
    function check(node: TSESTree.Literal | TSESTree.TemplateElement, raw: string) {
      if (!raw.includes('surface-sunken') || !raw.includes(SUBTLE)) return
      const tokens = tokenizeClassName(raw).tokens.map(bare)
      const onSunken = tokens.some((t) => SUNKEN.includes(t))
      const hasSubtle = tokens.includes(SUBTLE)
      if (onSunken && hasSubtle) {
        context.report({ node, messageId: 'subtleOnSunken' })
      }
    }
    return {
      Literal(node) {
        if (typeof node.value !== 'string') return
        check(node, node.value)
      },
      TemplateElement(node) {
        check(node, node.value.raw)
      },
    }
  },
})
