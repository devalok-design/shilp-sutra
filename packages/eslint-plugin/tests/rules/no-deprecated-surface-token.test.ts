import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-deprecated-surface-token'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-deprecated-surface-token', rule, {
  valid: [
    '<div className="bg-surface-base">x</div>',
    '<div className="bg-surface-raised border-surface-border">x</div>',
    '<div className="hover:bg-surface-raised-hover">x</div>',
    '<div>x</div>',
    // Dynamic className — bail silently
    '<div className={cn("bg-surface-1")}>x</div>',
    '<div className={`bg-surface-${n}`}>x</div>',
  ],
  invalid: [
    {
      code: '<div className="bg-surface-1">x</div>',
      errors: [{ messageId: 'deprecatedSurfaceToken' }],
      output: '<div className="bg-surface-base">x</div>',
    },
    {
      code: '<Card className="bg-surface-2 shadow-raised">card</Card>',
      errors: [{ messageId: 'deprecatedSurfaceToken' }],
      output: '<Card className="bg-surface-raised shadow-raised">card</Card>',
    },
    {
      code: '<div className="bg-surface-3 hover:bg-surface-4">x</div>',
      errors: [{ messageId: 'deprecatedSurfaceToken' }],
      output: '<div className="bg-surface-raised-hover hover:bg-surface-raised-active">x</div>',
    },
    {
      code: '<div className="border-surface-1 text-surface-2">x</div>',
      errors: [{ messageId: 'deprecatedSurfaceToken' }],
      output: '<div className="border-surface-base text-surface-raised">x</div>',
    },
  ],
})
