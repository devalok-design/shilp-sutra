import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-deprecated-chip'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-deprecated-chip', rule, {
  valid: [
    `import { Badge } from '@devalok/shilp-sutra/ui/badge'`,
    `import { Button, Badge } from '@devalok/shilp-sutra/ui'`,
    `<Badge onClick={() => {}}>label</Badge>`,
  ],
  invalid: [
    {
      code: `import { Chip } from '@devalok/shilp-sutra/ui'`,
      errors: [{ messageId: 'deprecatedChipImport' }],
      output: `import { Badge } from '@devalok/shilp-sutra/ui'`,
    },
    {
      code: `import { Button, Chip } from '@devalok/shilp-sutra'`,
      errors: [{ messageId: 'deprecatedChipImport' }],
      output: `import { Button, Badge } from '@devalok/shilp-sutra'`,
    },
    {
      code: `<Chip>label</Chip>`,
      errors: [{ messageId: 'deprecatedChipJsx' }, { messageId: 'deprecatedChipJsx' }],
      output: `<Badge>label</Badge>`,
    },
  ],
})
