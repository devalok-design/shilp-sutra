import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-deprecated-button-variant'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-deprecated-button-variant', rule, {
  valid: [
    '<Button variant="solid">OK</Button>',
    '<Button variant="soft" color="error">Delete</Button>',
    '<Button>OK</Button>',
    '<div variant="default">Not a Button</div>',
  ],
  invalid: [
    {
      code: '<Button variant="default">OK</Button>',
      errors: [{ messageId: 'deprecatedVariantDefault' }],
      output: '<Button variant="solid">OK</Button>',
    },
    {
      code: '<Button variant="destructive">Delete</Button>',
      errors: [{ messageId: 'deprecatedVariantDestructive' }],
      output: '<Button variant="solid" color="error">Delete</Button>',
    },
    {
      code: '<Button variant="destructive" color="success">Wat</Button>',
      errors: [{ messageId: 'deprecatedVariantDestructive' }],
      output: '<Button variant="solid" color="success">Wat</Button>',
    },
    {
      code: '<Button color="default">OK</Button>',
      errors: [{ messageId: 'deprecatedColorDefault' }],
      output: '<Button color="accent">OK</Button>',
    },
    {
      code: '<SplitButton variant="default">OK</SplitButton>',
      errors: [{ messageId: 'deprecatedVariantDefault' }],
      output: '<SplitButton variant="solid">OK</SplitButton>',
    },
  ],
})
