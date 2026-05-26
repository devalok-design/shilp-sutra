import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-bg-gradient-to'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-bg-gradient-to', rule, {
  valid: [
    '<div className="bg-linear-to-r">x</div>',
    '<div className="bg-linear-to-tr">x</div>',
    '<div className={cn("bg-gradient-to-r")}>x</div>',
  ],
  invalid: [
    {
      code: '<div className="bg-gradient-to-r">x</div>',
      errors: [{ messageId: 'tw3GradientTo' }],
      output: '<div className="bg-linear-to-r">x</div>',
    },
    {
      code: '<div className="bg-gradient-to-tr from-pink-9 to-purple-9">x</div>',
      errors: [{ messageId: 'tw3GradientTo' }],
      output: '<div className="bg-linear-to-tr from-pink-9 to-purple-9">x</div>',
    },
    {
      code: '<div className="hover:bg-gradient-to-b">x</div>',
      errors: [{ messageId: 'tw3GradientTo' }],
      output: '<div className="hover:bg-linear-to-b">x</div>',
    },
  ],
})
