import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/require-mutation-annotation'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('require-mutation-annotation', rule, {
  valid: [
    // Token colours — the correct path.
    '<div className="bg-accent-9 text-surface-fg">x</div>',
    '<div className="border-surface-border-card">x</div>',
    // The `bg-(--token)` shorthand is a token, not a raw literal.
    '<div className="bg-(--brand)">x</div>',
    // Arbitrary NON-colour values (spacing/size) are out of scope here.
    '<div className="w-[240px] min-h-[2.75rem]">x</div>',
    '<div>x</div>',
    // Raw colour annotated as a deliberate deviation — line above.
    '// @mutation reason: client brand accent\n<div className="bg-[#00aaff]">x</div>',
    // Annotated on the same line.
    'const c = "bg-[#00aaff]" // @mutation reason: one-off',
    // cva with token colours.
    "const v = cva('border border-surface-border-card bg-surface-2')",
  ],
  invalid: [
    {
      code: '<div className="bg-[#00aaff]">x</div>',
      errors: [{ messageId: 'unannotated' }],
    },
    {
      code: '<div className="text-[oklch(0.5_0.1_20)]">x</div>',
      errors: [{ messageId: 'unannotated' }],
    },
    // Raw colour inside a cva string literal.
    {
      code: "const v = cva('border-[rgb(0,0,0)]')",
      errors: [{ messageId: 'unannotated' }],
    },
    // A far-away @mutation comment does not license this line.
    {
      code: '// @mutation reason: unrelated\nconst a = 1\nconst c = "bg-[#123456]"',
      errors: [{ messageId: 'unannotated' }],
    },
  ],
})
