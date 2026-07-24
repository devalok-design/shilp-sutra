# composed/rich-text-editor — finish-bar audit
Finish: 3/5   Market: PARITY (TipTap / Novel)   Rebuild: polish

Scope: `RichTextEditor` (+ `.Provider` / `.Toolbar` / `.Content` / `.SourceToggle` compound slots) and `RichTextViewer` in `packages/core/src/composed/rich-text-editor.tsx`, plus its extensions (`emoji-node`, `emoji-suggestion`, `mention-suggestion`, `file-attachment`), `.stories.tsx`, `.test.tsx`, and `docs/components/composed/rich-text-editor.md`.

Bottom line vs the 2026-07-01 baseline (also 3/5): real progress — the motion gaps (M3/M4) are largely closed (reduced-motion guard + animated emoji picker), and a genuine composability upgrade landed (compound Provider/slot API + a source-view toggle + `format="markdown"`). But the three things holding it at 3 are the same class of miss the baseline flagged and are still open: **no focus-visible ring on toolbar buttons**, **stale docs** (the whole slot API + `format`/`sourceToggle`/`sourceMode` are undocumented), and **skeletal tests** (no axe, no interaction, no `onChange` assertion). Architecture is sound; this is polish, not a rebuild.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | No accent rail, single edge (border, no shadow on box), semantic tokens, role radius (`rounded-surface`/`-control`/`-control-inner`). But raw arbitrary px persists (`min-h-[120px]`, `w-[240px]`, `h-[435px] w-[352px]`, `min-h-[2.75rem]`, `px-[2px]`, `border-l-[3px]`) and inline `code`/`pre` sit `bg-surface-raised` on a `bg-surface-raised` box (weak same-surface contrast). |
| accessibility | ✗ | Strong ARIA base (`role="toolbar"`+label, `aria-pressed`, icon-only `aria-label`, hidden file-input labels, SSR guard) — but **toolbar buttons have NO `focus-visible:` ring** (WCAG 2.4.7), **no roving-tabindex / arrow-key nav** (incomplete ARIA toolbar pattern), the link URL input strips its outline for a border-color-only signal (forced-colors-fragile), and toolbar targets are `h-ds-xs-plus` (< 44px), no `touch-target`. |
| api-composability | gap | Big upgrade: compound `.Provider/.Toolbar/.Content/.SourceToggle`, controlled+uncontrolled `sourceMode`, `format` html/markdown, `forwardRef`+`displayName`, typed `ToolbarItem`/`MentionItem`, deprecated `emojiSet` kept off the DOM. Still: `ToolbarButton` re-rolls a bespoke `<button>` instead of composing ghost `IconButton`; `content` is a half-controlled hybrid whose JSDoc ("Updates are NOT reactive") contradicts the sync effect at 664-674; no `defaultContent`; toolbar is subtractive-only (no additive-action slot). |
| docs-dx | ✗ | Doc is materially stale vs source: omits `format`/markdown entirely, `sourceToggle`/`sourceMode`/`defaultSourceMode`/`onSourceModeChange`, the whole `.Provider/.Toolbar/.Content/.SourceToggle` slot API, and `emojiSet`. Prop table still says `onChange:(html)` though markdown mode emits Markdown. Connector-em-dash tic throughout. |
| testing | ✗ | 9 tests, all "renders / toolbar-whitelist" only. No `vitest-axe`, no `describeConformance`, no interaction, and the `onChange` test explicitly asserts nothing ("we just confirm it doesn't crash"). No source-toggle or markdown-roundtrip coverage. |
| motion | ✓ | Now solid: `useReducedMotion` guard, emoji picker in `AnimatePresence` with `opacity:0`+`scale:0.96`+`y:4` (no slide-no-fade), `origin-bottom-right` (origin-aware), 140ms (<300ms), `easeOut`, `mode="wait"` on source transition, transform/opacity only. Minor: the link popover (`{showInput && …}`) still hard-toggles with no entrance — one un-animated overlay among animated ones. |
| state-coverage | gap | hover / active(`isActive`) / disabled(undo·redo) / editable / loading(Suspense fallback) / empty(placeholder) all designed. Gaps: no focus-visible (see a11y); upload errors are swallowed — `await onImageUpload(file)` has no catch, a rejected upload fails silently with no UI feedback. |
| content-resilience | gap | prose `max-w-none`, `img max-w-full`, `overflow-hidden` box, `resize-y` source textarea all good. RTL unhandled: placeholder uses `before:float-left` (LTR-specific), physical margins (`ml-ds-05`, not logical `ms-`), and align icons don't mirror under `dir="rtl"`. |
| theming-resilience | gap | Semantic tokens throughout → accent-9 swap safe; role radius honors `[data-shape]`; no dark-track-vanish bug. Weak spot: same-surface inline `code`/`pre` (`bg-surface-raised` on a `bg-surface-raised` box) reads flat in both themes — should be sunken/`surface-2` to look inset. |
| system-cohesion | gap | Uses DS `Button`, `Icon`, `cn`, `z-popover`, `shadow-raised-hover`, `ease-productive-standard`, role radii. But re-rolls three primitives instead of composing: `ToolbarButton` (vs ghost `IconButton`), the link `<input>` (vs DS `Input` focus-ring), and the bordered box (vs `Card variant="outline"`). Classic StatCard-style drift. |
| craft | ✓ | Genuinely thoughtful: `useEditorState` selective subscription, click-outside + Escape handling, focus restoration (`editor.commands.focus()`), `queueMicrotask` internal-change guard, `immediatelyRender:false` SSR guard, link protocol `validate` + `rel="noopener noreferrer"`, file-input value reset, emoji picker rendered outside the overflow box so it isn't clipped. |
| perceived-performance | ✓ | `useEditorState` selectors re-render the toolbar only on relevant state change; `React.lazy` + `Suspense` for the emoji picker (with a sized fallback → no CLS); base64 inline is optimistic; SSR-safe. Among the best in the DS on this axis. |
| market-benchmark | PARITY | vs TipTap-default templates / Novel / BlockNote. Leads on **breadth** (mentions + emoji + task lists + files + images + markdown source toggle + compound slots on TipTap v3, all bundled). Lags on **modern conveniences**: no bubble/floating menu (select→format), no slash-command menu wired into the editor (a `slash-command.tsx` exists but isn't used by RTE), no drag handle, no AI autocomplete, no collab cursors. |
| cross-DS | — | See ideas below. |

## Top gaps (prioritized)
- [P0] accessibility — every `ToolbarButton` lacks a `focus-visible:` ring; keyboard users see no focus indicator (WCAG 2.4.7). → Add the DS `focus-ring`/`focus-visible:` treatment; free if you route through ghost `IconButton`. Verify under `forced-colors`.
- [P1] accessibility — toolbar is not a real ARIA toolbar: no roving tabindex, no arrow/Home/End nav (every button is a separate tab stop). → Implement roving tabindex + arrow-key nav per the toolbar pattern.
- [P1] docs-dx — doc omits `format`, `sourceToggle`, `sourceMode`/`defaultSourceMode`/`onSourceModeChange`, the entire slot API, and `emojiSet`. → Regenerate the prop table + Composability section from source; fix the `onChange:(html)` line for markdown mode.
- [P1] testing — no axe, no interaction, no real `onChange` assertion. → Add a `vitest-axe` pass, a type-into-editor `onChange` assertion, a source-toggle roundtrip test, and `describeConformance`.
- [P1] system-cohesion / api — `ToolbarButton` + link input + bordered box re-roll DS primitives. → Compose ghost `IconButton`, DS `Input`, and `Card variant="outline"`; kills the focus-ring gap and centralizes edge/surface decisions.
- [P2] visual-integrity — tokenize `min-h-[120px]`, `w-[240px]`, `h-[435px] w-[352px]`, `min-h-[2.75rem]` to `--spacing-ds-*`/size tokens; keep commented hairlines.
- [P2] api — resolve the `content` contract: add `defaultContent` for clean uncontrolled, make controlled `content` genuinely reactive, and correct the "NOT reactive" JSDoc.
- [P2] content-resilience — add RTL support (logical properties, mirrored align icons, placeholder float) + an RTL story.
- [P2] state-coverage — surface upload errors (catch the `onImageUpload`/`onFileUpload` rejection and show feedback) instead of swallowing them.
- [P3] motion — animate the link popover to match the emoji picker's entrance/exit.
- [P3] theming — make inline `code`/`pre` visibly inset (sunken/`surface-2`) rather than same-surface.

## What it does well
- Motion is now DS-grade: reduced-motion guarded, fade+scale (no slide-no-fade), origin-aware, sub-150ms, transform/opacity only.
- Compound slot API (`Provider` + `Toolbar`/`Content`/`SourceToggle`) is a genuine composability win over a monolithic editor — toolbar can go top/bottom/floating, source toggle can be internal or externally driven.
- Perceived performance: `useEditorState` selective subscriptions + lazy emoji picker + sized fallback + SSR guard.
- Security hardening: link protocol allowlist (`http`/`https`/`mailto`) + `validate` + `rel="noopener noreferrer"`, and an explicit unsanitized-HTML warning in the JSDoc steering consumers to markdown storage.
- No AI visual tells: single edge (border, no shadow), all semantic tokens, Tabler icons via the DS `Icon` API, blockquote left-rule correctly `slop-allow`-annotated.

## Cross-DS adoption ideas
- **Bubble/floating menu** (TipTap `BubbleMenu`, Novel, Notion): select text → contextual format popover. The single biggest UX gap vs modern editors; TipTap ships the extension.
- **Slash-command menu**: a `slash-command.tsx` extension already exists in the folder but isn't wired into `RichTextEditor` — expose it (Novel/BlockNote make this the primary block-insertion affordance).
- **Drag handle** (TipTap `DragHandle`): grab-to-reorder blocks — table-stakes for Notion-class editors.
- **Character/word count** (TipTap `CharacterCount`): trivial to add, common consumer ask for comment/limit UIs.
- **AI autocomplete / inline generation** (Novel's `++`/AI menu): natural fit given the DS ships an AI layer.
- **Collaborative cursors** (TipTap Collaboration + Yjs): would move Karm-style multi-user editing from PARITY toward LEADS.

## Rebuild note
**Polish, not rebuild.** The provider/compound-slot architecture, TipTap v3 wiring, SSR handling, and motion are all sound and shouldn't be touched structurally. The work is a focused in-place pass: (1) route `ToolbarButton` through ghost `IconButton` to inherit a focus-visible ring, then add roving-tabindex/arrow-key nav to satisfy the ARIA toolbar pattern; (2) regenerate the doc from source and add axe + interaction tests; (3) tokenize the arbitrary px values, animate the link popover, add RTL, and surface upload errors. None of these change the API shape or the file's structure.
