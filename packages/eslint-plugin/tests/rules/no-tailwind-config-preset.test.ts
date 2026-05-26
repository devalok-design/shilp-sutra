import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-tailwind-config-preset'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-tailwind-config-preset', rule, {
  valid: [
    `import { something } from '@devalok/shilp-sutra'`,
    `const config = { presets: [require('@tailwindcss/forms')] }`,
    `const config = { content: ['./src/**/*.tsx'] }`,
  ],
  invalid: [
    {
      code: `import shilpSutra from '@devalok/shilp-sutra/tailwind'`,
      errors: [{ messageId: 'deprecatedTailwindImport' }],
    },
    {
      code: `const config = { presets: [require('@devalok/shilp-sutra/tailwind')] }`,
      errors: [{ messageId: 'deprecatedPresetsArray' }],
    },
    {
      code: `const config = { presets: [shilpSutra] }`,
      errors: [{ messageId: 'deprecatedPresetsArray' }],
    },
  ],
})
