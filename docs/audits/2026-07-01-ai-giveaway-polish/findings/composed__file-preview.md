# composed/file-preview — audit
**Finish score:** 2/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:1 P1:6 P2:8 P3:3

Scope: `file-preview.tsx` (router) + `file-preview/{shared,image,document,video,audio,embed}-preview.tsx` + `file-preview.test.tsx` + `file-preview.stories.tsx` + `docs/components/composed/file-preview.md`.

This family is *functionally* rich (real players, keyboard shortcuts, lazy-loading) but it is hand-rolled top to bottom. It re-rolls surfaces, sliders, toolbars, and buttons instead of composing the DS primitives (Slider, Card, Popover, IconButton), which is exactly the drift the Card/StatCard bar exists to prevent. The single hardest tell is a security/reliability break (CDN PDF worker), but the dominant theme is F5/G-class drift.

## Findings

### [P0][H/a11y] Native `<div role="slider">` volume/seek bars with no keyboard operability
- **Category:** a11y / state-coverage
- **Evidence:**
  - `file-preview/shared.tsx:117-129` — VolumeControl track: `role="slider" ... tabIndex={0}` but only `onPointerDown/Move/Up`; no `onKeyDown`. Arrow keys do nothing.
  - `file-preview/video-preview.tsx:182-201` — progress bar `role="slider" tabIndex={0}` with only `onClick={handleSeek}`; no keyboard.
  - `file-preview/audio-preview.tsx:112-142` — audio progress `role="slider" tabIndex={0}`, `onClick`/`onMouseMove` only; no keyboard.
- **Why:** A focusable element advertising `role="slider"` that ignores Arrow/Home/End is a broken ARIA guarantee — worse than no role, because AT announces "slider" and the control is inert. Rubric H hard guarantee.
- **Fix:** Compose the DS `Slider` (already vendored, keyboard + forced-colors handled) for volume/seek/scrub, OR add `onKeyDown` (Arrow ±step, Home/End) to each track. Prefer composing `Slider`.

### [P1][G2] PDF worker loaded from third-party CDN by default (`//unpkg.com`)
- **Category:** drift
- **Evidence:** `file-preview/document-preview.tsx:20` — `pdfjs.GlobalWorkerOptions.workerSrc = \`//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs\``
- **Why:** A protocol-relative external network dependency shipped as a default: breaks in offline/air-gapped/CSP-locked apps (Karm ships strict CSP), is a supply-chain/version-pin risk, and silently fails the whole PDF path. Doc only mentions it as a "gotcha," not a required consumer action.
- **Fix:** Bundle the worker via `?url` import from the installed `pdfjs-dist`, or require the consumer to configure it (throw a clear error if unset) rather than defaulting to a CDN.

### [P1][F5] Re-rolls surface + shadow instead of composing Card
- **Category:** composability / drift
- **Evidence:**
  - `file-preview/audio-preview.tsx:96` — `rounded-surface bg-surface-raised shadow-raised overflow-hidden` (a Card, hand-built).
  - `file-preview/shared.tsx:23` — ErrorFallback panel: `rounded-control border border-surface-border bg-surface-sunken p-ds-08`.
- **Why:** This is the exact drift StatCard fixed — a widget re-implementing Card's surface/elevation. If the surface system changes, these silently drift. Also the audio player pairs `border`-free but `shadow-raised` (OK) while ErrorFallback pairs `border + bg` (edge model) inconsistently across the same family.
- **Fix:** Audio player and ErrorFallback should compose `<Card variant="…">` / `<CardContent>` for their surface, not re-roll `rounded-surface bg-surface-raised shadow-raised`.

### [P1][F5/G2] Hand-rolled sliders duplicate the DS Slider primitive
- **Category:** composability
- **Evidence:** `file-preview/shared.tsx:65-148` (VolumeControl), plus seek/progress bars in video-preview.tsx and audio-preview.tsx — all build track/fill/thumb from raw divs + pointer math.
- **Why:** Three bespoke slider re-implementations in one component family, none reusing the vendored `Slider`. Guarantees behavioral drift (keyboard, RTL, forced-colors) from the real primitive and triples maintenance.
- **Fix:** Compose `Slider` for volume and seek. If a custom skin is truly needed, build it once and share, with full keyboard/ARIA.

