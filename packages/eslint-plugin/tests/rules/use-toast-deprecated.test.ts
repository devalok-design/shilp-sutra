import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/use-toast-deprecated'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('use-toast-deprecated', rule, {
  valid: [
    `import { toast } from '@devalok/shilp-sutra/ui/toast'`,
    `import { useTheme } from 'next-themes'`,
  ],
  invalid: [
    {
      code: `import { useToast } from '@devalok/shilp-sutra/ui/toast'`,
      errors: [{ messageId: 'useToastImport' }],
      output: `import { toast } from '@devalok/shilp-sutra/ui/toast'`,
    },
    {
      code: `const { toast } = useToast()`,
      errors: [{ messageId: 'useToastCall' }],
    },
  ],
})
