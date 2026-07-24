# composed/markdown-viewer — finish-bar audit
Finish: 4/5   Market: PARITY   Rebuild: polish

A restrained, well-behaved leaf renderer: token-bound throughout, strips HTML by
default, lazy-loads the highlighter with a graceful plain-`<pre>` fallback, gives
headings slug anchors, and ships a real conformance + axe test. **No P0, no slop
tells** (no accent rail, gradient text, emoji, glow/blob, rounded-everything).
The gaps are the same polish/vocabulary nits the 2026-07-01 baseline (4/5) called
out — **none appear to have been applied** since. It holds at 4/5.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Role radii (`rounded-control`, `rounded-control-inner`), correct surface use (`surface-sunken` for code/inline/table-head — content renderer, not a card). Two tells: the hardcoded vendored `one-dark` highlighter palette is a permanently-dark "library default" that ignores our tokens; h2 & h3 render identically (`text-body-md font-semibold`), collapsing hierarchy. |
| accessibility | gap | Slug ids + `aria-hidden` anchors, `rel="noopener noreferrer"` on `_blank`, axe pass, conformance. **P1:** CopyButton is `opacity-0 group-hover:opacity-100` only — invisible on keyboard focus (2.4.7 focus-not-visible) and never appears on touch, so code-copy is unreachable on mobile (the Chat message-body use case). `<th>` lacks `scope`. |
| api-composability | gap | `forwardRef`+`displayName`, extends `HTMLAttributes`. But **no `components` override** (the slot system for a markdown renderer — consumers must fork for a routed `<Link>`/img loader), **no `remarkPlugins`/`rehypePlugins` passthrough**, `linkTarget?: string` is stringly-typed (typo drops the `noopener` guard), `compact` boolean sits off the canonical `size`/density axis. |
| docs-dx | ✓ | Doc has Props/Defaults/Example/Composability/Gotchas and matches source. Minor: em-dash used as stylistic connector (×3); no Types section (linkTarget documented as bare string). |
| testing | gap | conformance + axe + rendering/headings/links/code/lists/blockquote/compact/empty/className. Missing: the security-critical `allowHtml` strip-vs-allow test (highest-risk prop, untested), RTL, forced-colors. |
| motion | gap | Correct restraint (no entrance motion for a doc renderer). But hover-reveal opacity transitions (copy button, heading anchors) have **no `motion-reduce:transition-none`** guard. |
| state-coverage | gap | Empty handled + tested; loading = highlighter fallback `<pre>` (nicely designed). But `allowHtml` path undesigned in stories, and copy/anchor affordances have no focus-visible state. No error state — acceptable for a renderer. |
| content-resilience | gap | Strong overflow: tables wrapped `overflow-x-auto`, code `overflow-x-auto`, `img max-w-full loading="lazy"`, `leading-ds-relaxed` for long body. **But physical properties throughout** (`pl-ds-*`, `border-l-2`, `mr-ds-02`) — breaks RTL; no logical-property use, no RTL story. |
| theming-resilience | gap | Theme-aware tokens everywhere **except** the code block: the `one-dark` import is a fixed dark palette that ignores light/dark, so a light page flips from a theme-aware `surface-sunken` fallback to a hardcoded dark panel on hydration. Separately, `borderRadius: 'var(--radius-ds-md)'` (inline style, :115) bypasses the radius **role** layer, so it won't track `[data-shape]` presets like the role tokens do. |
| system-cohesion | gap | Uses DS `Button`, `Icon`, surface/accent tokens, role radii. Drift points: the `one-dark` palette and the raw `--radius-ds-md` primitive break the "one system" feel for the code block specifically. |
| craft | ✓ | Heading `#` anchor-on-hover, lazy highlighter with seamless fallback, `img loading="lazy"`, copy-timer cleanup on unmount, `replace(/\n$/, '')` trim on fenced code. Real, felt details. |
| perceived-performance | ✓ | Highlighter lazy-loaded off the critical path with a padded fallback (minimal shift), lazy images, instant copy feedback (check icon, 2s). |
| market-benchmark | PARITY | Peer: react-markdown/GitHub-Markdown/Shiki-based renderers, ChatGPT/Claude/Vercel AI SDK message rendering. At parity on structure, GFM, security default, lazy highlight. **Lags** Shiki-based peers on theme-aware code (dual light/dark via CSS vars, no runtime flip) and lags Radix/AI-SDK renderers on the `components` override + plugin passthrough. |
| cross-ds-adoption | gap | Concrete imports available (see below). |