### [P1][G3] Non-canonical `variant="light" | "dark"` axis on VolumeControl
- **Category:** vocabulary
- **Evidence:** `file-preview/shared.tsx:70,105-109` — `variant?: 'light' | 'dark'` selecting `bg-white/30`, `text-white`, `bg-accent-9`.
- **Why:** `light`/`dark` is not the canonical `variant` (solid/soft/outline/ghost/link) taxonomy (G3), and it hardcodes raw `white/30`, `bg-white`, `text-white` instead of an on-media surface token. Reads as an ad-hoc theme switch.
- **Fix:** Rename to a semantic prop (e.g. `onMedia?: boolean` or `surface="overlay"`) and back the "dark" case with a token (an over-media foreground token), not raw white.

### [P1][G2] Raw hex / arbitrary values instead of DS tokens (defaults, not demos)
- **Category:** drift
- **Evidence:**
  - `file-preview/video-preview.tsx:218,224` and `audio-preview.tsx:131,168` — `text-[11px]` / `text-[10px]` instead of `text-ds-xs`.
  - `file-preview/video-preview.tsx:165,179,183,193,198` — `bg-white/90`, `bg-white/30`, `from-black/80`, `text-white` as shipped player chrome.
  - `image-preview.tsx:60` and `video-preview.tsx:132` — `bg-black/90`, `bg-black`.
- **Why:** G2 re-rolled tokens. `text-[11px]` bypasses the `--text-ds-*` scale; the black/white player chrome is understandable for a media surface but is unbound raw color rather than a media-surface token, so it can't respond to theming/forced-colors.
- **Fix:** Swap arbitrary text sizes for `text-ds-xs`. Introduce a media-overlay token pair for the black scrim / white controls so forced-colors and theming have a hook.

### [P1][V2] ErrorFallback uses border **and** sits on a sunken surface inconsistent with family
- **Category:** visual-tell / drift
- **Evidence:** `file-preview/shared.tsx:23` — `rounded-control border border-surface-border bg-surface-sunken` while the audio card (line 96) uses `shadow-raised` with no border. Two edge models in one family (G4).
- **Why:** Not a classic double-edge (no shadow here), but the family mixes edge-led (ErrorFallback, PDF container) and elevation-led (audio) surfaces with no rule — the vocabulary inconsistency the rubric flags as G4.
- **Fix:** Pick one surface vocabulary for the family (compose Card) so error, audio, and pdf containers share the same edge/elevation model.

### [P2][M3] CSS `transition-[width]` animations bypass reduced-motion
- **Category:** motion
- **Evidence:**
  - `file-preview/shared.tsx:116` — volume reveal `transition-[width] duration-200`; `:132` fill `transition-[width] duration-75`.
  - `video-preview.tsx:193`, `audio-preview.tsx:125` — progress fill `transition-[width] duration-75`.
- **Why:** `MotionConfig reducedMotion` (motion-provider.tsx:39) only governs framer-motion `motion.*` elements. These are raw CSS transitions animating **layout width** (also M5), so they run at full motion even when the user prefers reduced motion.
- **Fix:** Gate width transitions behind `motion-reduce:transition-none`, and for the progress *fill* prefer `transform: scaleX()` over animating `width` (M5).

### [P2][M5] Animating `width` for progress/volume instead of transform
- **Category:** motion
- **Evidence:** `video-preview.tsx:193` (`width: ${progress}%` + `transition-[width]`), `audio-preview.tsx:125`, `shared.tsx:132`, and StatCard-style `transition-[width]` echoed here.
- **Why:** Animating `width` triggers layout every frame; rubric M5 prefers transform/opacity.
- **Fix:** Animate a `scaleX` fill (transform-origin left) or drop the transition on the frequently-updated progress fill (it updates on `timeupdate` anyway).

### [P2][H] Volume-reveal-on-hover hides the control from keyboard/touch
- **Category:** state-coverage / a11y
- **Evidence:** `file-preview/shared.tsx:116` — track wrapper `w-0 overflow-hidden group-hover/vol:w-20` — the slider is 0-width until pointer hover.
- **Why:** Keyboard-only and touch users can't reveal the volume slider (no hover); combined with the missing keyboard handler (P0) it's fully inaccessible. Also the `<button>` mute toggles (shared.tsx:113, video 205/229, audio) are raw `<button>` with hover-only affordances and sub-44px hit targets in the compact toolbar.
- **Fix:** Reveal on focus-within too (`group-focus-within/vol:w-20`), ensure ≥44px targets, and prefer the DS `IconButton` over raw `<button>`.

