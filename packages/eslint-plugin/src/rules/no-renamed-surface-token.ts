import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import {
  renderClassName,
  rewriteClassName,
  tokenizeClassName,
} from '../util/classnames'
import { createRule } from '../util/create-rule'

/**
 * The 2026-08 surface model renamed `surface-raised` to `surface-panel`, and
 * removed `surface-chrome`.
 *
 * The rename is the easy half. The dangerous half is this: under the new model
 * `surface-base`, `surface-panel` and `surface-overlay` are the SAME white in
 * light mode. So a hover painted with the panel value is invisible on every one
 * of them.
 *
 *   hover:bg-surface-raised   →  hover:bg-surface-panel        ✗ invisible
 *   hover:bg-surface-raised   →  hover:bg-surface-panel-hover  ✓
 *
 * A blind rename would ship 141 invisible hover states — worse than shipping
 * nothing, because today only the menus are broken. So a token carrying an
 * interaction modifier is RETARGETED to the matching interaction surface, while
 * a bare one (or one carrying only a responsive/theme modifier) is renamed.
 *
 * `dark:` and `md:` are NOT interaction states. `dark:bg-surface-raised` is
 * still a background and must stay a background.
 *
 * See docs/audits/2026-08-26-surface-model-ds-audit.md (finding A1).
 */

/** Modifiers that mean "this paints an interaction state, not a container." */
const HOVER_STATES = [
  'hover',
  'focus',
  'focus-visible',
  'focus-within',
  'group-hover',
  'group-focus',
  'peer-hover',
  'peer-focus',
  'aria-selected',
  'data-[highlighted]',
  'data-[state=open]',
  'data-[state=on]',
  'data-[state=selected]',
]
const ACTIVE_STATES = ['active', 'group-active', 'peer-active', 'data-[state=active]']

/**
 * Every utility prefix that resolves against the surface colour namespace.
 * Includes hyphenated ones (`ring-offset-`, `border-t-`) — a first pass missed
 * `ring-offset-surface-raised` because the prefix pattern was `[a-z]+`.
 */
const PREFIXES = [
  'bg', 'text', 'fill', 'stroke', 'caret', 'accent', 'placeholder', 'decoration',
  'border', 'border-t', 'border-r', 'border-b', 'border-l', 'border-x', 'border-y',
  'border-s', 'border-e',
  'ring', 'ring-offset', 'outline', 'divide', 'divide-x', 'divide-y',
  // gradient colour stops resolve against the colour namespace; `shadow-*` does
  // NOT — it resolves against --shadow-*, so it is deliberately absent.
  'from', 'via', 'to',
]

/** `raised` | `raised-hover` | `raised-active` → the surface it should now use. */
function resolve(base: string, state: 'none' | 'hover' | 'active'): string {
  if (state === 'active') return 'panel-active'
  if (state === 'hover') return base === 'raised-active' ? 'panel-active' : 'panel-hover'
  if (base === 'raised') return 'panel'
  if (base === 'raised-hover') return 'panel-hover'
  return 'panel-active'
}

export function rewriteToken(token: string): string | null {
  const parts = token.split(':')
  const utility = parts.pop()
  if (!utility) return null
  const modifiers = parts

  // A trailing `/NN` is an opacity modifier and must survive the rewrite —
  // `bg-surface-raised-hover/30` was missed on the first pass.
  const match = utility.match(
    /^(-?)([a-z]+(?:-[a-z]+)*)-surface-(chrome|raised(?:-hover|-active)?)(\/[0-9.]+)?$/,
  )
  if (!match) return null
  const [, negative, prefix, base, opacity] = match
  if (!prefix || !base || !PREFIXES.includes(prefix)) return null

  // chrome was an arrangement decision masquerading as a theme value; the page
  // surface is what it actually resolved to in the default arrangement.
  if (base === 'chrome') {
    return `${modifiers.map((m) => `${m}:`).join('')}${negative ?? ''}${prefix}-surface-base${opacity ?? ''}`
  }

  let state: 'none' | 'hover' | 'active' = 'none'
  if (modifiers.some((m) => ACTIVE_STATES.includes(m))) state = 'active'
  else if (modifiers.some((m) => HOVER_STATES.includes(m))) state = 'hover'

  const next = resolve(base, state)
  const rebuilt = `${modifiers.map((m) => `${m}:`).join('')}${negative ?? ''}${prefix}-surface-${next}${opacity ?? ''}`
  return rebuilt === token ? null : rebuilt
}

