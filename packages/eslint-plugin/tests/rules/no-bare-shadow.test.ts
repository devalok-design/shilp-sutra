import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-bare-shadow'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-bare-shadow', rule, {
  valid: [
    '<div className="shadow-raised">x</div>',
    '<div className="shadow-overlay">x</div>',
    '<div className="hover:shadow-floating">x</div>',
    '<div>x</div>',
  ],
  invalid: [
    {
      code: '<div className="shadow">x</div>',
      errors: [{ messageId: 'bareShadow' }],
    },
    {
      code: '<div className="rounded-control p-2 shadow bg-surface-raised">x</div>',
      errors: [{ messageId: 'bareShadow' }],
    },
    {
      code: '<div className="hover:shadow">x</div>',
      errors: [{ messageId: 'bareShadow' }],
    },
  ],
})