### [P2][F2/F5] Router re-rolls buttons; download/toolbar buttons could compose IconButton
- **Category:** composability
- **Evidence:** `shared.tsx:113` raw `<button aria-label…>`; `video-preview.tsx:205,222,229` raw `<button>`; the toolbar zoom/page buttons use `Button size="icon-xs"` (`image-preview.tsx:109`) — inconsistent with the raw buttons elsewhere.
- **Why:** Mixed button vocabulary within the family (some `Button`, some raw `<button>`), so focus rings, disabled, and touch-target guarantees are uneven.
- **Fix:** Use `IconButton` consistently for all icon-only controls (mute, play, fullscreen, speed).

### [P2][state-coverage] No loading/empty state for the router's own file-info bar; download link opens broken URLs silently
- **Category:** state-coverage
- **Evidence:** `file-preview.tsx:133-139` — Download button always renders, even for the error path handled inside sub-components; there's no top-level error surface — only the child renderer's ErrorFallback shows, and the router still renders its own Download row below it (double download affordance).
- **Why:** On error the user sees ErrorFallback's "Download file" AND the router's "Download" — duplicated, inconsistent labels ("Download file" vs "Download").
- **Fix:** Suppress the router download row when a child is in its error state, or lift error state to the router and render one ErrorFallback + one download affordance.

### [P2][H] Video/audio keyboard shortcuts bound to `document` globally
- **Category:** a11y / state-coverage
- **Evidence:** `video-preview.tsx:92`, `audio-preview.tsx:60`, `image-preview.tsx:53`, `document-preview.tsx:49` — `document.addEventListener('keydown', …)` guarded only by `containerRef.contains(activeElement)` or `hovered`.
- **Why:** Space/arrow/letter shortcuts on `document` can hijack keys while the user is typing elsewhere on the page if focus/hover heuristics misfire; multiple simultaneous previews all listen on `document`. The `hovered`-gates also mean shortcuts fire on mere mouse-hover with no focus — surprising and untestable.
- **Fix:** Attach the listener to the container element (with `tabIndex`), not `document`; drop the hover-to-activate-shortcuts heuristic.

### [P2][docs/J] Doc lists a bare prop table but omits the real API surface & sub-component behavior
- **Category:** docs
- **Evidence:** `docs/components/composed/file-preview.md:7-15` documents only the router props; no mention that `onError` is the only escape hatch, that there is no `variant`/`size`/slot API, and the CDN worker is buried as a "gotcha" (line 40/45) rather than required setup.
- **Why:** J docs-parity: the doc under-states the CDN requirement (a P1 runtime break) and over-states composability ("Composability" section describes routing, not slots).
- **Fix:** Promote the PDF worker to a required-setup callout; state plainly there are no composition slots.

