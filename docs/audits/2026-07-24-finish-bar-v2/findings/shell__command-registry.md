# shell/command-registry — finish-bar audit
Finish: 4/5   Market: PARITY (peer: cmdk)   Rebuild: polish

Headless unit: a typed React Context, `CommandRegistryProvider` (renders only `<Context.Provider>`, zero DOM chrome), and a read-only `useCommandRegistry()` hook returning `CommandRegistry | null`. It ships no visual surface, no CVA, no motion, no styling — so the visual, a11y-DOM, motion, content-resilience, and theming batteries are **N/A by construction**. Scoring focuses on the axes that can apply to a provider/hook: API/composability, docs, testing, state coverage, system cohesion, craft, and benchmark.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| 1. visual-integrity | N/A | Emits no markup of its own — nothing to accent-rail, gradient, over-round, or edge-soup. No `border-card-strong`, no `rounded-ds-*`/`rounded-full`, no magic numbers. |
| 2. accessibility | N/A | Headless — renders no interactive DOM. A11y lives in the consuming `AppCommandPalette`. The one contract detail (null outside provider) is honored. |
| 3. api-composability | ✓ | Canonical typed surface: `icon: IconInput` (not `ReactNode`/`any`), all interfaces exported, hook explicitly typed `CommandRegistry \| null`, `createContext(null)` default correctly signals "outside provider", `displayName` set. Fully consumer-controlled `registry` prop — correct for a registry (no internal mutation, no mis-named onChange). Minor design-evolution note: fixed `pages`/`adminPages` arrays are slightly rigid vs a `sections: {id,label,items,adminOnly?}[]` shape — not a defect. |
| 4. docs-dx | gap | Two narrative-parity drifts persist (carried from 2026-07-01, both unfixed): `Introduction.mdx:32` promises a "register, unregister, search" programmatic API that does not exist; `command-registry.md:44` claims the palette "filters based on `isAdmin` flag … avoid leaking them to regular users" — an access-control guarantee the component never enforces. Also: doc prop table (`command-registry.md:16`) types `icon: ReactNode` while source is the narrower `IconInput`. No standalone story — acceptable for a headless provider (would be theater), covered via AppCommandPalette + unit tests. |
| 5. testing | ✓ | Unit + RTL + `renderHook`: renders children, provides registry via hook, returns `null` outside provider, item-structure assertions. Strong coverage for a headless unit. No `vitest-axe`/`describeConformance` — correctly N/A (nothing to render/conform). |
| 6. motion | N/A | No animation is expected or appropriate for a provider. No reduced-motion concern. |
| 7. state-coverage | ✓ | The one meaningful state — used-outside-provider → `null` — is implemented and explicitly tested. No loading/empty/error states apply to a data provider. |
| 8. content-resilience | N/A | Passes `children` through untouched; registry is caller-owned data. No overflow/i18n/RTL surface. |
| 9. theming-resilience | N/A | No tokens, no surface, no radius — nothing to survive an accent-9 or `[data-shape]` swap. |
| 10. system-cohesion | ✓ | Uses the canonical `IconInput` type and matches sibling shell-provider patterns (LinkProvider). No bespoke drift; feels like one system. |
| 11. craft | ✓ | The unseen detail done right: `createContext<CommandRegistry \| null>(null)` so the hook can honestly report "no provider" rather than returning a fake default. `displayName` for DX. |
| 12. perceived-performance | gap | Provider passes `registry` straight to `value` without memoizing. A consumer passing an inline object literal re-renders every subscriber on each parent render. Low impact (registry is typically static app-config data) but a `useMemo`/documented "pass a stable reference" note would harden it. |
| 13. market-benchmark | PARITY | Peer archetype is cmdk (Command). cmdk is the menu itself; our registry is a separate provider feeding `AppCommandPalette`. As a headless typed provider it's clean and idiomatic — neither ahead nor behind cmdk, which simply doesn't split this concern out. |
| 14. cross-DS-adoption | — | See ideas below. |

## Top gaps (prioritized)
- [P1] docs-dx — `Introduction.mdx:32` advertises a `register/unregister/search` imperative API that doesn't exist → rewrite to the real contract ("supplies the page/adminPage registry consumed by AppCommandPalette").
- [P1] docs-dx — `command-registry.md:44` implies automatic admin access-control ("avoid leaking to regular users") the component doesn't enforce → soften to "the split lets *you* populate `adminPages` conditionally per the signed-in role"; document the real gating mechanism.
- [P2] docs-dx — prop table types `icon` as `ReactNode` but source is `IconInput` (narrower) → align the doc to source.
- [P2] perceived-performance — memoize the context `value` (or document a stable-reference requirement) to avoid whole-tree re-renders on inline-registry consumers.
- [P3] api (design evolution, defer) — consider a `sections: {id,label,items,adminOnly?}[]` shape so "admin" isn't a hardcoded second array; would generalize the palette.

## What it does well
- Correctly headless: no invented DOM, no styling — it does exactly one job (typed context) and nothing more.
- `null`-default context + explicit `CommandRegistry | null` return so consumers can detect a missing provider — and that path is unit-tested.
- Canonical `IconInput` type on `CommandPageItem.icon` (matches the DS-wide icon contract), all interfaces exported, `displayName` set.
- Fully consumer-controlled `registry` prop — the right contract for caller-owned data; no fake mutation API.

## Cross-DS adoption ideas
- cmdk supports **dynamic/async command sources** and command **groups with headings** — our registry is two static arrays. A `sections` model (label + items + optional `adminOnly`) would let the palette render grouped, role-gated sections without the hardcoded `adminPages` split, and open the door to async-loaded command groups.
- cmdk / Raycast-style palettes rank by **recency/frequency**; a registry could carry an optional `priority`/`recent` hint so `AppCommandPalette` can order results without each consumer re-implementing ranking.

## Rebuild note
**Polish, not rebuild.** The unit is structurally correct and well-typed — the only real work is docs-parity (kill the phantom `register/unregister/search` API in Introduction.mdx and the false `isAdmin` access-control claim in the component doc, align the `icon` type) plus an optional `useMemo` on the context value. No source-shape change is warranted; the `sections` idea is a deferred design evolution, not a finish-bar blocker.
