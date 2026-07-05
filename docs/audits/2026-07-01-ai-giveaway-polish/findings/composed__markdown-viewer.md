# composed/markdown-viewer — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:1 P2:4 P3:3

MarkdownViewer is a restrained, well-behaved leaf renderer. It is token-bound throughout,
strips HTML by default, lazy-loads the highlighter, gives headings slug anchors, and has a
real conformance test + axe pass. It carries **no P0 AI tells** — no accent rail on a card,
no gradient text, no emoji icon system, no indigo/violet brand palette, no rounded-everything,
no glow/blob. The gaps are polish + a couple of API/vocabulary nits, not slop.

## Findings

### [P1][V4/G2] Hardcoded `one-dark` Prism theme forces a permanently-dark code block that ignores our surface tokens
- **Category:** drift
- **Evidence:** markdown-viewer.tsx:87 — `import('react-syntax-highlighter/dist/esm/styles/prism/one-dark')`; :99 fallback uses `bg-surface-sunken` (theme-aware) while the highlighted path :108-121 renders the vendored `one-dark` palette (fixed dark bg, off-token colors) regardless of light/dark mode.
- **Why:** The plain `<pre>` fallback is theme-aware (`bg-surface-sunken`), but once the highlighter hydrates the block flips to a hardcoded third-party dark palette — a visible mode-flicker in light mode and a color vocabulary that isn't ours. A permanently-dark code panel on a light page is a recognizable "shipped a library default" tell.
- **Fix:** Either (a) accept dark code blocks deliberately and make the fallback match (`bg-surface-sunken` should be dark too, documented as intentional), or (b) drive the highlighter from a theme-aware style (light/dark pair) and wrap the block in `bg-surface-sunken rounded-control` so the surface is ours and the flicker is gone.

### [P2][I] `linkTarget?: string` is stringly-typed
- **Category:** types
- **Evidence:** markdown-viewer.tsx:45 — `linkTarget?: string`; used at :184 `target={linkTarget}` and gated at :186 `linkTarget === '_blank'`.
- **Why:** Rubric I flags `color?: string`-style stringly enums. Only `_blank`/`_self`/`_parent`/`_top` are meaningful, and the `rel` safety logic only special-cases `_blank`; a typo (`"blank"`) silently drops the `noopener` guard.
- **Fix:** `linkTarget?: React.HTMLAttributeAnchorTarget` (or `'_blank' | '_self' | '_parent' | '_top'`). Export the type.

