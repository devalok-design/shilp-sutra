# Surface model — implementation audit

**Completed 2026-08-27**, on `feat/surface-model` (5 commits, 285 files,
+1918 / −658 against `main`).

Audits the *execution* of the plan, not the design. The design is in
[`2026-08-26-surface-model-rebuild.md`](../plans/2026-08-26-surface-model-rebuild.md);
the pre-implementation measurement is in
[`2026-08-26-surface-model-ds-audit.md`](./2026-08-26-surface-model-ds-audit.md).

---

## Verification

Every gate run, nothing assumed.

| | result |
|---|---|
| `pre-publish-audit` (45 gates) | **all passed**, 2 advisory warnings |
| Core tests | **1,329 passed**, 103 files |
| eslint-plugin tests | **139 passed**, 16 files |
| Typecheck | clean |
| Lint, all packages | **0 errors** (241 warnings, all pre-existing) |
| SSR smoke, 152 entry points | passed |
| `audit-contrast` | **10/10 pairings** clear WCAG AA |
| `audit-compiled-css` | **261/261** classes emit CSS, 0 missing |
| Real consumer build | new utilities compile and resolve correctly |
| `pnpm-lock.yaml` | untouched |

`fg-muted` on `surface-sunken` measures **7.006:1** in the audit — independently
matching the 7.06 measured in Figma before any code changed.

## Scale

| | |
|---|---:|
| surface token references migrated | **352** |
| — retargeted (state on a container value) | 37 |
| — renamed | 315 |
| control borders split to the interactive tier | 20 |
| panel-level shadows removed | 7 |
| deprecated numbered tokens cleared from stories | 24 |
| CSS custom-property references rewritten | 31 |
| packages/apps migrated | core, brand, site, playground |
| class-form references to old tokens remaining | **0** |

---

## What went wrong during implementation

Recording these because each was caught by measurement rather than by looking,
and three would have shipped.

### 1. The codemod corrupted a file on its first run

`TemplateElement.range` covers the literal's delimiters, so replacing it with
bare text destroyed the backtick and the `${` seam:

```
className={`rounded-surface bg-surface-raised p-ds-06 ${token}`}
        →  className={rounded-surface bg-surface-panel p-ds-06 token}`}
```

Reverted, made template chunks report-only, added two regression tests. Any
template literal in any consumer codebase would have hit this.

### 2. `git checkout -- packages/core/src` silently wiped the token work

Reverting the corrupted codemod run also reverted the CSS token edits, which
live under the same path. The components then referenced tokens that **did not
exist** — every surface would have rendered unstyled.

**The tests still passed.** They assert class *names*, not computed styles. It
was caught only by grepping the built `dist/tokens/semantic.css` for the new
tokens and finding zero. A green test suite proved nothing here.

### 3. `--fix` stripped three `eslint-disable` comments

The minimal codemod config didn't define `no-console`, so ESLint judged those
directives unused and removed them. Restored, and
`reportUnusedDisableDirectives: 'off'` added to the codemod config.

### 4. The first codemod run touched 222 files instead of 132

Running `--fix` with the full config also applied every *other* autofixable rule
to stories that had never been linted. Re-scoped to a config containing only the
migration rule.

### 5. Two silent gaps in the rule's own regex

`ring-offset-surface-raised` (hyphenated prefix, the pattern was `[a-z]+`) and
`bg-surface-raised-hover/30` (opacity modifier). Both found by grepping for what
*survived* the codemod rather than trusting its report. Widened, with tests.

### 6. `input`'s focus border became fainter than its resting state

Once decorative borders went translucent, `focus-within:border-surface-border`
resolved to `#e8e8e8` against a resting `#b7b7b7` — focusing an input made its
edge disappear. Now `focus-within:border-accent-7`, matching select and combobox.

### 7. The A1 count in the pre-implementation audit was wrong

It said 141 retargets. The real number is **37**: my grep used
`bg-surface-raised\b`, and `\b` matches before a hyphen, so it swept in 105 uses
of `hover:bg-surface-raised-hover` that were already correctly targeted.
Corrected in place with a note.

### 8. I migrated only `packages/core` at first

`brand`, `site` and `playground` all used the tokens too. Found because the
brand package's lint went from 0 errors to 2 — the gate caught what I had not.

---

## Gates that were themselves wrong

Two existing gates passed while checking something that no longer existed.

**`audit-contrast` asserted light `surface-base` as `neutral-2`.** The rebuild
moved it to `neutral-0`, so the gate was measuring a pairing the system does not
have — and passing. Retargeted and widened from 4 pairings to 10, now covering
panel, hover and sunken in both themes.

**The lint gate could not see stories.** `**/*.stories.tsx` sat in a global
`ignores` block, and a global ignore **cannot be re-included by a later `files`
block** — my first attempt to widen it was dead code. Stories are removed from
the global ignore, general rules switched off for them, token rules left on.

## Pre-existing failures closed on the way

Both from #269, already on `main`, both release-blocking:

- `diff` imports `react-syntax-highlighter` but was missing from the recipe §2a
  peer tables — a consumer following the recipe would fail at build.
- `data-table-bulk-actions` forwards `action.icon` to `Button.startIcon`, which
  normalizes; allowlisted with the same reasoning as its `composed/` sibling.

---

## Not done

Deliberately out of scope for this branch:

- **The shell layout primitive** — a bar spanning above both sidebar and canvas.
  `SidebarProvider` renders a single flex row, so the G and H arrangements still
  have no code equivalent. Figma-only.
- **The four shell presets** (A, C, G, H).
- **Publishing.** Nothing is published; the Figma library is unpublished too.
  They ship together or drift.
- **The dark tint is barely visible** (`#0a0a0a` → `#0f080a` at Strong). Known
  and accepted — dark has little headroom. Revisit if it grates in use.

## Two things to watch

**`surface-panel` is the same white as `surface-base` in light.** Correct by
design, but it means "is this the right surface?" cannot be answered by sampling
a colour. It has to be read from intent. Any future audit that samples pixels
will report false agreement.

**The deprecated aliases hide mistakes.** `surface-raised` still resolves, so a
consumer who skips the codemod sees no error — just the same invisible hovers
they have today. The lint rule is the only thing that surfaces it.
