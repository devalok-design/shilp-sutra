# shell/command-registry — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:2 P3:2

## Context
`command-registry.tsx` is a **headless** unit: a typed React Context, a `CommandRegistryProvider` that renders only `<Context.Provider>` (no DOM chrome), and a `useCommandRegistry()` hook. It ships no visual surface, no motion, no CVA, no styling. Consequently the entire visual battery (V1–V15), motion battery (M1–M5), structural battery (S1–S4), and most drift/vocabulary dims (G1–G5) are **N/A by construction** — there is nothing to paint, animate, or surface. It cannot carry an AI visual tell because it emits no markup of its own. Scoring focuses on the dims that *can* apply to a headless provider/hook: types (I), API/composability contract (F6), docs parity (J), and verbal tells in its prose (E).

The two real findings are docs-parity drift, both P2. The unit is otherwise clean and well-typed.

## Findings

### [P2][J] Introduction.mdx describes API that does not exist ("register, unregister, search")
- **Category:** docs / drift
- **Evidence:** `packages/core/src/shell/Introduction.mdx:32` — `| **CommandRegistryProvider** | Programmatic command management (register, unregister, search) |`
- **Why:** The source exposes exactly one input — a fully-formed `registry` object passed as a prop — and a read-only hook. There is no `register`, `unregister`, or `search` method anywhere in `command-registry.tsx` (or in `app-command-palette.tsx`, which does its own filtering). The MDX overview promises a programmatic/imperative command API the component never implements. This is the classic docs-vs-source drift the rubric's source-of-truth rule (`llms-full.txt` / CVA / source wins) targets.
- **Fix:** Change the description to match reality, e.g. `| **CommandRegistryProvider** | Supplies the page/adminPage command registry consumed by AppCommandPalette |`. Do not add register/unregister/search unless you actually build that API.

### [P2][J] Doc claims `AppCommandPalette` filters on an `isAdmin` flag it doesn't take
- **Category:** docs
- **Evidence:** `packages/core/docs/components/shell/command-registry.md:44` — `the palette filters based on user role / \`isAdmin\` flag. Keep admin-only routes in the adminPages array to avoid leaking them to regular users.`
- **Why:** `app-command-palette.tsx` reads `registry.pages` / `registry.adminPages` from the hook but there is no `isAdmin`/role prop that gates `adminPages` — the doc implies an access-control guarantee ("avoid leaking them to regular users") that the component does not enforce. A consumer trusting this could ship admin routes to every user. Cross-check the sibling `app-command-palette.md` and the actual palette props before publishing this claim.
- **Fix:** Either document the real gating mechanism (how the consumer must decide what to put in `adminPages`), or soften to "the registry separates pages from adminPages so *you* can populate adminPages conditionally per the signed-in user's role." Remove the implied automatic access control.

### [P3][E1] Em-dash-as-connector cadence in the doc prose
- **Category:** verbal-tell
- **Evidence:** `command-registry.md:42-45` — "**Place at app root** — wrap both…", "**Separation of pages vs adminPages** — the palette…", "**useCommandRegistry()** is the consumer hook — returns…", "**Works with LinkProvider** — CommandPaletteItems…". Four consecutive bullets, each a bold lead-in followed by ` — `.
- **Why:** Uniform "bold term — explanation" em-dash rhythm across every bullet is a mild AI-cadence tell (E1/E8). Load-bearing, not egregious, but it reads as generated boilerplate rather than authored notes.
- **Fix:** Vary the bullets: use a colon for the definitional ones, drop the connector where the sentence stands alone. Low priority — this is house-doc prose, not shipped studio-voice copy.

### [P3][docs] No standalone story (acceptable for a headless provider, but note it)
- **Category:** docs
- **Evidence:** No `command-registry.stories.tsx` exists (only `app-command-palette.stories.tsx` in `packages/core/src/shell/`).
- **Why:** The publish gate (J) requires a story for public components. A pure context provider/hook has no visual state to demonstrate, so a Storybook story would be theater — its behavior is exercised through `AppCommandPalette`'s stories and its own unit tests. This is the correct call, not a gap; flagged only so synthesis doesn't re-raise it as a missing-story P1. If the team wants formal coverage, an MDX note under AppCommandPalette's docs suffices.

## Composability gaps
- **None material.** For a headless registry the "content goes through slots not props" model (F1) does not apply — the payload *is* data (`CommandPageItem[]`), correctly typed, not JSX corner-injection. `asChild` (F2) is irrelevant: the provider renders no DOM element to polymorph. It is not re-rolling a base primitive (F5) — there is no surface to compose. The one adjacent thought: `pages` vs `adminPages` as two fixed arrays is slightly rigid (a future multi-section registry — e.g. `sections: {label, items}[]` — would compose better and kill the "admin is special" hardcoding), but that's a design-evolution note, not a shipped tell. Not flagging as a finding.

## Motion gaps
- **N/A.** Headless provider — no entrance/exit/feedback motion is expected or appropriate. M1–M5 do not apply. No reduced-motion concern because nothing animates.

## Polish plan (ordered steps to reach the finish bar)
1. Fix `Introduction.mdx:32` to describe the actual API (no register/unregister/search). (P2)
2. Correct or soften the `isAdmin`/"avoid leaking to regular users" claim in `command-registry.md:44` so it doesn't imply access control the component doesn't provide. (P2)
3. Re-word the four `— ` connector bullets in the doc for varied cadence. (P3)
4. (Optional, design evolution — not required for finish) Consider a section-based registry shape (`sections: {id,label,items,adminOnly?}[]`) so "admin" isn't a hardcoded second array; would generalize the palette. Defer.

## Clean (rubric dims that pass)
- **V1–V15 (visual tells):** N/A — emits no markup of its own; nothing to accent-rail, gradient, or over-round.
- **M1–M5 (motion):** N/A — no animation.
- **S1–S4 (structural):** N/A — not a page/doc layout.
- **E2–E8 (verbal):** Clean. No contrastive negation, no AI vocab (delve/robust/seamless/leverage etc.), no meta-hedging, no chatbot artifacts, no unfilled placeholders. Only the E1 cadence nit above.
- **F1–F5 (composability):** Appropriate for a headless data provider — data payload not slots, no DOM to polymorph, not re-rolling a primitive.
- **F6 (controlled/uncontrolled):** Correct. A registry is inherently consumer-owned; a fully-controlled `registry` prop with no internal mutation is the right contract — no missing `defaultValue`, no mis-named `onChange`.
- **G1–G5 (drift/vocabulary):** N/A — no surface, no tokens, no CVA variant axes, no hardcoded px/hex/shadow. Nothing to drift.
- **I (types):** Strong. `CommandPageItem.icon` uses the canonical `IconInput` type (not `ReactNode`/`any`); all interfaces (`CommandPageItem`, `CommandRegistry`, `CommandRegistryProviderProps`) are exported; hook return is explicitly typed `CommandRegistry | null`; `useContext` default is `null` so the hook correctly signals "outside provider." No `any`, no `React.FC`, no stringly-typed enums, no `color?: string`. `displayName` set on the provider.
- **H (state coverage):** The one meaningful state — used-outside-provider → `null` — is implemented (`createContext<... | null>(null)`) and explicitly tested (`command-registry.test.tsx:44-47`). Provider/hook happy paths and item structure are also tested. Good coverage for a headless unit.
- **J (docs parity, item accuracy):** The per-component `command-registry.md` prop table itself matches the source (`CommandRegistry`, `CommandPageItem` shapes, hook return). The parity failures are the *narrative* claims flagged above, not the prop table.