### [P3][V4] Story fixtures use raw framework-palette hex in placeholder URLs
- **Category:** visual-tell
- **Evidence:** `file-preview.stories.tsx:17` `placehold.co/…/6366F1/…` (indigo #6366f1 — the canonical AI-tell color), `:29` `0EA5E9`, `:90` `F59E0B`.
- **Why:** Low-severity (demo fixtures, not shipped defaults) but `6366F1` is literally the rubric's V4 poster color; a reviewer skimming stories will read it as an AI tell.
- **Fix:** Use neutral placeholder colors or DS surface tokens in placeholder URLs.

### [P3][state-coverage] Tests cover only the router happy path
- **Category:** state-coverage / docs
- **Evidence:** `file-preview.test.tsx:24-70` — 6 tests: file-info render, download link, type detection, explicit type, className merge, axe. No test for error state, keyboard, video/audio/embed rendering, or slider a11y.
- **Why:** The a11y test (`:64`) runs against the *image* path with heavy deps mocked, so it never exercises the `role="slider"` controls that carry the P0 violation — the axe gate gives false confidence.
- **Fix:** Add axe + interaction tests for video/audio (the slider controls) and the error fallback.

### [P3][E-clean note] Minor "style" comments reference other brands' UIs
- **Category:** verbal-tell (informational, not shipped copy)
- **Evidence:** `audio-preview.tsx:12` "Spotify/SoundCloud style", `image-preview.tsx:23` "Google Drive / Figma style", `video-preview.tsx:16` "YouTube style".
- **Why:** Source comments only (not user-facing), so not a real verbal tell — noted so synthesis doesn't re-flag. No E1–E8 violations in shipped copy.

## Composability gaps
- **Does not compose Card** — audio player and ErrorFallback re-roll `rounded-surface bg-surface-raised shadow-raised` / bordered panels (F5). Should compose `<Card>`/`<CardContent>`.
- **Does not compose Slider** — three bespoke track/fill/thumb sliders (volume, video seek, audio seek) instead of the vendored `Slider` (F5), causing the P0 keyboard gap.
- **Does not compose IconButton** — mix of raw `<button>` and `Button size="icon-xs"` for icon controls (F2/vocabulary).
- **No slot API** — the router is a closed `type`-switch with fixed download row; no way to inject a custom toolbar, replace the error fallback, or add a corner action. All customization is via `className` + `onError`. A `renderToolbar`/`slot` or compound API (`FilePreview.Toolbar`) would fit the Card-bar model.
- **VolumeControl `variant="light"|"dark"`** is a bespoke theme axis off the canonical taxonomy (G3).
- **No `asChild`** on the download affordance target beyond the internal `<a>` (minor; router hardcodes an `<a download>`).

## Motion gaps
- **CSS `transition-[width]` escapes reduced-motion** — MotionConfig only covers `motion.*`; the width transitions (shared.tsx:116/132, video 193, audio 125) run regardless of `prefers-reduced-motion` (M3).
- **Animating layout `width`** for progress/volume fills instead of `transform: scaleX` (M5).
- **Volume slider width-reveal** animates `width` on hover (M5) and is hover-only (no focus-within), an inaccessible motion-gated affordance.
- **Video controls auto-hide** after 3s (video-preview.tsx:123) with no reduced-motion / no persistent-on-focus consideration — controls vanish for keyboard users.
- Framer entrances (Toolbar fade, play-button `springs.snappy`, PDF page crossfade) are fine and consistent with tokens — no bounce-by-default tell there.

## Polish plan (ordered steps to reach the finish bar)
1. **Fix the P0 first:** replace the three hand-rolled sliders with the DS `Slider` (or add full `onKeyDown` + focus-within reveal + 44px targets). This closes the broken `role="slider"` guarantee.
2. **Fix the CDN worker (P1):** bundle `pdf.worker` from installed `pdfjs-dist` via `?url`, or throw if unconfigured. Update doc to a required-setup callout.
3. **Compose Card:** rebuild the audio player and ErrorFallback on `<Card>/<CardContent>` so the family shares one surface/edge vocabulary (kills F5 + G4).
4. **Compose IconButton** for every icon-only control; delete raw `<button>` chrome.
5. **Token sweep:** `text-[11px]/[10px]` → `text-ds-xs`; introduce a media-overlay token pair for the black scrim / white controls; rename VolumeControl `variant` to a semantic `onMedia`/surface prop.
6. **Motion:** add `motion-reduce:transition-none` to the width transitions and convert progress fills to `scaleX`; keep controls visible on focus.
7. **De-dupe error affordance:** lift error state to the router; render one ErrorFallback + one download button with one consistent label.
8. **Add a slot/compound API** (`renderToolbar` / `FilePreview.Toolbar` / replaceable error fallback) so consumers can extend without `className` hacks.
9. **Tests + stories:** add axe + interaction coverage for video/audio slider controls and error state; swap `6366F1`/palette hex out of story fixtures.

## Clean (rubric dims that pass)
- **No accent rail (V1), no gradient text (V3), no glass/blob default (V6)** — the black media scrims and `backdrop-blur-xs` on the toolbar (shared.tsx:47) are legitimate media-overlay layering, not decorative glassmorphism.
- **No emoji-as-icon (V5)** — uses `@tabler/icons-react` via DS `Icon` throughout.
- **No rounded-everything / pill-spam (V7/V8)** — uses `rounded-control`/`rounded-surface`/`rounded-pill` intentionally (pill for tracks/thumbs is correct).
- **Verbal tells (E1–E8): clean** in shipped copy — labels are plain ("Preview unavailable", "Download"); no em-dash tic, AI vocabulary, or hedging in user-facing strings. Brand-name style comments are source-only.
- **Sparkline/skeleton gradients** are the legitimate exceptions (not flagged).
- **framer-motion entrances use DS tokens** (`tweens.fade`, `springs.snappy`) — no bounce-by-default (M1) and reduced-motion is respected for the `motion.*` layer via MotionConfig.
- **Lazy-loading of react-pdf / react-zoom-pan-pinch** (file-preview.tsx:16-17) is a correct code-split, with Skeleton fallback.
- **Types:** props are specifically typed (`FileType` union, `HTMLDivElement` attrs, `onError: (error:string)=>void`); no `any`, no `React.FC`, no stringly-typed color. (Router is a function component without `forwardRef`/`displayName` — minor, not flagged as it's a plain wrapper.)
