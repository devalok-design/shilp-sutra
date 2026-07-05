# ui/aspect-ratio — audit
**Finish score:** 5/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:0 P2:1 P3:2

## Findings

### [P3][V9] `cn(className)` is a redundant no-op wrapper
- **Category:** structural-tell
- **Evidence:** aspect-ratio.tsx:13 — `className={cn(className)}`
- **Why:** `cn()` over a single value does nothing but pay a `clsx`/`tw-merge` call; it reads like a copy-paste reflex from components that actually merge a base class. There is no base class here, so it can be `className={className}` (or dropped, since the primitive already spreads it).
- **Fix:** `className={className}` and drop the `cn` import, or remove the explicit `className` handling entirely and let `{...props}` carry it. Cosmetic only — no behavior change.

### [P2][J] No story coverage for the `forced-colors` / object-cover image pattern the doc prescribes
- **Category:** docs / state-coverage
- **Evidence:** aspect-ratio.stories.tsx:12-34 — only `Default` (16:9) and `Square` (1:1), both rendering a coloured placeholder `<div>`, never an `<img className="object-cover w-full h-full">`.
- **Why:** The doc's headline usage (aspect-ratio.md:14-18, :22) is a responsive image with `object-cover`. The "child must fill" gotcha (md:28) is the single most common consumer mistake, and no story demonstrates the correct image pattern. This is a polish/parity gap, not a tell — the component itself is correct.
- **Fix:** Add an `Image` story rendering a real `<img className="object-cover h-full w-full rounded-surface">` inside the ratio box, plus optionally a `Portrait` (3/4) story so the prop's range is shown.

### [P3][H] Test asserts the Radix-internal `100 / ratio` formula rather than the public contract
- **Category:** state-coverage / types
- **Evidence:** aspect-ratio.test.tsx:43 — `expect(wrapper.style.paddingBottom).toBe('100%')`
- **Why:** Minor — this couples the test to the vendored primitive's padding-bottom implementation. Not a defect (it passes, and `describeConformance` covers ref/className/displayName), just a brittleness note. Acceptable for a vendored-primitive passthrough.
- **Fix:** Optional — leave as-is; if the primitive ever switches to the native CSS `aspect-ratio` property this test would need updating, which is the intended signal.

## Composability gaps
- **None.** This is the F-section ideal: it composes the base primitive directly (F5 ✓ — does not re-roll layout), forwards `ref` to `ComponentRef<typeof Root>` and spreads all `ComponentPropsWithoutRef<typeof Root>` (F1/F3 ✓ — no bespoke corner-props, no flat-prop bloat). `asChild` (F2) is not applicable: AspectRatio is a layout-math wrapper, not a polymorphic element; consumers polymorph the *child*, not the box. Controlled/uncontrolled (F6) is N/A — no state.
- The doc explicitly documents the "child fill" composition contract (md:20-24) and that it works inside Card and any flex/grid container with nothing to configure. That is the correct composability posture for a primitive of this kind.

## Motion gaps
- **None applicable.** AspectRatio has no interactive state and no entrance/exit — it is a static layout box, so M1–M5 do not apply. No bounce-by-default, no missing reduced-motion guard (there is no motion to guard), no animated layout props. Correct to ship motionless.

## Polish plan (ordered steps to reach the finish bar)
1. (P2) Add an `Image` story using a real `<img className="object-cover h-full w-full">` to demonstrate the doc's prescribed pattern and the "child must fill" gotcha; optionally add a 3/4 `Portrait` story.
2. (P3) Replace `className={cn(className)}` with `className={className}` and drop the now-unused `cn` import (aspect-ratio.tsx:6,13).
3. (P3, optional) Leave the padding-bottom test as the intentional canary for a primitive implementation change; no action required.

## Clean (rubric dims that pass)
- **A. Visual tells (V1–V8):** clean. No accent rail, no double edge, no gradient text, no framework palette, no emoji, no blob/glass/glow, no rounded-everything, no pill spam. The component ships **zero color and zero radius** of its own — it is a transparent layout box.
- **B. Visual reflexes (V9–V15):** clean (modulo the cosmetic `cn` no-op noted as P3). No hardcoded font, no decorative numbering, no eyebrow kicker, no hero, no all-caps, no AI imagery.
- **C. Motion (M1–M5):** N/A — no motion by design, correct.
- **D. Structural (S1–S4):** clean — single component, no colored section backgrounds, no page chrome.
- **E. Verbal (E1–E8):** clean. Doc and JSDoc are terse and prescriptive. No em-dash tic used as a stylistic connector beyond standard prose, no contrastive negation, none of the AI-vocabulary list, no meta-hedging, no empty openers/closers, no chatbot artifacts, no forced tricolon, no over-structuring. (Note: the Card/StatCard exemplars carry the "feel free to combine props creatively!" E5-ish closer in JSDoc; AspectRatio does **not** — it is cleaner than the exemplar here.)
- **F. Composability (F1–F6):** clean — composes the primitive, forwards ref, spreads props, no bespoke props. Best-in-class for a passthrough.
- **G. Drift + vocabulary (G1–G5):** clean. No surface applied (G1 N/A — it is transparent, correctly not forcing surface-1), no re-rolled tokens (the only style comes from the vendored primitive's inline padding-bottom math, which is the legitimate aspect-ratio technique, not a hardcoded design token), no variant axes to drift, no soft-vs-outline question.
- **H. State coverage (H):** clean for a non-interactive layout box — no focus/hover/press/disabled/loading states exist. `forced-colors`, RTL, dark all pass trivially because it paints nothing. `describeConformance` (test:7-14) covers ref forwarding, className passthrough, and displayName.
- **I. Types + API (I):** clean and exemplary — `forwardRef<ComponentRef<typeof Root>, ComponentPropsWithoutRef<typeof Root>>`. No `any`, no stringly-typed enums, no `React.FC`, specific ref element, `displayName` set (aspect-ratio.tsx:18). `ratio` is correctly typed `number` (inherited from the primitive), and the doc's gotcha reinforces number-not-string.
- **J. Docs parity (J):** doc exists (aspect-ratio.md), prop table matches source (`ratio: number`), stories exist (publish gate satisfied). Only gap is the missing image-pattern story (logged P2 above).
