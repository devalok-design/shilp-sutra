# Upgrading shilp-sutra safely

A version bump is **not** safe-by-default. Breaking changes in this design system are often type-level (prop types narrowed, symbols moved between barrels) and only surface at `tsc`/build time — never assume a bump is low-risk before doing the checks below.

> **Hard rule for AI agents:** On ANY version bump, do not report the upgrade as safe before you have read the COMPLETE changelog **and** `MIGRATION.md` for the target version, grepped the consumer codebase for moved/renamed/narrowed symbols, and run `typecheck` + `build`. Breaking entries are frequently ordered LAST in the changelog (changesets orders by file, not severity) — skimming the top and relaxing is the #1 failure mode.

## Step 1 — read the full breaking surface

1. Open the target version's section in `node_modules/@devalok/shilp-sutra/CHANGELOG.md` (or the GitHub release). **Read all of it**, not just the top.
2. Open `node_modules/@devalok/shilp-sutra/MIGRATION.md` and read every section from your current version up to the target.
3. Scan for these signals — each is a potential break:
   - `feat!` / `BREAKING` headers
   - "removed", "moved", "renamed", "narrowed", "no longer exported"
   - any prop **type** change (a narrowing — new type accepts less than the old — fails `tsc` for values that compiled before)
   - peer-dependency changes (a symbol now imported from a per-component subpath instead of the barrel)

## Step 2 — find affected call sites in your code

**Fastest path — read the machine-readable manifest:**

```bash
# Lists every break per version as structured data (moves, narrowings, removals)
cat node_modules/@devalok/shilp-sutra/BREAKING.json
```

Or programmatically:

```js
import manifest from '@devalok/shilp-sutra/BREAKING.json'
// manifest.versions["0.40.0"].moved        → [{ symbol, from, to, peer, eslintRule }, …]
// manifest.versions["0.40.0"].narrowed     → [{ prop, components, from, to, fix }, …]
```

Schema: `@devalok/shilp-sutra/BREAKING.schema.json`. AI agents should prefer this over prose-parsing CHANGELOG.

**Or grep manually:**

```bash
# Symbols moved out of barrels (0.40.0 peer-cliff cleanup example):
grep -rn "from '@devalok/shilp-sutra/ui'" src/ | grep -E "Toaster|toast|InputOTP"
grep -rn "from '@devalok/shilp-sutra/composed'" src/ | grep -E "DatePicker|EmojiPicker|FilePreview|MarkdownViewer|RichTextEditor|RichChatInput"
grep -rn "from '@devalok/shilp-sutra/ai'" src/ | grep -E "BlockRenderer|ErrorBlock|TextBlock"

# Type narrowings — find icon sources annotated as the wide React.ReactNode:
grep -rn "React.ReactNode" src/ | grep -i "icon"
```

## Step 3 — let the ESLint plugin do the mechanical work

```bash
pnpm add -D @devalok/eslint-plugin-shilp-sutra
# one-shot codemod: repoints moved barrel imports + flags deprecated APIs
pnpm eslint --fix --config node_modules/@devalok/eslint-plugin-shilp-sutra/migration src/
```

The `prefer-per-component-import` rule autofixes barrel→subpath moves and splits multi-symbol lines correctly. It cannot retype your own annotations — narrowings (Step 4) are still manual.

## Step 4 — typecheck + build BEFORE deploy

```bash
pnpm typecheck && pnpm build
```

This is the gate that catches type narrowings the changelog may have under-described. Two real examples from 0.40.0:

- **Barrel peer-cliff cleanup (breaking):** `import { Toaster } from '@devalok/shilp-sutra/ui'` → `import { Toaster } from '@devalok/shilp-sutra/ui/toaster'`. 12 symbol families. Full table in `MIGRATION.md → v0.40.0`.
- **Icon API narrowing:** the unified `IconInput` type excludes `string`/`number`/iterables that `React.ReactNode` allowed. If you stored icons in a `Record<string, React.ReactNode>` map or `icon?: React.ReactNode` field and passed them to a migrated component (`CommandItem.icon`, `ActivityItem.icon`, `Chat.Message.Avatar`), retype the source to `React.ReactElement`.

## Step 5 — only now is the bump "safe"

Report the upgrade as complete only after Steps 1-4 pass. If anything in the changelog was ambiguous, prefer a per-prop `expectTypeOf` probe over assuming "non-breaking".
