import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-iconbutton-children'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-iconbutton-children', rule, {
  valid: [
    `<IconButton icon={<Icon icon={IconX} />} aria-label="Close" />`,
    `<IconButton icon={IconX} aria-label="Close" />`,
    `<Button>OK</Button>`, // not IconButton
  ],
  invalid: [
    {
      code: `<IconButton aria-label="Submit"><Icon icon={IconArrowRight} /></IconButton>`,
      errors: [{ messageId: 'iconButtonChildren' }],
      output: `<IconButton aria-label="Submit" icon={<Icon icon={IconArrowRight} />} />`,
    },
    {
      code: `<IconButton aria-label="Close"><IconX /></IconButton>`,
      errors: [{ messageId: 'iconButtonChildren' }],
      output: `<IconButton aria-label="Close" icon={<IconX />} />`,
    },
    {
      code: `<IconButton icon={<IconX />} aria-label="X"><span>extra</span></IconButton>`,
      errors: [{ messageId: 'iconButtonChildrenWithIcon' }],
      output: null,
    },
  ],
})
