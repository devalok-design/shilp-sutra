import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-ungated-hover-over-selection'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  },
})

tester.run('no-ungated-hover-over-selection', rule, {
  valid: [
    // The two shapes that actually fix it. Both are legitimate, which is why
    // the rule offers no autofix.
    `cn(!isActive && 'hover:bg-surface-panel-hover', isActive && 'bg-accent-4')`,
    `cn('hover:bg-surface-panel-hover', isActive && 'bg-accent-4 hover:bg-accent-5')`,

    // The exact shapes shipped in TreeItem and TableRow, which already carry
    // the guard — a regression in either must show up here.
    `cn('rounded-control px-2', !isSelected && 'hover:bg-surface-panel-hover', isSelected && 'bg-accent-4 text-accent-11')`,
    `cn('border-b', 'hover:bg-surface-panel-hover data-[state=selected]:bg-accent-4 data-[state=selected]:hover:bg-accent-5')`,

    // No conditional background at all.
    `cn('hover:bg-surface-panel-hover', 'rounded-control')`,
    // Conditional, but not a selection flag — a hover here is intended.
    `cn('hover:bg-surface-panel-hover', isDisabled && 'bg-surface-panel')`,
    `cn('hover:bg-surface-panel-hover', hasError && 'bg-error-3')`,
    // Conditional sets something other than a background.
    `cn('hover:bg-surface-panel-hover', isActive && 'font-medium text-accent-11')`,
    // A hover that is not a background does not out-rank a background.
    `cn('hover:text-accent-11', isActive && 'bg-accent-4')`,
    // Not a class-name helper.
    `format('hover:bg-surface-panel-hover', isActive && 'bg-accent-4')`,

    // The variant form carries its own specificity and needs no gate.
    `cn('data-[state=selected]:hover:bg-accent-5', isActive && 'bg-accent-4')`,

    // ── Lookup tables ────────────────────────────────────────────────────
    // Every entry carries its own hover — the NotificationCenter fix.
    `const S = { tint: 'bg-accent-4 hover:bg-accent-5', none: 'hover:bg-surface-panel-hover' }
     cn('border-b', isUnread && S[style])`,
    // A table the rule cannot read resolves to nothing and it stays quiet.
    `cn('hover:bg-surface-panel-hover', isActive && LOOKUP[key])`,
    // Values come from a call, not literals — unreadable, so quiet.
    `const S = { tint: makeClass('a') }
     cn('hover:bg-surface-panel-hover', isActive && S[style])`,
    // Dot access to an entry that already has its own hover.
    `const S = { on: 'bg-accent-4 hover:bg-accent-5' }
     cn('hover:bg-surface-panel-hover', isActive && S.on)`,
    // Not a selection flag, so a shared hover over a table is intended.
    `const S = { a: 'bg-error-3' }
     cn('hover:bg-surface-panel-hover', hasError && S[kind])`,

    // `read` is a state word, but `readOnly` and `readonly` are not — a
    // read-only field is disabled-ish, and a shared hover over it is intended.
    `cn('hover:bg-surface-panel-hover', isReadOnly && 'bg-surface-panel')`,
    `cn('hover:bg-surface-panel-hover', readonly && 'bg-surface-panel')`,
    `cn('hover:bg-surface-panel-hover', isDisabledRead && 'bg-surface-panel')`,
  ],

  invalid: [
    {
      // MasterDetail, exactly as it shipped.
      code: `cn('flex w-full items-center', 'hover:bg-surface-panel-hover', isActive && 'bg-accent-4 text-accent-11 font-medium')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      code: `cn('hover:bg-surface-panel-hover', isSelected && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // Order does not matter — the cascade decides, not the argument list.
      code: `cn(isActive && 'bg-accent-4', 'hover:bg-surface-panel-hover')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // A modifier chain in front of hover still ends in hover:bg.
      code: `cn('dark:hover:bg-surface-panel-hover', isActive && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // Member expression flag.
      code: `cn('hover:bg-surface-panel-hover', row.isSelected && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // Call-expression flag, e.g. TanStack's row.getIsSelected().
      code: `cn('hover:bg-surface-panel-hover', row.getIsSelected() && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      code: `clsx('hover:bg-surface-panel-hover', isCurrent && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // Template literal with no interpolation is still a readable string.
      code: 'cn(`hover:bg-surface-panel-hover`, isActive && `bg-accent-4`)',
      errors: [{ messageId: 'ungatedHover' }],
    },

    // ── The NotificationCenter miss, in its original shape ───────────────
    // A table lookup behind a negated flag. All three gaps had to close for
    // this to report: reading the table, unwrapping the `!`, and treating
    // `unread` as a state worth marking.
    {
      code: `const UNREAD_STYLES = { tint: 'bg-accent-4', strong: 'bg-accent-5', none: '' }
             cn('border-b', 'hover:bg-surface-panel-hover', !n.isRead && UNREAD_STYLES[style])`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    // One bad entry among good ones is still a bug — it ships on that value.
    {
      code: `const S = { a: 'bg-accent-4 hover:bg-accent-5', b: 'bg-accent-4' }
             cn('hover:bg-surface-panel-hover', isSelected && S[k])`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    // The ungated half can itself be a lookup.
    {
      code: `const H = { on: 'hover:bg-surface-panel-hover' }
             cn(H[k], isActive && 'bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    // `as Record<…>` wraps the literal; the rule must still see through it.
    {
      code: `const S = { tint: 'bg-accent-4' } as Record<string, string>
             cn('hover:bg-surface-panel-hover', isUnread && S[style])`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    // A ternary resolves to both branches.
    {
      code: `cn('hover:bg-surface-panel-hover', isSelected && (dense ? 'bg-accent-4' : 'bg-accent-5'))`,
      errors: [{ messageId: 'ungatedHover' }],
    },
  ],
})

// Same-colour cases: the conflict exists in the cascade but nothing changes
// colour, so there is no bug to report. EmojiPicker does this on purpose — the
// keyboard-active emoji is meant to look hovered.
tester.run('no-ungated-hover-over-selection (same colour is not a bug)', rule, {
  valid: [
    `cn('hover:bg-surface-panel-hover', emoji.isActive && 'bg-surface-panel-hover')`,
    // Order must not change the verdict.
    `cn(emoji.isActive && 'bg-surface-panel-hover', 'hover:bg-surface-panel-hover')`,
    // Modifier chains are compared on the bare utility.
    `cn('dark:hover:bg-surface-panel-hover', isActive && 'bg-surface-panel-hover')`,
  ],
  invalid: [
    {
      // Same utility plus a DIFFERENT one still changes appearance.
      code: `cn('hover:bg-surface-panel-hover', isActive && 'bg-surface-panel-hover bg-accent-4')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
    {
      // Reversed order, different colours — still a bug.
      code: `cn(isSelected && 'bg-accent-4', 'hover:bg-surface-panel-hover')`,
      errors: [{ messageId: 'ungatedHover' }],
    },
  ],
})