### [P2][F1] No `components` override escape hatch — every element renderer is hardcoded
- **Category:** composability
- **Evidence:** markdown-viewer.tsx:143-244 — the entire `components={{...}}` map is baked in; there is no prop to merge/override individual renderers (link, code, img, table).
- **Why:** A consumer who needs a routed `<Link>` for internal hrefs, a different image loader, or a custom code renderer must fork the component. The `components` map IS the slot system for a markdown renderer; not exposing a merge point is the leaf-renderer analog of a bespoke-prop-instead-of-slot gap.
- **Fix:** Accept an optional `components?: Components` (react-markdown's type) and shallow-merge it over the defaults, so consumers can override one element without losing the styled set.

### [P2][H] State/story coverage gaps: `allowHtml`, RTL, forced-colors, reduced-motion, empty
- **Category:** state-coverage
- **Evidence:** markdown-viewer.stories.tsx:68-132 — only Default, Compact, CodeBlock; no story exercises `allowHtml`, long-content/RTL, or forced-colors. Test file (markdown-viewer.test.tsx) covers empty + a11y but no `allowHtml` path and no directional/forced-colors assertion.
- **Why:** Rubric H expects applicable states demonstrated. The security-critical `allowHtml` toggle (the highest-risk prop) has neither a story nor a test; the copy-button hover-reveal and heading-anchor hover-reveal have no reduced-motion coverage.
- **Fix:** Add an `AllowHtml` story (trusted snippet) + a test asserting HTML is stripped when `allowHtml={false}` and passed when `true`; add a long-form/RTL story.

### [P2][M3/M4] Hover-reveal opacity transitions have no reduced-motion guard, and the reveal-only affordance is a discoverability gap
- **Category:** motion
- **Evidence:** markdown-viewer.tsx:69 CopyButton `opacity-0 group-hover:opacity-100 transition-opacity`; :148/:159/:170 heading anchors `opacity-0 group-hover:opacity-100`.
- **Why:** Rubric M3 — animated properties with no `prefers-reduced-motion` path (low-stakes here since it's opacity, hence P2 not P1). Separately, copy + anchor are hover-only: invisible on touch and to keyboard users until focus, so the copy action isn't reliably reachable.
- **Fix:** Add `motion-reduce:transition-none`; make the copy button visible on `:focus-visible` (`group-focus-within:opacity-100 focus-visible:opacity-100`) so it's keyboard/touch reachable, not just hover.

### [P3][E1] Doc uses em-dash as a stylistic connector
- **Category:** verbal-tell
- **Evidence:** docs/components/composed/markdown-viewer.md:25 `**Built on react-markdown + remark-gfm** — GFM tables...`; :27 `stripped by default — \`allowHtml={true}\``; :28 `by default** (...) — Override via`.
- **Why:** Rubric E1 bans `—` as a stylistic connector (en dash for numeric ranges only). Multiple occurrences in the doc.
- **Fix:** Replace with a period or restructure ("stripped by default. Set `allowHtml={true}` only for trusted content.").

### [P3][G3] `compact` boolean instead of the canonical `size`/density axis
- **Category:** vocabulary
- **Evidence:** markdown-viewer.tsx:41 `compact?: boolean`; drives spacing at :135-136.
- **Why:** A two-state density expressed as a boolean sits off the canonical `size` (xs/sm/md/lg/xl) taxonomy. Not wrong for a two-state case, but it's a vocabulary drift from siblings and can't grow to a third density without an API break.
- **Fix:** Low priority. If a third density ever appears, migrate to `density`/`size`. Fine to leave for now — flag only.

### [P3][H] Heading hierarchy collapses (h2 and h3 render identically)
- **Category:** state-coverage
- **Evidence:** markdown-viewer.tsx:158 h2 `text-ds-md font-semibold`; :169 h3 `text-ds-md font-semibold` — same size/weight; only top-margin differs.
- **Why:** h2 and h3 are visually indistinguishable, weakening document structure for long content. Not an AI tell, but a finish gap vs. a real type scale.
- **Fix:** Give h3 a smaller size or muted weight so the three levels read as a hierarchy.

## Composability gaps
- No `components` override prop — consumers can't swap the link/code/img renderer without forking (F1). This is the single most impactful composability gap; a routed internal-`<Link>` is a common real need.
- No `remarkPlugins`/`rehypePlugins` passthrough — the plugin set (`remarkGfm`) is fixed; consumers can't add e.g. `remark-math` without forking.
- Not a base-primitive drift case (F5): a markdown renderer legitimately does not compose Card — it renders arbitrary flow content, so re-using Card's surface would be wrong. No finding here.

## Motion gaps
- Hover-reveal opacity transitions (copy button, heading anchors) lack `motion-reduce:transition-none` (M3).
- Copy affordance and heading anchor are hover-only — no `:focus-visible`/touch path, so on touch + keyboard the affordance never appears (M4-adjacent + a11y discoverability). The copy button itself is a real `<Button>` so it's focusable, but it stays visually hidden until hover.
- No entrance/exit motion — correct restraint for a document renderer; not a gap.

## Polish plan (ordered steps to reach the finish bar)
1. Fix the code-block surface (P1): wrap in `bg-surface-sunken rounded-control` and either make the highlighter theme-aware or accept dark deliberately + match the fallback, killing the light-mode flip.
2. Tighten types (P2): `linkTarget?: React.HTMLAttributeAnchorTarget`, exported.
3. Add a `components?: Components` (and optionally `remarkPlugins`) merge point (P2) so the renderer is extensible without a fork.
4. Reveal copy + anchor on focus-visible and add `motion-reduce:transition-none` (P2 motion + a11y).
5. Add `AllowHtml` story + strip/allow test; add long-form/RTL story (P2 state coverage).
6. De-em-dash the doc (P3) and differentiate h3 from h2 in the type scale (P3).

## Clean (rubric dims that pass)
- **V1 accent rail:** none. The blockquote `border-l-2 border-surface-border-subtle` (:209) is the universal typographic blockquote convention on non-card flow content with a neutral subtle token — not an accent rail on a shadowed card. Not a tell.
- **V2 double-edge / V6 blob-glass-glow / V7 rounded-everything:** none. Radii are token-bound (`rounded-control`, `rounded-control-inner`), no glass/blur/glow.
- **V3 gradient text:** none.
- **V4 framework palette as brand:** none — links use `text-accent-11`, everything else surface/semantic tokens. (The `one-dark` code palette is flagged above as drift, but it's a vendored code-theme, not a brand-accent misuse.)
- **V5 emoji icons:** none — uses Icon API (`IconCopy`, `IconCheck`) and a literal `#` glyph for anchors.
- **V8 pill spam / V10 decorative numbering / V12 eyebrow / V14 all-caps:** none.
- **E2–E8 verbal tells:** the source JSDoc/comments are clean; notably it does NOT carry the "feel free to combine props creatively!" filler closer that Card/StatCard JSDoc have. Only E1 in the doc (P3 above).
- **G1 surface layering:** correct — a content renderer, not a card; uses `bg-surface-sunken` for code/inline-code/table-header, no illegal `bg-surface-1`.
- **G2 tokens:** strong — `mb-ds-*`, `mt-ds-*`, `px-ds-*`, `rounded-control*`, `text-ds-*`, `leading-ds-relaxed`; highlighter `customStyle` binds to `var(--radius-ds-md)`, `var(--text-ds-sm)`, `var(--spacing-ds-04)`. The only raw values are `px-1.5 py-0.5` on inline code (:200) — minor, not worth a finding.
- **Security posture:** `skipHtml={!allowHtml}` strips HTML by default; `allowHtml` is an explicit, documented trusted-content opt-in (a choice, not a tell). `rel="noopener noreferrer"` correctly applied for `_blank`.
- **Types (mostly):** `forwardRef` + `displayName` + `HTMLDivElement` ref present; extends `React.HTMLAttributes<HTMLDivElement>`. Only `linkTarget: string` and the internal `any` on the lazy highlighter modules (:81, eslint-disabled, acceptable for a dynamic import) are loose.
- **Tests/docs parity:** conformance helper adopted; empty-content and axe covered; doc prop table matches the CVA-less prop surface.
