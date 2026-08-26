import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-subtle-text-on-sunken'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  },
})

tester.run('no-subtle-text-on-sunken', rule, {
  valid: [
    '<div className="bg-surface-sunken text-surface-fg-muted">x</div>',
    '<div className="bg-surface-panel text-surface-fg-subtle">x</div>',
    '<div className="bg-surface-base text-surface-fg-subtle">x</div>',
    // different elements, not the same class list
    '<div className="bg-surface-sunken"><span className="text-surface-fg-muted" /></div>',
    // KNOWN LIMITATION: the rule reads one string at a time, so a pairing split
    // across two cn() arguments is invisible to it. Cross-literal analysis would
    // need to know which strings land on the same element, which is not
    // decidable from the AST. Documented rather than faked.
    'const c = cn("bg-surface-sunken", "text-surface-fg-subtle p-2")',
  ],
  invalid: [
    {
      code: '<div className="bg-surface-sunken text-surface-fg-subtle">x</div>',
      errors: [{ messageId: 'subtleOnSunken' }],
    },
    {
      code: '<div className="bg-surface-sunken-hover p-2 text-surface-fg-subtle">x</div>',
      errors: [{ messageId: 'subtleOnSunken' }],
    },
    // modifiers must not hide the pairing
    {
      code: '<div className="dark:bg-surface-sunken text-surface-fg-subtle">x</div>',
      errors: [{ messageId: 'subtleOnSunken' }],
    },
    // ...but a pairing WITHIN one string is caught wherever that string lives
    { code: 'const c = cn("bg-surface-sunken text-surface-fg-subtle", x)', errors: [{ messageId: 'subtleOnSunken' }] },
  ],
})
