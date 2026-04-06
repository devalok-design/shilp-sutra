# Phase 3: Bundle Analysis

**Date:** 2026-04-06
**Package:** @devalok/shilp-sutra@0.31.0

## Total Size

| Metric | Value |
|---|---|
| npm tarball (gzipped) | **1.5 MB** |
| npm unpacked size | **3.8 MB** |
| Total files in package | 738 |
| dist/ directory | 3.6 MB |
| dist/ JS only | 1.85 MB (1,892,376 bytes) |
| dist/ .d.ts types | 400 KB (409,318 bytes) |
| dist/ .d.ts.map | 168 KB (171,500 bytes) |
| fonts/ (shipped) | 795 KB (814,624 bytes) |
| docs/components/ (shipped) | 498 KB |
| Source maps | None (sourcemap: false) -- good |

### dist/ Breakdown by Directory

| Directory | Size | Contents |
|---|---|---|
| dist/ui/ | 1.4 MB | 72+ UI component entry points + barrel |
| dist/_chunks/ | 1.3 MB | Shared vendor chunks (see below) |
| dist/composed/ | 524 KB | 28 composed components + barrel |
| dist/shell/ | 148 KB | 7 shell components + barrel |
| dist/ai/ | 133 KB | 10 AI command components |
| dist/primitives/ | 129 KB | Vendored Radix types (.d.ts only in dist) |
| dist/motion/ | 33 KB | Motion primitives + provider |
| dist/tailwind/ | 29 KB | Tailwind preset |
| dist/hooks/ | 22 KB | Custom hooks |
| dist/tokens/ | 8 KB | CSS custom properties |

## Chunk Breakdown