type MessageIds = 'renamed' | 'retargeted' | 'chrome'

/**
 * A retarget is not "has a state modifier" — it is "the surface it now points
 * at is not the one a plain rename would have given". Classify by comparing the
 * transform against the rename, rather than by pattern-matching the token.
 */
function classify(token: string): MessageIds | null {
  const parts = token.split(':')
  const utility = parts.pop()
  if (!utility) return null
  const match = utility.match(
    /^-?[a-z]+(?:-[a-z]+)*-surface-(chrome|raised(?:-hover|-active)?)(?:\/[0-9.]+)?$/,
  )
  if (!match) return null
  const base = match[1]
  if (!base) return null
  if (base === 'chrome') return 'chrome'

  let state: 'none' | 'hover' | 'active' = 'none'
  if (parts.some((m) => ACTIVE_STATES.includes(m))) state = 'active'
  else if (parts.some((m) => HOVER_STATES.includes(m))) state = 'hover'

  const plainRename = base.replace('raised', 'panel')
  return resolve(base, state) === plainRename ? 'renamed' : 'retargeted'
}

export default createRule<[], MessageIds>({
  name: 'no-renamed-surface-token',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Rename surface-raised to surface-panel, retarget interaction states to surface-panel-hover/-active, and replace the removed surface-chrome.',
      category: 'migration',
      recommended: 'error',
      appliesFrom: '0.57.0',
    },
    fixable: 'code',
    schema: [],
    messages: {
      renamed:
        '`surface-raised` is now `surface-panel`. In light mode it is not raised — it is the same white as the page.',
      retargeted:
        'An interaction state painted with a container surface is invisible in light mode, where base, panel and overlay are all white. Use `surface-panel-hover` / `-active`.',
      chrome:
        '`surface-chrome` was removed — chrome is an arrangement decision, not a theme value. Use `surface-base`.',
    },
  },
  defaultOptions: [],
  create(context) {
    /**
     * Any string literal can hold classes: cn(), cva variants, plain consts.
     *
     * `fixable` is false for template chunks. A TemplateElement's range covers
     * its delimiters (the backtick, and the `}`/`${` seams), so replacing it
     * with bare text destroys the literal — this corrupted a story file the
     * first time it ran. Template literals get reported for a human instead.
     */
    function check(node: TSESTree.Literal | TSESTree.TemplateElement, raw: string, fixable: boolean) {
      if (!raw.includes('surface-raised') && !raw.includes('surface-chrome')) return

      const tokenized = tokenizeClassName(raw)
      const rewritten = rewriteClassName(tokenized, rewriteToken)
      if (!rewritten) return

      // A retarget is the dangerous one, so it wins the message when a single
      // string contains both kinds.
      const kinds = tokenized.tokens
        .filter((t, i) => t !== rewritten.tokens[i])
        .map(classify)
        .filter((k): k is MessageIds => k !== null)
      const messageId: MessageIds = kinds.includes('retargeted')
        ? 'retargeted'
        : (kinds[0] ?? 'renamed')
      const next = renderClassName(rewritten)

      context.report({
        node,
        messageId,
        ...(fixable
          ? {
              fix: (fixer: TSESLint.RuleFixer) => {
                const source = context.sourceCode.getText(node)
                const quote = source.charAt(0)
                return fixer.replaceText(node, quote + next + quote)
              },
            }
          : {}),
      })
    }

    return {
      Literal(node) {
        if (typeof node.value !== 'string') return
        check(node, node.value, true)
      },
      TemplateElement(node) {
        check(node, node.value.raw, false)
      },
    }
  },
})
