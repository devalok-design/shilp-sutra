# Lens 3 — Layer Enforcement

**Compiled:** 2026-05-09 (principal-architect audit)
**Scope:** All imports across `packages/core/src/**.{ts,tsx}`
**Rubric:** [`00-best-practices.md`](./00-best-practices.md) § 1 (Architecture & layering)

## Executive summary

ESLint boundary rule is **active and broadly correct**. Audit found **2 direct violations (P1)** and **6 architectural concerns (P2)** to address before 1.0 freeze.

ESLint config (`eslint.config.js` lines 85-130) enforces:
- `ui/` cannot import from `composed/`, `shell/`, or domain layers
- `composed/` cannot import from `shell/`
- `shell/` cannot import from domain layers

**Gap:** the `ai/` layer has no boundary rule — it can import from any layer without constraint.

## Layer dependency graph (current state)

```
                       ai/
                      / | \
                     /  |  \
              motion/ hooks/ \
                /     /      \
               /     /        \
             ui/ ←─── composed/ ←── shell/
              │
        primitives/   (vendored Radix, no @server-safe annotation = client-only)

Legend:
  →  valid (downstream → upstream / closer to primitives)
  ←  P1 violation found this run
  motion/, hooks/  =  sibling utility layers (orthogonal to hierarchy)
```

## Findings

| # | Severity | Pattern | Component(s) | Issue | Fix | Effort |
|---|---|---|---|---|---|---|
| 1 | **P1** | Direct layer violation (shell→composed) | `shell/app-command-palette.tsx:15` | Imports `CommandPalette`, `CommandGroup`, `CommandItem`, `CommandPaletteProps`, `FooterHint` from `../composed/command-palette`. ESLint rule SHOULD flag this — verify why it didn't | Either: (a) move CommandPalette logic into shell/ since the shell wrapper depends on it, (b) refactor shell to use composition without importing CommandPalette directly, or (c) accept the dependency and document explicit cross-layer pairing in CONTRIBUTING.md | M |
| 2 | **P1** | Direct layer violation (ai→composed) | `ai/command-bar.tsx:25`, `ai/command-bar.stories.tsx:20` | Imports `CommandGroup`, `CommandItem` types from `../composed/command-palette`. The ai/ layer has NO ESLint boundary rule, so this passes silently | Add `no-restricted-imports` rule to eslint config covering `ai/` layer: must not import from `composed/`, `shell/`. Then either move shared command types to `ui/` (or a sibling `types/` layer), or duplicate the types in `ai/` | S (rule) + M (refactor) |
| 3 | P2 | Cross-layer utility undocumented | `motion/motion-provider.tsx` | All four layers (ui, composed, shell, ai) import from this file. Pattern is intentional (motion is a sibling utility layer) but the contract is not documented | Add JSDoc to motion-provider explaining it's an orthogonal layer; update CONTRIBUTING.md § Module Boundaries with an "Orthogonal layers" subsection | S |
| 4 | P2 | Hooks barrel re-exports component API | `hooks/index.ts` | Re-exports `toast` from `ui/toast`, conflating behavioral utilities (hooks) with component-emitted singletons | Remove `toast` re-export from hooks barrel. Consumers should import `toast` from the root export or `ui/toast` per llms.txt's setup playbook. Hooks layer stays purely behavioral | S |
| 5 | P2 | Re-export across layers without alias | `shell/link-context.tsx` | Re-exports from `ui/lib/link-context`. Well-documented in source but pattern is not advertised in CONTRIBUTING.md as canonical | Document in CONTRIBUTING.md as the canonical pattern when shell needs to surface a ui-layer context to its consumers | S |
| 6 | P2 | Dual import paths for motion utilities | `ui/lib/motion.ts` ↔ `motion/index.ts` | Same exports reachable via two paths. Creates ambiguity for new contributors | Pick canonical path (recommend `motion/`); deprecate (with JSDoc) the other; CHANGELOG entry pointing to the chosen path | S |
| 7 | P2 | Test files cross layers without restriction | `__tests__/ssr-render.test.tsx` imports from composed; `ai/__tests__/command-bar.test.tsx` imports `CommandGroup` from composed | ESLint ignores `.test.tsx` for the boundary rule | Document in CONTRIBUTING.md § Testing that test files MAY import types across layers for fixture setup, but should avoid importing implementations across layers (use mocks instead) | S |
| 8 | P2 | [arch-judgment] Path alias underused | `tsconfig.json` paths field defined but source uses relative imports throughout | Inconsistent — some imports `../../ui/X`, others `../ui/Y`. Path aliases (`@/ui/*`) would be more refactor-safe | Pick one convention (relative or alias) and codify in CONTRIBUTING.md. If alias: codemod to update all imports. If relative: remove unused path aliases from tsconfig | S decision, M codemod |

## What ESLint catches vs misses

**Catches** (verified working):
- Direct imports between layers covered by the boundary rule
- (Most) circular dependencies via `import/no-cycle` if enabled

**Misses**:
- The `ai/` layer entirely (no rule defined for it — finding #2)
- Implicit coupling via shared React contexts (finding #3 — motion provider crosses all layers, contract undocumented)
- Re-exports that bridge layers (finding #5 — `shell/link-context.tsx` re-exports from `ui/lib/link-context`)
- Test files (by design, finding #7)
- Import-path-style consistency (finding #8)

## Verification

- Grepped every `import\s+(\{[^}]+\}|\*|\w+)\s+from\s+['"](\.\.[^'"]+)` in src
- Cross-checked against eslint.config.js boundary rule matrix
- Spot-checked 30+ files for layer-respect, found no additional violations beyond findings 1+2
- No circular dependency detected via repository-wide pattern scan

## Pre-1.0 checklist

- [ ] Add `no-restricted-imports` for `ai/` layer (covers `composed/`, `shell/`)
- [ ] Refactor or document `shell/app-command-palette` → `composed/command-palette` dependency
- [ ] Add JSDoc to `motion/motion-provider.tsx` documenting orthogonal-layer status
- [ ] Update CONTRIBUTING.md § Module Boundaries with: orthogonal layers, re-export conventions, test-file policy, import-path style decision
- [ ] Run `pnpm lint && pnpm test` to confirm fixes don't break anything

## Verdict

**Layer rule is well-implemented.** Two direct violations need fixing before 1.0 freeze (P1 effort: ~3 hours). Six P2 findings are documentation/clarity improvements that can ship in any minor. No fundamental architectural problems detected.
