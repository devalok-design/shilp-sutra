import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/prefer-per-component-import'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('prefer-per-component-import', rule, {
  valid: [
    `import { Button, Card } from '@devalok/shilp-sutra/ui'`,
    `import { Toaster } from '@devalok/shilp-sutra/ui/toaster'`,
    `import { toast } from '@devalok/shilp-sutra/ui/toast'`,
    `import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'`,
    `import lodash from 'lodash'`,
  ],
  invalid: [
    {
      code: `import { Toaster } from '@devalok/shilp-sutra/ui'`,
      errors: [{ messageId: 'peerCliffImport' }],
      output: `import { Toaster } from '@devalok/shilp-sutra/ui/toaster'`,
    },
    {
      code: `import { Button, Toaster, toast } from '@devalok/shilp-sutra/ui'`,
      errors: [{ messageId: 'peerCliffImport' }],
      output: `import { Button } from '@devalok/shilp-sutra/ui'\nimport { toast } from '@devalok/shilp-sutra/ui/toast'\nimport { Toaster } from '@devalok/shilp-sutra/ui/toaster'`,
    },
    {
      code: `import { DatePicker, RichTextEditor } from '@devalok/shilp-sutra/composed'`,
      errors: [{ messageId: 'peerCliffImport' }],
      output: `import { DatePicker } from '@devalok/shilp-sutra/composed/date-picker'\nimport { RichTextEditor } from '@devalok/shilp-sutra/composed/rich-text-editor'`,
    },
    {
      code: `import { ErrorBlock, TextBlock } from '@devalok/shilp-sutra/ai/blocks'`,
      errors: [{ messageId: 'peerCliffImport' }],
      output: `import { ErrorBlock } from '@devalok/shilp-sutra/ai/blocks/error'\nimport { TextBlock } from '@devalok/shilp-sutra/ai/blocks/text'`,
    },
  ],
})
