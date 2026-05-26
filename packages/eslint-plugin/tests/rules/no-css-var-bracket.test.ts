import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-css-var-bracket'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-css-var-bracket', rule, {
  valid: [
    '<div className="w-(--my-var)">x</div>',
    '<div className="h-(--card-h)">x</div>',
    '<div className="w-[40px]">x</div>',
    '<div className={`w-[--${name}]`}>x</div>',
  ],
  invalid: [
    {
      code: '<div className="w-[--my-var]">x</div>',
      errors: [{ messageId: 'tw3VarBracket' }],
      output: '<div className="w-(--my-var)">x</div>',
    },
    {
      code: '<div className="h-[--card-h] w-[--card-w]">x</div>',
      errors: [{ messageId: 'tw3VarBracket' }],
      output: '<div className="h-(--card-h) w-(--card-w)">x</div>',
    },
  ],
})
