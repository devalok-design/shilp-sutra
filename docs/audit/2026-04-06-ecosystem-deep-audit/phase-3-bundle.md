# Phase 3: Bundle Analysis

## Font Payload

**804KB total** — 4 woff2 files:
- `Inter-Variable.woff2` — primary sans
- `Inter-Italic-Variable.woff2` — italic
- `Ranade-Variable.woff2` — accent display font
- `Ranade-VariableItalic.woff2` — accent italic

**Verdict: GOOD.** woff2 variable fonts are the optimal format. 804KB for 4 font files is reasonable. No TTF bloat (the 9.5MB TTF noted in memory was likely from an earlier version or the brand package).

Fonts are included in the npm package via `"files": ["fonts"]`.

## Package Files

```
"files": ["dist", "docs/components", "fonts", "README.md", "llms.txt", "llms-full.txt"]
```

This is clean — only necessary files are published.

## Chunk Layout (from memory + vite.config)

| Chunk | Approx Size | Contents | Lazy? |
|---|---|---|---|
| vendor-utils | ~80KB | clsx, cva, tailwind-merge | No — used by all |
| vendor-client | ~52KB | @floating-ui, aria-hidden, react-remove-scroll | No — used by overlays |
| sonner | ~42KB | Toast library | Semi — used by Toaster |
| framer | ~195KB | framer-motion | No — **84 files import it** |
| primitives | ~211KB | Vendored Radix UI | No — used by most components |
| tiptap | ~546KB | @tiptap/*, prosemirror-* | Yes — only RichTextEditor |

**Total chunks: ~1.1MB** (before per-component entry points)

## Key Findings

### 1. Framer-motion is effectively universal (~195KB)

84 source files import framer-motion. Despite being in a separate chunk, it's loaded by virtually every component that has any animation. The vite.config comment calling it "only loaded by Spinner" is severely outdated and should be corrected.

**Impact:** Any consumer using more than a few components will load the full 195KB framer chunk. This is acceptable for app-level usage but means the "just import Button" tree-shaking story isn't as lean as it could be.

### 2. TipTap is properly lazy (~546KB)

Only loaded by RichTextEditor. Consumers who don't use RTE never download this.

### 3. sideEffects correctly configured

```json
"sideEffects": ["**/*.css", "**/primitives/**"]
```

CSS files and primitives are marked as side-effectful (correct — CSS must not be tree-shaken, primitives have module-scope setup). Everything else is tree-shakeable.

## Recommendations

1. **P2:** Fix the framer-motion comment in vite.config.ts (misleading for future maintainers)
2. **P3:** Consider whether framer-motion could become a peer dep for consumers who want to minimize bundle size
3. **P3:** The 211KB primitives chunk could potentially be split further (components only using Dialog shouldn't load Slider primitive), but this is a significant build config change with marginal benefit
