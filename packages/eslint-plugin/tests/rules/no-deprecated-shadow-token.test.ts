import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-deprecated-shadow-token'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-deprecated-shadow-token', rule, {
  valid: [
    '<div className="shadow-raised">x</div>',
    '<div className="shadow-overlay">x</div>',
    '<div className={cn("shadow-01")}>x</div>',
  ],
  invalid: [
    {
      code: '<div className="shadow-01">x</div>',
      errors: [{ messageId: 'deprecatedShadowToken' }],
      output: '<div className="shadow-raised">x</div>',
    },
    {
      code: '<div className="shadow-02 hover:shadow-03">x</div>',
      errors: [{ messageId: 'deprecatedShadowToken' }],
      output: '<div className="shadow-raised-hover hover:shadow-floating">x</div>',
    },
    {
      code: '<div className="shadow-04 bg-surface-overlay">x</div>',
      errors: [{ messageId: 'deprecatedShadowToken' }],
      output: '<div className="shadow-overlay bg-surface-overlay">x</div>',
    },
    {
      // shadow-05 removed entirely — flag, don't autofix
      code: '<div className="shadow-05">x</div>',
      errors: [{ messageId: 'removedShadow05' }],
      output: null,
    },
  ],
})