## Top gaps (prioritized)
- [P1] accessibility — CopyButton invisible on focus (`opacity-0 group-hover:*`) and unreachable on touch → add `group-focus-within:opacity-100 focus-visible:opacity-100`; this is the mobile Chat use case, so it's functional loss, not cosmetic.
- [P1] theming-resilience / visual-integrity — hardcoded `one-dark` code palette flips light→dark on hydration and ignores the token system → either drive the highlighter from a theme-aware light/dark style pair, or commit to dark deliberately and make the `surface-sunken` fallback dark too (kill the flicker). Baseline P1, still open.
- [P2] api-composability — no `components?: Components` merge point and no `remarkPlugins`/`rehypePlugins` passthrough → shallow-merge consumer overrides over the defaults so a routed `<Link>`/custom img/extra plugin doesn't force a fork.
- [P2] api-composability — `linkTarget?: string` → narrow to `React.HTMLAttributeAnchorTarget` (or the 4-value union), exported; the `rel` safety logic only special-cases `_blank`, so a typo silently drops `noopener`.
- [P2] motion + testing — add `motion-reduce:transition-none` to the reveal transitions; add an `allowHtml` strip/allow test (security-critical) + a long-form/RTL story.
- [P2] content-resilience — swap physical spacing/border props (`pl-`, `border-l`, `mr-`) for logical properties so RTL markdown lays out correctly.
- [P3] visual-integrity — differentiate h3 from h2 (smaller size or muted weight); de-em-dash the doc; consider `var(--radius-control)` instead of `var(--radius-ds-md)` for the highlighter corner.

## What it does well
- Zero AI-slop tells; genuinely restrained. Correct surface layering for a flow-content renderer (no illegal `bg-surface-1`).
- Security-first default: `skipHtml={!allowHtml}`, explicit trusted-content opt-in, `noopener noreferrer` on external links.
- Lazy highlighter with a graceful, token-bound fallback and no jank; images lazy + capped width; copy-timer cleaned up on unmount.
- Slug-anchored headings with an unobtrusive `#` affordance — real docs-site craft.
- Real test discipline: conformance helper + axe + empty-content + link/rel + compact assertions.

## Cross-DS adoption ideas
- **Shiki (VS Code themes)** renders dual light+dark via CSS variables with no runtime theme flip — adopt to fix the `one-dark` P1 and make code blocks track our tokens.
- **react-markdown's own `components` prop** is the idiomatic slot system — expose a shallow-merged `components?: Components` (what GitHub/AI-SDK renderers all allow) so consumers extend without forking.
- **rehype-sanitize** (allowlist) instead of a boolean `allowHtml` skip — safer middle ground than all-or-nothing raw HTML, matching how mature renderers gate HTML.
- **GFM task-list checkboxes + `remark-math`/mermaid passthrough** — a `remarkPlugins`/`rehypePlugins` prop unlocks these without shipping them by default.

## Rebuild note
**Polish, not rebuild.** The architecture is sound (react-markdown + remark-gfm, lazy highlight, token-bound components map). Scope: (1) fix the code-block theming — theme-aware Shiki/Prism style pair or a deliberate dark surface with matched fallback; (2) reveal the copy button on focus-visible/focus-within (a11y P1); (3) add a `components`/plugins merge point and narrow `linkTarget`; (4) `motion-reduce` guard, `allowHtml` + RTL tests/stories, logical properties, h2/h3 hierarchy, doc de-em-dash. All in-place edits to one file — no structural change.
