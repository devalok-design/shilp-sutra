---
"@devalok/shilp-sutra": minor
---

Emoji picker migrated to **frimousse** (native-only) and an install-"just works" accuracy pass across the optional-peer surface.

**Breaking — emoji picker (frimousse migration).** The picker no longer supports non-native art styles (apple/google/twitter/facebook); everyone sees their own platform's native emoji. `@emoji-mart/react` still declares `peer react "^16.8 || ^17 || ^18"`, so React-19 consumers using `EmojiPicker`/`RichChatInput`/`RichTextEditor` previously hit a hard `ERESOLVE` on install — frimousse is React 18/19 native.
- `set` / `theme` / `previewPosition` / `skinTonePosition` (EmojiPicker) and `emojiSet` (RichChatInput/RichTextEditor) are now **deprecated no-ops**; `EmojiSet` is retained for source compatibility.
- Removed: the `emojiDataLoaders` export. Narrowed: `EmojiNodeAttrs` → `{ id, native }`; `EmojiSuggestionItem` (no `x`/`y`); `createEmojiSuggestion()` now takes no argument.
- **Zero new peers:** frimousse and `@emoji-mart/data` (dataset for `:shortcode:` search — pure JSON, no React peer) are now **bundled** into a lazy `emoji` chunk. The emoji feature needs no consumer install and no `--legacy-peer-deps`. `@tiptap/*` was already bundled (it never needed to be a peer).
- **Added:** the picker now has a built-in footer (hovered-emoji preview + skin-tone selector) and a new `emojibaseUrl` prop to self-host the emoji dataset (removes the runtime jsdelivr CDN dependency for strict-CSP / offline consumers).

**Fixed — optional-peer / recipe accuracy.** The recipe `§2a` tables drifted from what components actually import. Now generated from source truth (each component's imports × the build's externalized set):
- Added the missing peers: `sonner` (Toaster/Toast), `remark-gfm` (MarkdownViewer), `date-fns` (ScheduleView), `@tanstack/react-table` (DataTableToolbar).
- Removed phantom install instructions for bundled deps (`@tiptap/*`, `@emoji-mart/*`) and trimmed `charts` to the 4 d3 packages it directly imports.
- Recipes now warn that on **Vite 8 / Rolldown a missing peer does not fail the build** — it ships a bundle that throws `Could not resolve "…"` at runtime. Fixed the Vite recipe's `App.tsx` default-export mismatch and the stale TanStack detection row in the recipe index.

No changes to non-emoji component APIs.