| Chunk | Raw Size | Gzip Size | Contents | Consumers |
|---|---|---|---|---|
| **tiptap.js** | **545 KB** | **149 KB** | @tiptap/*, prosemirror-* | rich-text-editor only (1 file) |
| **primitives.js** | **207 KB** | **49 KB** | Vendored Radix UI primitives | 31 files (Dialog, Select, Popover, Tabs, etc.) |
| **framer.js** | **192 KB** | **56 KB** | framer-motion runtime | **67 files** (nearly everything) |
| vendor-utils.js | 81 KB | 14 KB | clsx, class-variance-authority, tailwind-merge | 21 files |
| vendor-client.js | 62 KB | 19 KB | @floating-ui, aria-hidden, react-remove-scroll, react-colorful | 1 file (color-input.js only!) |
| sonner.js | 41 KB | 11 KB | sonner toast library | 2 files (toast.js, toaster.js) |
| use-calendar.js | 35 KB | 7 KB | Calendar logic (auto-split, not manual) | date-picker, composed barrel |
| typing-indicator.js | 19 KB | 5 KB | Chat typing indicator (auto-split) | chat barrel |
| badge-group.js | 15 KB | 3 KB | Badge group (auto-split) | ui barrel |
| stat-row.js | 15 KB | 4 KB | AI stat row block (auto-split) | ai barrel |
| tree-view.js | 9 KB | 3 KB | Tree view (auto-split) | ui barrel |
| motion-provider.js | 0.7 KB | -- | Motion config provider | motion barrel |
| keybinding.js | 0.7 KB | -- | Keyboard shortcut utils | shell |
| link-context.js | 0.4 KB | -- | Link provider context | shell barrel |

### Key Observations

1. **tiptap.js is correctly isolated.** Only `rich-text-editor.js` imports it. Consumers that never use the rich text editor pay zero cost.

2. **vendor-client.js is over-isolated.** Despite bundling @floating-ui, aria-hidden, react-remove-scroll, and react-colorful, only `color-input.js` imports from it. The Radix primitives that use @floating-ui are vendored into `primitives.js` instead. The `react-colorful` dependency (color picker widget) is likely the main payload here -- it dominates the chunk but serves a single component.

3. **framer.js is the biggest problem.** 192 KB raw / 56 KB gzip, imported by **67 of 149 dist JS files** (45%). Every component that uses `motion.div` or `AnimatePresence` pulls in the entire framer-motion runtime. This means importing `Button`, `Dialog`, `Card`, or nearly any other component forces the consumer to download 192 KB of animation code. See "Framer Motion Impact" below.

4. **sonner.js isolation is correct.** Only toast/toaster import it.

5. **vite.config comment is misleading.** Line 129 says framer-motion is "only loaded by Spinner and future animation components." This was true early on but is now wildly inaccurate -- 84 source files import it.

## Framer Motion Impact Analysis

**84 source files** import from `framer-motion` (excluding stories/tests). After bundling, **67 dist entry points** reference the framer chunk.

### What framer-motion is used for in each component:

| Usage Pattern | Example Components | Could Use CSS Instead? |
|---|---|---|
| `motion.div` for enter/exit animations | Dialog, Sheet, Alert, Banner, Popover, etc. | Yes -- CSS `@starting-style` + `transition-behavior: allow-discrete` (Chrome 117+, Safari 18+) or existing Radix `data-state` animations |
| `AnimatePresence` for unmount animations | Dialog, Dropdown, Toast, Autocomplete | Partially -- `transition-behavior: allow-discrete` handles this for modern browsers |
| `motion.button` with `useReducedMotion` | Button, Icon | Yes -- `prefers-reduced-motion` media query in CSS |
| `LayoutGroup` / layout animations | SegmentedControl, Tabs | Harder -- `view-transition-name` could work but less mature |
| `useMotionValue` / `useTransform` / `animate` | ProgressRing, Spinner, DevadootIcon | No -- these need JS animation control |
| `motion.svg` / path drawing | Charts (area, bar, gauge, etc.) | Partially -- CSS can animate SVG paths but less precisely |

**Verdict:** ~80% of framer-motion usage is for simple enter/exit/hover transitions that CSS can handle. Only ProgressRing, Spinner, the animated DevadootIcon, and SegmentedControl/Tabs layout animations genuinely need JS animation.

**Consumer cost of importing just Button:**

| File | Size |
|---|---|
| button.js | 15 KB |
| vendor-utils.js | 81 KB (clsx/cva/tw-merge -- unavoidable) |
| primitives.js | 207 KB (Radix Slot via asChild -- unavoidable) |
| **framer.js** | **192 KB** (for `motion.button` + `useReducedMotion`) |
| + button-group.js, icon.js, icon-context.js, lib/motion.js, button-processing.js, lib/utils.js, spinner.js | ~35 KB |
| **Total** | **~530 KB raw / ~175 KB gzip** |

For context, a bare React app with just ReactDOM is ~130 KB. A single Button import nearly quadruples that.

## Tree-Shaking Assessment

### sideEffects Field

```json
"sideEffects": ["**/*.css", "**/primitives/**"]
```

This is **correctly configured**. CSS files are marked as side-effectful (they inject styles). Vendored primitives are marked side-effectful (they register with React internals). All other JS is tree-shakeable.

### Barrel Exports

The barrel files (`ui/index.js`, `composed/index.js`, `shell/index.js`) re-export from individual component files via static imports:

```js
// ui/index.js -- 354 lines, imports ALL 72+ components
import { Button, buttonVariants } from "./button.js";
import { Dialog, ... } from "./dialog.js";
// ... 60+ more
```

**Impact:** The barrel file forces **all** component modules to be loaded when a consumer does `import { Button } from '@devalok/shilp-sutra'`. However, modern bundlers can tree-shake barrel re-exports IF:
1. The consumer's bundler supports barrel optimization (Next.js 13.5+ does via `optimizePackageImports`)
2. All re-exports are named exports (they are -- good)

**Mitigation already in place:** Per-component exports (`@devalok/shilp-sutra/ui/button`) bypass the barrel entirely. The llms.txt documentation recommends these granular imports.

**Remaining risk:** Consumers using `import { Button } from '@devalok/shilp-sutra'` without barrel optimization will load ALL 72+ UI components. The composed barrel also pulls in tiptap via rich-text-editor (see P1 recommendation).

### composed/index.js Barrel Pulls In Tiptap

The composed barrel imports from `./rich-text-editor.js` which imports `_chunks/tiptap.js` (545 KB). Any consumer doing:
```js
import { EmptyState } from '@devalok/shilp-sutra/composed'
```
...will inadvertently load 545 KB of tiptap code they never use.

## Font Payload

| Font | File | Size | Purpose |
|---|---|---|---|
| Inter Variable (upright) | Inter-Variable.woff2 | 344 KB | Primary UI font |
| Inter Variable (italic) | Inter-Italic-Variable.woff2 | 379 KB | Primary UI italic |
| Ranade Variable (upright) | Ranade-Variable.woff2 | 38 KB | Display/heading font |
| Ranade Variable (italic) | Ranade-VariableItalic.woff2 | 35 KB | Display/heading italic |
| **Total** | | **795 KB** | |

### Font Assessment

- **WOFF2 format only** -- good, most compressed web font format
- **Variable fonts** -- good, single file covers all weights
- **Inter Italic is 379 KB** -- largest single file. If italic is rarely used in product UI, candidate for lazy loading or subsetting
- Fonts are in the npm `files` array, so they ship with every install

## Dependency Weight

### Bundled Dependencies (in dist)

These are devDependencies that get compiled into the output chunks:

| Dependency | Chunk | Approx Raw Size | Approx Gzip | Could Be Peer? |
|---|---|---|---|---|
| framer-motion | framer.js | 192 KB | 56 KB | **Yes -- strong candidate** |
| @tiptap/* + prosemirror-* | tiptap.js | 545 KB | 149 KB | Yes -- but correctly isolated to RTE |
| Vendored Radix primitives | primitives.js | 207 KB | 49 KB | No -- vendored intentionally |
| clsx | vendor-utils.js | ~5 KB | ~2 KB | No -- foundational utility |
| class-variance-authority | vendor-utils.js | ~25 KB | ~5 KB | No -- foundational utility |
| tailwind-merge | vendor-utils.js | ~50 KB | ~8 KB | No -- foundational utility |
| @floating-ui/react-dom | vendor-client.js | ~30 KB | ~10 KB | No -- used by vendored primitives |
| react-colorful | vendor-client.js | ~15 KB | ~5 KB | Could be -- only used by ColorInput |
| aria-hidden + react-remove-scroll | vendor-client.js | ~15 KB | ~4 KB | No -- used by modals/overlays |
| sonner | sonner.js | 41 KB | 11 KB | Could be -- only used by Toast/Toaster |

### Externalized Dependencies (peer deps -- not bundled)

Peer dep strategy is **well-executed** -- heavy optional deps (react-pdf, d3-*, @tiptap consumers don't need, @emoji-mart, react-syntax-highlighter) are correctly externalized.

| Dependency | Used By | Optional? |
|---|---|---|
| react, react-dom | Everything | Required |
| @tabler/icons-react | Icon system | Required for most consumers |
| @tanstack/react-table | DataTable | Optional |
| d3-* (8 packages) | Charts | Optional |
| date-fns | DatePicker, calendar | Optional |
| @emoji-mart/* | EmojiPicker | Optional |
| react-pdf, react-zoom-pan-pinch | FilePreview | Optional |
| react-markdown, remark-gfm, react-syntax-highlighter | MarkdownViewer | Optional |
| tailwindcss | Tailwind preset | Required |

## Recommendations

### P0 -- Critical (Large consumer impact)

1. **Reduce framer-motion's blast radius.** At 192 KB raw / 56 KB gzip imported by 67/149 files, it is the dominant bundle cost for consumers importing basic components. Options (pick one):
   - **A (recommended): Remove framer-motion from components that only use it for simple enter/exit animations** (Dialog, Sheet, Alert, Banner, Popover, Button, Card, etc.). Replace with CSS transitions on Radix `data-state` attributes. Keep framer-motion only in components that genuinely need JS animations (Spinner, ProgressRing, SegmentedControl, Tabs, DevadootIcon). This would cut framer consumers from 67 to ~10 files.
   - **B: Make framer-motion a peer dependency.** Consumers already using it would deduplicate. New consumers pay the explicit cost.
   - **C: Dynamic import framer-motion.** Load it on first interaction rather than at module parse time. Complex to implement but zero-cost for SSR.

2. **Fix the misleading vite.config comment** (line 129: "only loaded by Spinner and future animation components"). This misrepresents the actual dependency graph and could mislead future audits.

### P1 -- Important

3. **Remove rich-text-editor from the composed barrel.** It's the only consumer of the 545 KB tiptap chunk. `import { EmptyState } from '@devalok/shilp-sutra/composed'` currently triggers tiptap download. Add it to the barrel isolation list alongside Charts/DataTable.

4. **Audit vendor-client chunk composition.** Only `color-input.js` imports from this 62 KB chunk. The @floating-ui code in it may duplicate what's already in the primitives chunk. Consider making react-colorful a peer dep or lazy-loading it.

### P2 -- Nice to Have

5. **Subset Inter fonts.** Latin-only subsets would save ~100-200 KB on the italic variants while covering 95%+ of use cases.

6. **Add `optimizePackageImports` guidance to consumer docs.** Next.js consumers should add `@devalok/shilp-sutra` to `experimental.optimizePackageImports` in next.config.js to prevent barrel imports from pulling in all 72+ components.

### P3 -- Future

7. **Evaluate CSS-only animations.** Modern CSS (`@starting-style`, `transition-behavior: allow-discrete`) can handle most enter/exit animations. This would eliminate the framer dependency for 80%+ of components.

8. **Consider splitting primitives.js.** At 207 KB, it's loaded by 31 files. Components using only Dialog shouldn't need Slider primitives. However, this is a significant build config change with marginal per-component benefit since most apps use many Radix-based components.
