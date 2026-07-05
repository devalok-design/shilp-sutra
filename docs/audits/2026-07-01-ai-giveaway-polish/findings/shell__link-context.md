# shell/link-context — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:1 P3:1

## Summary
`shell/link-context.tsx` is a 6-line re-export shim; the real implementation lives in
`packages/core/src/ui/lib/link-context.tsx`. It is a **headless router-bridge context** —
no surface, no CVA, no motion, no visual rendering except a bare `<a>` fallback. Almost the
entire visual/motion/composability rubric is N/A by construction. It composes cleanly, is
correctly typed, has a test + doc, and ships zero AI visual/verbal tells of consequence.
The only findings are minor: one em-dash tic in prose docs (P2) and a doc/API parity nit (P3).

## Findings

### [P2][E1] Em-dash used as stylistic connector in the component doc
- **Category:** verbal-tell
- **Evidence:** `packages/core/docs/components/shell/link-context.md:32` — `` "The framework router bridge for all shell components.** Without LinkProvider, AppSidebar / BottomNavbar / TopBar.UserMenu / AppCommandPalette render plain `<a>` tags — that means full page reloads..." `` (also `:19` "render plain `<a>` tags", `:43` "returns the registered component or falls back", `:44` "shell-specific because shell components embed link arrays — can't use asChild per-item"). Multiple `—` used as sentence connectors, not numeric ranges.
- **Why:** The em-dash-as-connector is one of the flagged E1 verbal tells; docs are studio-voice output and should read as authored, not model-averaged.
- **Fix:** Recast with a period, colon, or parenthetical. e.g. "…render plain `<a>` tags, which means full page reloads." / "shell-specific because shell components embed link arrays (can't use asChild per-item…)".

### [P3][I/J] Doc prop table describes `component` loosely vs. the exported type
- **Category:** docs / types
- **Evidence:** doc `link-context.md:11-12` says `component: ForwardRefComponent (e.g. Next.js Link, Remix Link)`; source type is the precise `LinkComponent = ForwardRefExoticComponent<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string } & RefAttributes<HTMLAnchorElement>>` (`ui/lib/link-context.tsx:5-7`). The `href: string` requirement (which forces `href` to be non-optional on the injected component) is not surfaced in the doc.
- **Why:** Minor parity gap — a consumer passing a `Link` whose `href` is optional would still satisfy the type, but a consumer whose component omits `href` in its props type would fail `tsc` with no doc hint why.
- **Fix:** Note in the doc that the component's props must include `href: string` (all named routers qualify).

### [Note — not a finding] `LinkComponent` type is inferred-but-not-exported
- `LinkComponent` (`ui/lib/link-context.tsx:5`) is the return type of `useLink()` and is not exported. Consumers wanting to type a variable holding the result of `useLink()` can rely on inference, and the doc frames the return as `LinkComponent`. Borderline I-category (inferred-but-not-exported prop type), but the hook return is fully inferable and no public prop surface leaks an anonymous type, so I am not flagging it as a defect. Exporting it would be a nice-to-have for advanced consumers.

## Composability gaps
- None. This IS the composability primitive — it's the router-bridge slot the whole shell family consumes via `useLink()`. It correctly uses React context (single-copy safe), provides a sensible default (bare `<a>`) so `useLink()` never throws outside a provider (verified by the test at `link-context.test.tsx:39-42`), and the shell doc (`:44`) correctly explains why shell uses this context rather than `asChild` (data-driven link arrays can't take per-item `asChild`). F1–F6 are N/A: no bespoke corner-props, no DOM surface needing `asChild`, no >8-prop flat component, no base-primitive re-roll, and no controlled/uncontrolled state (it's a static registry).

## Motion gaps
- None applicable. Headless context — renders no animated element. M1–M5 N/A.

## Polish plan (ordered steps to reach the finish bar)
This unit is already at the finish bar. Only cosmetic doc tidy-up:
1. Rewrite the two em-dash connectors in `link-context.md` (`:32`, `:44`) with periods/parentheticals (E1).
2. Add the `href: string` requirement to the doc's `component` prop description (P3 parity).
3. Optional future: export the `LinkComponent` type for consumers who want to annotate `useLink()` results.

## Clean (rubric dims that pass)
- **V1–V15 (visual tells):** N/A — no surface, no color, no CVA, no font, no imagery. The fallback `<a>` carries zero styling. No accent rail, gradient, blob, or palette tell possible.
- **M1–M5 (motion):** N/A — headless.
- **S1–S4 (structural, docs):** doc is minimal and load-bearing; no colored section backgrounds, no page-chrome filler, no SaaS skeleton.
- **E2–E8 (verbal):** clean — no contrastive negation, no AI-vocab, no meta-hedging, no chatbot artifacts, no tricolon padding. (Only E1 flagged.)
- **F1–F6 (composability):** clean — see above; it's the archetypal headless context primitive.
- **G1–G5 (drift/vocabulary):** N/A — no tokens, no surfaces, no variant axes to drift.
- **H (state coverage):** clean for its kind — provides a default so `useLink()` never fails without a provider; test covers both with-provider and no-provider paths, plus an axe check (`link-context.test.tsx:26-35`).
- **I (types):** clean — precise `LinkComponent` type (no `any`, no `color?: string`, no `React.FC`), `HTMLAnchorElement` (specific, not `HTMLElement`), `DefaultLink` uses `forwardRef` + `displayName` (`ui/lib/link-context.tsx:9-14`), `LinkProviderProps` exported.
- **J (docs parity):** doc exists and matches the exported surface (`LinkProvider`, `useLink`); test exists. Note: no `*.stories.tsx` — acceptable, a headless context has nothing to render in Storybook, so the "missing story = publish gate" rule doesn't bite here.
