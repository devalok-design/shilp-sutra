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
