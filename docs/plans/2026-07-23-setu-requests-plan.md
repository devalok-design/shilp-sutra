# Setu Requests — Response Plan (2026-07-23)

**Source:** `setu/docs/technical/shilp-sutra-requests.md` (filed 2026-07-23). Setu is on `@devalok/shilp-sutra@0.49.2`, Next 16 + React 19 + TW4. Launch Aug 5 2026. Setu = brand-consistency + versioned-content product (drafts → pending → committed, human review).

**Scope decided (2026-07-23):** full Diff (text + structured + review), enhance RadarChart, markdown mode via official Tiptap ext, document sanitization. Neither HIGH item blocks Aug 5 (Setu has stopgaps); we ship the proper DS versions because on-brand + reusable across Devalok versioned-content products.

---

## Competitive benchmark (why these are worth doing right)

| Area | State of the art | Our position / decision |
|---|---|---|
| **Diff viewer** | **No major DS ships one** — Carbon, MUI, Ant, Radix, shadcn have none. Standalone only: `react-diff-view` (git-unified-diff, token system, virtualization), `react-diff-viewer-continued` (split/inline/word), raw `diff`/jsdiff. | **Gap = differentiation.** Wrap jsdiff (`diff`) + own token-themed render. Setu passes `before`/`after` **strings**, not git unified diffs → rules out react-diff-view. |
| **RTE markdown** | Tiptap shipped **official v3 markdown ext** `@tiptap/markdown` (`getMarkdown()`, `contentType:'markdown'`, bidirectional/CommonMark). | We're on TipTap v3. **aguingand/tiptap-markdown v3 compat risk is moot** — use the official ext. Verify MIT license before install (Tiptap *Conversion* docx/pdf is paid; markdown ext is free). |
| **Radar many-axes** | MUI X: `labelOrientation="rotated"\|"horizontal"`, per-angle `textAnchor`. amCharts: circular/radial/adjusted + wrap + truncate + auto-fit. | Ours hardcoded 3–8, no rotate/wrap/truncate → labels clip/overlap at 13. Enhance to mirror MUI/amCharts. |
| **MD sanitization** | react-markdown safe-by-default (no `rehype-raw`). | **Already correct.** Answer + document; optional hardening. |

---

## Item 1 — Diff / version-compare viewer · NEW · HIGH · ~1.5 day

**Engine:** `diff` (jsdiff) as a runtime dep. `diffLines` / `diffWordsWithSpace` from two strings. Headless engine + own render — same "wrap a headless engine, own the look" pattern as charts (d3) and data-table (TanStack).

**API (base = Setu spec):**
```
<Diff
  before={string} after={string}
  mode="inline" | "split" | "fields"   // default inline; "fields" = structured
  granularity="line" | "word"          // for text modes
  language?: "yaml" | "markdown" | "text"
/>
```

**Beyond the request (the differentiators):**
1. **`mode="fields"` structured diff** — parse YAML/JSON, diff by **key** (added/removed/changed), not text lines. Setu's structured dims are `{format:'yaml', data}`; a semantic key diff beats a noisy text diff. Setu marked this "nice v2" — we ship it now.
2. **Review affordances** — `onAcceptHunk?(hunk)` / `onRejectHunk?(hunk)` + optional per-hunk accept/reject controls. Setu's core loop *is* accept/reject pending-vs-committed. A diff that ships the review controls > a pure viewer.
3. **Token-native + a11y** — `surface-2` container, `Badge` for +N/−N counts, `forced-colors` support, reduced-motion, keyboard hunk navigation, `role`/aria on hunks.

