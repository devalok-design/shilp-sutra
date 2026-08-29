import type { TSESTree } from '@typescript-eslint/utils'

import { createRule } from '../util/create-rule'

/**
 * An ungated `hover:bg-*` beats a conditional selected/active `bg-*`, so
 * pointing at the selected row visually deselects it.
 *
 * ```
 * .hover\:bg-surface-panel-hover:hover   (0,2,0)   <- wins
 * .bg-accent-4                           (0,1,0)
 * ```
 *
 * Tailwind emits the hover utility with an extra `:hover` pseudo-class, so it
 * outranks a plain background utility no matter what order they appear in the
 * `cn()` call. `tailwind-merge` does not save you either: it de-duplicates
 * conflicting utilities by *group*, and `hover:bg-x` and `bg-y` are different
 * groups, so both survive into the class list and the cascade decides.
 *
 * This has shipped three times — `TreeItem`, `TableRow` and `MasterDetail`, the
 * last found only while rebuilding the component in Figma. Two of the three
 * carry a hand-written comment explaining the fix, which is the tell that this
 * wants a rule rather than a fourth comment.
 *
 * Two shapes are correct and are NOT reported:
 *
 * ```tsx
 * // gate the hover on the negation
 * cn(!isActive && 'hover:bg-surface-panel-hover', isActive && 'bg-accent-4')
 *
 * // or give the active state its own hover, which is usually what you want —
 * // an active row with no hover response looks dead to the pointer
 * cn('hover:bg-surface-panel-hover', isActive && 'bg-accent-4 hover:bg-accent-5')
 * ```
 *
 * Not autofixable: both fixes are legitimate and they look different. Which one
 * is right depends on whether the active row should respond to the pointer at
 * all, and that is the author's call.
 *
 * KNOWN LIMITATION: only sees `cn()` / `clsx()` calls, because that is the only
 * place the AST proves two class strings land on the same element. A hover
 * applied in one component and a selected background in a parent is invisible
 * here — and so is the `data-[state=selected]:` variant form, which does not
 * need this rule because the variant carries its own specificity.
 */

const CLASS_FNS = new Set(['cn', 'clsx', 'classNames', 'cx', 'twMerge'])

/** Identifiers that read as "this row is the chosen one". */
const SELECTED_WORDS = ['active', 'selected', 'current', 'chosen', 'checked']

/**
 * Match on WORDS, not on a substring, and split camelCase first — `\b` never
 * fires inside `getIsSelected`, which is TanStack's actual API and appears in
 * our own DataTable. Splitting also stops `inactive` matching `active`.
 */
function readsAsSelection(identifier: string): boolean {
  const words = identifier
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  return words.some((w) => SELECTED_WORDS.includes(w))
}

/** `hover:bg-x` / `dark:hover:bg-x` — any modifier chain ending in hover:bg. */
const HOVER_BG_RE = /(?:^|\s)((?:[\w[\]&>:.\-/]+:)*hover:bg-[\w[\]().,/%#-]+)/

/** Background utilities with NO hover modifier anywhere in their chain. */
function plainBgs(raw: string): string[] {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => {
      const mods = t.split(':')
      const base = mods.pop() ?? ''
      return base.startsWith('bg-') && !mods.includes('hover') ? base : null
    })
    .filter((t): t is string => t !== null)
}

/** `dark:hover:bg-accent-5` -> `bg-accent-5`. */
function bareToken(token: string): string {
  const parts = token.split(':')
  return parts[parts.length - 1] ?? token
}

function firstHoverBg(raw: string): string | null {
  const m = ` ${raw}`.match(HOVER_BG_RE)
  return m ? (m[1] ?? null) : null
}

/** The string value of a node, when it is a plain string we can read. */
function literalText(node: TSESTree.Node): string | null {
  if (node.type === 'Literal' && typeof node.value === 'string') return node.value
  if (node.type === 'TemplateLiteral' && node.expressions.length === 0) {
    return node.quasis.map((q) => q.value.cooked ?? '').join('')
  }
  return null
}

/** Does this test expression read as a selected/active check? */
function testsSelection(node: TSESTree.Node): boolean {
  if (node.type === 'Identifier') return readsAsSelection(node.name)
  if (node.type === 'MemberExpression' && node.property.type === 'Identifier') {
    return readsAsSelection(node.property.name)
  }
  if (node.type === 'CallExpression') return testsSelection(node.callee)
  if (node.type === 'BinaryExpression' || node.type === 'LogicalExpression') {
    return testsSelection(node.left) || testsSelection(node.right)
  }
  return false
}

type MessageIds = 'ungatedHover'

export default createRule<[], MessageIds>({
  name: 'no-ungated-hover-over-selection',
  meta: {
    type: 'problem',
    docs: {
      description:
        'An ungated hover background outranks a conditional selected/active background, so hovering the selected row visually deselects it.',
      category: 'recommended',
      recommended: 'error',
      appliesFrom: '0.60.0',
    },
    schema: [],
    messages: {
      ungatedHover:
        "`{{hover}}` is (0,2,0) and the active background is (0,1,0), so hovering the selected element clears its tint. Gate the hover on the negation (`!{{flag}} && '{{hover}}'`) or give the active state its own hover.",
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee
        const name =
          callee.type === 'Identifier'
            ? callee.name
            : callee.type === 'MemberExpression' && callee.property.type === 'Identifier'
              ? callee.property.name
              : null
        if (!name || !CLASS_FNS.has(name)) return

        // Collect both halves BEFORE comparing. Argument order is arbitrary —
        // `cn(isActive && '…', 'hover:…')` is as common as the reverse — and a
        // single pass that decided as it went would judge the pair on whatever
        // it happened to have seen so far.

        // An ungated hover: a bare string argument carrying `hover:bg-*`, with
        // no condition attached to it.
        let ungatedHover: { node: TSESTree.Node; token: string } | null = null
        // Conditional active backgrounds that carry no hover of their own.
        const activeBgs: { flag: string; bgs: string[] }[] = []

        for (const arg of node.arguments) {
          const direct = literalText(arg)
          if (direct !== null) {
            if (!ungatedHover) {
              const token = firstHoverBg(direct)
              if (token) ungatedHover = { node: arg, token }
            }
            continue
          }

          if (arg.type === 'LogicalExpression' && arg.operator === '&&') {
            const text = literalText(arg.right)
            if (text === null) continue
            // A conditional that ALREADY carries its own hover is the fix, not
            // the bug — `isActive && 'bg-accent-4 hover:bg-accent-5'`.
            if (firstHoverBg(text)) continue
            const bgs = plainBgs(text)
            if (bgs.length === 0) continue
            if (!testsSelection(arg.left)) continue
            activeBgs.push({
              bgs,
              flag:
                arg.left.type === 'Identifier'
                  ? arg.left.name
                  : context.sourceCode.getText(arg.left),
            })
          }
        }

        if (!ungatedHover || activeBgs.length === 0) return

        // If every active background is the SAME utility the hover paints, the
        // cascade conflict has no visual consequence — nothing changes colour
        // when you point at it. EmojiPicker does this deliberately: the
        // keyboard-active emoji is meant to look hovered. Reporting it would be
        // a false positive, and a rule that cries wolf on an intentional
        // pattern gets switched off.
        const hoverBg = bareToken(ungatedHover.token)
        const offender = activeBgs.find((a) => a.bgs.some((b) => b !== hoverBg))
        if (!offender) return

        context.report({
          node: ungatedHover.node,
          messageId: 'ungatedHover',
          data: { hover: ungatedHover.token, flag: offender.flag },
        })
      },
    }
  },
})
