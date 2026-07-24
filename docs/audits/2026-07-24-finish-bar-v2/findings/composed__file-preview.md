# composed/file-preview — finish-bar audit
Finish: 3/5   Market: PARITY   Rebuild: polish

Scope: `file-preview.tsx` (router) + `file-preview/{shared,image,document,video,audio,embed}-preview.tsx` + `file-preview.test.tsx` + `file-preview.stories.tsx` + `docs/components/composed/file-preview.md`.

**Headline vs 2026-07-01 baseline (was 2/5):** the baseline's P0 — three hand-rolled `<div role="slider">` seek/volume bars with no keyboard operability — is **FIXED**. `shared.tsx` now ships a single `MediaSlider` that composes the vendored Radix `SliderPrimitive` (keyboard Arrow/Home/End, visible focus ring, forced-colors-safe), and video seek, audio seek, and volume all route through it. The `text-[11px]/[10px]` arbitrary type sizes are also gone (now `text-body-sm`/`text-caption`/`text-caption`). That moves the family from "below bar" to "shippable with real gaps." What remains is drift + a genuine consumer-breaking default (CDN PDF worker) + thin tests.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | gap | Radius role tokens clean (`rounded-control/surface/pill/control-inner`), no accent-rail/gradient/glass/emoji. But audio player hand-rolls Card (`rounded-surface bg-surface-raised shadow-raised`, audio-preview:86); ErrorFallback uses a border+sunken edge model (shared:24) — two surface vocabularies in one family. Media chrome is raw `bg-white/90`, `bg-black/30`, `from-black/80`, `text-white/70`. |
| a11y | gap | Sliders now correct (Radix). Remaining: raw `<button>` in video (play/speed/fullscreen, video:195/213/219) have no focus-visible ring on a dark scrim + sub-44px targets; image fullscreen (image:59) is a hand-rolled `fixed inset-0 z-modal` overlay with no focus trap / `aria-modal` / scroll-lock; video controls auto-hide after 3s with no keyboard/focus persistence; global `document` keydown with hover heuristic (image/document fire shortcuts on mere hover); `<video>`/`<audio>` captions eslint-disabled. |
| api-composability | gap | Public props cleanly typed (`FileType` union, `onError`). But closed `type`-switch, no slot / compound / `renderToolbar` / replaceable-error API; router is a plain fn with no `forwardRef`/`displayName`; doesn't compose `Card` or `IconButton`; internal `variant`/`tone: 'light'|'dark'` is off the canonical taxonomy. |
| docs-dx | gap | Prop table matches source. CDN PDF worker is buried as a "gotcha" (md:40/45) not a required-setup callout despite being a hard break under CSP; no PDF story exists; no axe/interaction play test in stories. |
| testing | ✗ | 6 tests, router happy-path only. `axe` runs on the **image** path with heavy deps mocked, so it never exercises the video/audio slider controls or the error fallback — false confidence. No error-state, keyboard, PDF/video/audio/embed, or `describeConformance` coverage. |
| motion | gap | All framer entrances carry `opacity:0` (no slide-no-fade), use DS `tweens.fade`/`springs.snappy`, thumb uses `transition-[opacity,transform]` (HW-accel). But volume width-reveal (shared:152) animates layout `width` and has no `motion-reduce` guard (escapes `MotionConfig`); video auto-hide has no reduced-motion consideration. |
| state-coverage | gap | Loading (Skeleton), error (ErrorFallback), hover all designed; volume now reveals on `focus-within` (baseline fix). But video controls auto-hide breaks keyboard users; router still renders its own "Download" row while the errored child shows "Download file" → duplicate, inconsistently-labelled affordance; video volume is hardcoded `muted?0:1` (no real volume state, only mute). |
| content-resilience | gap | Strong: `TruncatedText mode="middle"` for long filenames, embed `aspect-ratio:16/9`, `max-h-[70vh]` caps. Weak on RTL — physical `left-0 right-0`/`bottom-0` positioning throughout, no logical properties; seek arrows not mirrored. |
| theming-resilience | gap | Accent swap honored (slider range `bg-accent-9`); `[data-shape]` honored via radius role tokens. But raw `white`/`black` media chrome has no forced-colors/theming hook; needs an on-media token pair. |
| system-cohesion | gap | Composes Button/Icon/Skeleton/Badge/TruncatedText/Slider-primitive and shares DS motion + radius language. Drift: hand-rolls Card surface, mixes raw `<button>` with DS `Button`, bespoke `tone`/`variant` axis. |
| craft | ✓ | `tabular-nums`+`font-mono` time/zoom readouts, hover/focus-reveal thumb, `centerOnInit` + double-click zoom toggle, playback-rate cycling with a ref to dodge the stale-closure (#91), `ml-0.5` optical nudge on the play glyph. Real attention here. |
| perceived-perf | ✓ | react-pdf + react-zoom-pan-pinch `React.lazy` code-split with Skeleton fallback; image/embed fade-in on load; embed reserves space via aspect-ratio + 15s timeout. No obvious CLS. |
| market-benchmark | gap | PARITY. Most DS peers (shadcn/Radix/MUI/Carbon) ship **no** file-preview composite at all, so having real image/pdf/video/audio/embed renderers is ahead of the field. But vs best-in-class media (YouTube/Spotify/Adobe/Google Drive) it lags on real volume state, captions, focus-trapped fullscreen, and — critically — a self-hosted PDF worker. |
| cross-ds-adoption | n/a | See ideas below. |

## Top gaps (prioritized)
- [P0] api/reliability — `document-preview.tsx:20` defaults the pdf.js worker to `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`. A protocol-relative third-party network default silently kills the entire PDF path under strict CSP (Karm), offline, or air-gapped, and is a supply-chain/version-pin risk. → Bundle the worker via `?url` import from the installed `pdfjs-dist`, or require the consumer to set `workerSrc` and throw a clear error if unset. Promote to a required-setup callout in the doc.
- [P1] testing — axe gate only covers the image path (mocked); the interactive video/audio slider controls and the error fallback are untested. → Add axe + interaction tests for video/audio (seek/volume) and the error state; add `describeConformance`.
- [P1] a11y — raw `<button>` media controls (video:195/213/219, shared VolumeControl mute) lack a visible focus-visible ring and 44px targets; image fullscreen is a hand-rolled modal without focus trap / `aria-modal` / scroll-lock; controls auto-hide from keyboard users. → Use `IconButton`; keep controls visible while focus is within; give fullscreen a real focus trap (or compose `Dialog`).
- [P1] composability/visual — audio player + ErrorFallback re-roll Card surfaces in two different edge models. → Compose `Card`/`CardContent` so the family shares one surface/elevation vocabulary (the StatCard-drift lesson).
- [P2] state-coverage — errored child shows "Download file" while the router still renders its own "Download" row → duplicate affordance, inconsistent label. → Lift error state to the router; render one fallback + one download button.
- [P2] theming/visual — raw `white`/`black` opacity media chrome has no forced-colors/theming hook. → Introduce an on-media token pair for the scrim + controls.
- [P2] motion — volume width-reveal animates layout `width` with no `motion-reduce` guard. → `motion-reduce:transition-none`; prefer a transform-based reveal.

## What it does well
- Sound architecture: a thin router that lazy-loads only the heavy renderer needed, each renderer self-contained with its own error boundary + Skeleton — the right composite pattern.
- The MediaSlider consolidation (one Radix-backed slider for all seek/volume) fixed the baseline's worst a11y break and de-duplicated three bespoke sliders.
- Genuine media-player craft: keyboard shortcut maps (YouTube/Spotify-style), tabular time readouts, zoom % with reset, playback-rate cycling, middle-truncated filenames.
- Type detection (mimeType → extension → known-embed-host) is pragmatic and covered by a test.
- No slop tells: clean radius role tokens, no gradient text / accent rail / glass-by-default / emoji; all framer entrances fade (no slide-no-fade).

## Cross-DS adoption ideas
- **pdf.js self-hosted worker** (react-pdf docs / Vercel pattern): ship the worker as a bundled `?url` asset so PDF works under CSP out of the box — this is the single highest-leverage import.
- **Vidstack / Media Chrome**: a captions/subtitles track + a real volume-state model (not `muted?0:1`), plus a `<track>` slot — media players without captions fail WCAG 1.2.
- **Radix Dialog for fullscreen**: replace the hand-rolled `fixed inset-0` image overlay with a composed Dialog to get focus trap, scroll-lock, `aria-modal`, and Esc-restore for free.
- **Compound/slot API (Card-bar model)**: `FilePreview.Toolbar` / `renderToolbar` / replaceable error fallback so consumers extend without `className` hacks.

## Rebuild note
**Polish, not rebuild.** The router + lazy-sub-renderer architecture is correct and the MediaSlider rework already retired the structural a11y defect. The remaining work is in-place: (1) self-host the PDF worker — a P0 consumer break; (2) compose `Card`/`IconButton` to kill the two surface vocabularies and the raw-button focus gaps; (3) tokenize the media chrome; (4) fill out tests (video/audio slider a11y + error). None of these require re-architecting the family.
