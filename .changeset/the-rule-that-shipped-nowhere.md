---
'@devalok/eslint-plugin-shilp-sutra': minor
---

Ship `no-ungated-hover-over-selection` — it was in zero presets

The rule was implemented, registered, given a docs page and shipped in **none of
the six presets**, including `strict`, whose own header says "everything at
`error`". Nobody opted out because nobody was opted in: for a full release the
one automated guard against an invisible selection state was dead code (#315).

That is the rule that catches this —

```
.hover\:bg-surface-panel-hover:hover   (0,2,0)   <- wins
.bg-accent-4                           (0,1,0)
```

— an ungated hover outranking a conditional selected background, so pointing at
the selected row visually deselects it. It has shipped three times inside this
design system (`TreeItem`, `TableRow`, `MasterDetail`) and turned up twice more
in consumer repos that had this plugin installed and lint passing green.

Now:

| Preset | Severity |
|---|---|
| `recommended`, `flat/recommended` | `warn` |
| `strict`, `flat/strict` | `error` |
| `migration`, `flat/migration` | not included — it has no autofix |

**`recommended` is `warn`, not `error`, on purpose.** Unlike the migration rules
this one judges *existing* code rather than a deprecated API, so a repo that has
always spelt selection this way would go red on upgrade — and a preset that goes
red on upgrade gets switched off. `strict` carries it at `error` for repos that
want the gate. `migration` is a codemod preset and this rule has no autofix:
both corrections (gate the hover, or give the active state its own hover) are
legitimate and look different, so there is nothing for `--fix` to do.

`meta.docs.recommended` moved `error` → `warn` to match, because
`scripts/generate-rule-docs.mjs` states preset membership from the metadata
rather than from the presets — the published page had been advertising a
severity consumers were not getting.

**Guards so this cannot recur.** `tests/configs.test.ts` now asserts that
`strict` contains every registered rule at `error`, that `recommended` covers
every rule, that `migration` is exactly the migration-category rules, that each
flat preset matches its legacy twin byte for byte, and that
`meta.docs.recommended` agrees with the severity actually shipped. Every one of
those checks would have caught the original omission.

The README's rule table was five rules out of date on top of that — it claimed
12 rules and 9 autofixes against an actual 17 and 10. `no-renamed-surface-token`,
`no-subtle-text-on-sunken`, `require-mutation-annotation` and
`require-progress-label` were missing from it too, and are now listed.

**If you are on `strict`, expect new errors.** They are real: each one is a
selected row that clears its own tint when you point at it.
