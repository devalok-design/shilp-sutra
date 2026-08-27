import { RuleTester } from '@typescript-eslint/rule-tester'

import rule from '../../src/rules/no-renamed-surface-token'

const tester = new RuleTester({
  languageOptions: {
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
})

tester.run('no-renamed-surface-token', rule, {
  valid: [
    '<div className="bg-surface-panel">x</div>',
    '<div className="hover:bg-surface-panel-hover">x</div>',
    '<div className="bg-surface-base border-surface-border">x</div>',
    'const c = cn("bg-surface-sunken")',
    // Not a surface utility, and not a prefix we own
    '<div className="shadow-surface-raised">x</div>',
    '<div>x</div>',
  ],
  invalid: [
    // --- plain rename: a container stays a container
    {
      code: '<div className="bg-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="bg-surface-panel">x</div>',
    },
    {
      code: '<div className="bg-surface-raised-hover">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="bg-surface-panel-hover">x</div>',
    },

    // --- THE IMPORTANT ONE: a state must retarget, not rename.
    // Renaming this to bg-surface-panel would be invisible in light mode.
    {
      code: '<div className="hover:bg-surface-raised">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="hover:bg-surface-panel-hover">x</div>',
    },
    {
      code: '<div className="focus:bg-surface-raised">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="focus:bg-surface-panel-hover">x</div>',
    },
    {
      code: '<div className="data-[state=open]:bg-surface-raised">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="data-[state=open]:bg-surface-panel-hover">x</div>',
    },
    {
      code: '<div className="active:bg-surface-raised-hover">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="active:bg-surface-panel-active">x</div>',
    },

    // --- dark:/md: are NOT states. A background stays a background.
    {
      code: '<div className="dark:bg-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="dark:bg-surface-panel">x</div>',
    },
    {
      code: '<div className="md:bg-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="md:bg-surface-panel">x</div>',
    },
    // ...even stacked with a state, where the state still wins
    {
      code: '<div className="dark:hover:bg-surface-raised">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="dark:hover:bg-surface-panel-hover">x</div>',
    },

    // --- the removed chrome token
    {
      code: '<div className="bg-surface-chrome">x</div>',
      errors: [{ messageId: 'chrome' }],
      output: '<div className="bg-surface-base">x</div>',
    },

    // --- must reach strings that are NOT jsx className: cn(), cva variants
    {
      code: 'const c = cn("bg-surface-raised", x)',
      errors: [{ messageId: 'renamed' }],
      output: 'const c = cn("bg-surface-panel", x)',
    },
    {
      code: "const v = { default: 'bg-surface-raised hover:bg-surface-raised' }",
      errors: [{ messageId: 'retargeted' }],
      output: "const v = { default: 'bg-surface-panel hover:bg-surface-panel-hover' }",
    },

    // --- whitespace shape is preserved
    {
      code: '<div className="flex  bg-surface-raised   p-2">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="flex  bg-surface-panel   p-2">x</div>',
    },

    // --- REGRESSION: a template literal must be reported but NEVER autofixed.
    // A TemplateElement's range covers its delimiters, so replacing it with bare
    // text destroys the backtick and the ${ seam. This corrupted a real file.
    {
      code: 'const c = `rounded-surface bg-surface-raised p-2 ${token}`',
      errors: [{ messageId: 'renamed' }],
      output: null,
    },
    {
      code: 'const c = `${a} hover:bg-surface-raised`',
      errors: [{ messageId: 'retargeted' }],
      output: null,
    },

    // --- REGRESSION: hyphenated prefixes. A first pass matched only [a-z]+ and
    // silently skipped ring-offset-surface-raised.
    {
      code: '<div className="ring-offset-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="ring-offset-surface-panel">x</div>',
    },
    {
      code: '<div className="border-t-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="border-t-surface-panel">x</div>',
    },

    // --- REGRESSION: an opacity modifier must survive the rewrite.
    {
      code: '<div className="bg-surface-raised-hover/30">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="bg-surface-panel-hover/30">x</div>',
    },
    {
      code: '<div className="hover:bg-surface-raised/40">x</div>',
      errors: [{ messageId: 'retargeted' }],
      output: '<div className="hover:bg-surface-panel-hover/40">x</div>',
    },

    // --- every prefix that maps to the surface namespace
    {
      code: '<div className="border-surface-raised text-surface-raised">x</div>',
      errors: [{ messageId: 'renamed' }],
      output: '<div className="border-surface-panel text-surface-panel">x</div>',
    },
  ],
})
