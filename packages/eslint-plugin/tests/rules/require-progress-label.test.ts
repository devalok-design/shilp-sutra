import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/require-progress-label'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('require-progress-label', rule, {
  valid: [
    `<Progress value={70} label="Storage used" />`,
    `<Progress value={70} aria-label="Upload progress" />`,
    `<Progress value={70} aria-labelledby="storage-heading" />`,
    `<Progress value={70} {...rest} />`,
    `<Progress.Root value={70} />`,
    `<Progress.Track aria-label="Upload progress" />`,
    `<div value={70} />`,
  ],
  invalid: [
    {
      code: `<Progress value={70} />`,
      errors: [{ messageId: 'missingLabel' }],
    },
    {
      code: `<Progress value={70} showValue />`,
      errors: [{ messageId: 'missingLabel' }],
    },
    {
      code: `<Progress />`,
      errors: [{ messageId: 'missingLabel' }],
    },
  ],
})