**Tasks:**
1. Add `diff` runtime dep (bundled per manualChunks policy; check vendor-utils allowlist vs isolated chunk).
2. `packages/core/src/composed/diff.tsx` — CVA for mode/density; text render (inline+split, line+word); structured (fields) render; review-control slots. `// @server-safe` where render body is SSR-safe (diff compute is pure).
3. Wire exports: `src/index.ts` + subpath `./composed/diff` (subpath-export gate).
4. `diff.stories.tsx` (text inline/split/word, fields, review controls, long-content) — stories are a publish gate.
5. `diff.test.tsx` — RTL + vitest-axe (added/removed/changed, split alignment, accept/reject callbacks fire, empty/identical inputs).
6. Docs: `docs/components/diff.md` (##Props + ##Example — per-component docs coverage gate) + make-kit guide `make-kit/components/diff.md` + `components/overview.md` row + mcp-manifest entry (regenerated at build).
7. Surface audit: card-like → `bg-surface-2`; overlay controls per surface rules.

**Setu stopgap (until shipped):** wraps `react-diff-viewer-continued` in local `<BrandVersionDiff>`, swaps to DS.

---

## Item 2 — rich-text-editor markdown mode · ENHANCEMENT · HIGH · ~0.5 day

**Approach:** official `@tiptap/markdown` (TipTap v3). **Verify MIT/open-source on npm before install.**

**API (back-compat):**
```
<RichTextEditor
  format="markdown" | "html"   // new; default "html"
  content={string}             // interpreted per format
  onChange={(value: string) => void}   // emits markdown when format="markdown"
/>
```
- Bidirectional: `getMarkdown()` out, `setContent(..., { contentType:'markdown' })` in. Mirror on `RichTextViewer`.
- Guard: markdown mode must round-trip the extensions we enable (headings 2–3, lists, task lists, links, highlight, blockquote, code). Mentions/emoji/file-attachment are custom nodes — decide serialization (drop to text or custom md rule) and document.

**Beyond the request:** fix the **false JSDoc** at `rich-text-editor.tsx:385` — *"Outputs sanitized HTML via `onChange`"* is wrong; TipTap `getHTML()` is **not** sanitized. Either make it true (sanitize the html path) or correct the claim. Markdown mode sidesteps it for Setu, but the lie misleads other consumers.

**Tasks:**
1. Add `@tiptap/markdown` (peer or dep per TipTap peer pattern). Confirm license.
2. `rich-text-editor.tsx` — add Markdown extension, `format` prop, branch `onChange`/`content` handling in editor + viewer.
3. Fix line-385 JSDoc.
4. Stories (markdown in/out story) + tests (round-trip md, html back-compat, custom-node serialization).
5. Docs + make-kit `rich-text-editor.md` prop-surface update + mcp-manifest.

**Setu stopgap:** `textarea` + `markdown-viewer` preview.

---

## Item 3 — markdown-viewer sanitization · VERIFY/DOCUMENT · HIGH ·  ~0.5 day

**Answer (verified against `markdown-viewer.tsx` + `react-markdown@^10`, no `rehype-raw`):**
- `allowHtml={false}` (default) → `skipHtml={true}` → raw HTML **dropped entirely**. Safe.
- `allowHtml={true}` → `skipHtml={false}` → raw HTML rendered as **escaped text, NOT executed** (no `rehype-raw` → react-markdown never parses HTML to DOM; no raw-HTML injection API used). Safe.
- react-markdown v10 `defaultUrlTransform` strips `javascript:`/`vbscript:`/unsafe `data:` on `href`/`src`. Links + images sanitized.
- **Verdict:** no XSS vector in either mode. Setu can render public brand content. The `allowHtml` name is misleading — it toggles *strip* vs *escape-as-text*, never enables live HTML.

**Beyond the request:**
1. Document the guarantee in `docs/components/markdown-viewer.md` + make-kit (explicit XSS-safety note).
2. Optional hardening: add `rehype-sanitize` on the `allowHtml={true}` path so that mode is genuinely safe if ever flipped (belt-and-suspenders; currently unneeded).
3. Clarify `allowHtml` doc/prop semantics.

**Tasks:** docs/make-kit note; (optional) rehype-sanitize wiring + test; JSDoc clarity on `allowHtml`.

---

## Item 4 — RadarChart at ~13 axes · ENHANCE · MEDIUM · ~1 day

**Problem (verified in `radar-chart.tsx`):** JSDoc says "3-8 axes". At 13: no label wrap/rotate/truncate; `radius = svgSize/2 - 40` leaves 40px margin; long dimension names overflow (SVG outer overflow hidden → clipped); ~27.7° slices → top/bottom `middle`-anchored labels overlap.

**Path A (chosen) — enhance radar** to mirror MUI/amCharts:
- Auto label **rotation** past a threshold axis count (radial orientation) OR **truncation** with full-label tooltip.
- **Dynamic outer margin** computed from longest label (replace hardcoded `- 40`).
- Responsive sizing keeps labels inside SVG bounds.
- Update JSDoc range to the real supported count; document recommended max + bar-list fallback for extreme counts.

**Tasks:**
1. `radar-chart.tsx` — label layout pass (rotate/truncate/margin), threshold prop or auto.
2. Update `RadarChartProps` JSDoc (`axes` no longer "3-8").
3. Stories: add 13-axis Brand-Health-style story.
4. Tests: 13-axis renders without clip/overlap regression (snapshot or bounding assertions).
5. Docs/make-kit note on max axes + fallback recipe.

---

## Committed beyond-scope (decided 2026-07-23)

Scope expanded past the 4 asks → **Tier A polish + 2 review primitives**. Rest (VersionTimeline, Provenance tag, ColorInput `contrastAgainst`, md-viewer callouts) **parked pending Setu confirmation** — do NOT build on spec.

**Folded into Item 1 (Diff):**
- Collapse unchanged regions (GitHub-style "expand N lines") — table-stakes for long brand-book content.
- Summary header: +N/−N counts, "N fields changed", jump-to-change nav.
- Intra-line word-level highlight in split mode (not just line-level).
- Composable parts: `Diff.Summary` / `Diff.Hunk` / `Diff.Controls` (matches Progress Root/Track direction).

**Folded into Item 2 (RTE markdown):**
- Source toggle: WYSIWYG ↔ raw-markdown view (trivial once markdown mode lands).

**Folded into Item 4 (Radar):**
- Target/benchmark ring overlay (coverage vs target — Setu Brand-Health).
- Click-axis drill-down callback.

**Radar axis descriptions (added on review):** `axisDescriptions?: string[]` — hovering an axis label shows the dimension's description in the chart tooltip. Setu's Brand-Health dimensions each get an explainer on hover.

**DROPPED (2026-07-23, user call): `<VersionBadge>` + `<ReviewBar>`.** Both are pure compositions of existing primitives (Badge + a status→style lookup; Button row + sticky div) with zero novel behavior — they'd only grow API surface for something Setu can compose in ~10 lines. Diff earns its slot (new engine, no existing primitive does it); these don't. Built + reviewed in Storybook, then deleted. Trade-off accepted: cross-product lifecycle-colour consistency isn't centralised. Optional lightweight capture if wanted later: a **make-kit "review screen" recipe** (docs only, no component surface) composing Diff + Badge + Button.

**Parked (Setu-confirm round before build):** VersionTimeline, `<Provenance>` AI/human/agency tag, ColorInput `contrastAgainst`, md-viewer callouts/admonitions.

## Sequencing & publish

Order by value/risk: **1 → 2 → 3 → 4**. Item 1 first (biggest differentiation, no external unknowns).

**Publish gate (all items):** CVA/prop accuracy, stories, tests (RTL+axe), per-component docs coverage, make-kit + mcp-manifest, surface/shadow hygiene, subpath-export ordering, typecheck/lint/build/SSR-smoke. Run `pnpm verify` before push; `node scripts/pre-publish-audit.mjs` pre-flight. New exported symbols → sweep whole repo (site/playground/smoke-consumer/stories) before Version PR (0.49.0 lesson).

**Versioning:** Diff = new component (minor). Markdown mode = additive `format` prop defaulting `html` → **non-breaking** (widening). Radar enhancement = behavioral, JSDoc range change; confirm no prop **narrowing**. Sanitization = docs (+ optional dep). Changesets per item.

**Setu follow-up:** after publish, send DS Notice (`/send-karm-notice` pattern, but to Setu) — new `Diff`, `RichTextEditor` markdown mode, sanitization guarantee, radar max-axes guidance.
