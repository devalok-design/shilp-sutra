import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/toast-object-syntax'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('toast-object-syntax', rule, {
  valid: [
    `toast.success('Saved')`,
    `toast.error('Failed', { description: 'Try again' })`,
    `toast.promise(fn, { loading: '...', success: '...', error: '...' })`,
  ],
  invalid: [
    {
      code: `toast.success({ title: 'Saved' })`,
      errors: [{ messageId: 'objectSyntax' }],
    },
    {
      code: `toast.error({ title: 'Failed', description: 'Try again' })`,
      errors: [{ messageId: 'objectSyntax' }],
    },
    {
      code: `toast({ title: 'Saved' })`,
      errors: [{ messageId: 'bareCallWithObject' }],
    },
  ],
})
