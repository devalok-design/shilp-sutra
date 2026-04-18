---
'@devalok/shilp-sutra': minor
---

**Forced-colors (Windows high-contrast) support.** Added `@media (forced-colors: active)` block in `semantic.css` that maps every semantic color token to system keywords (Canvas, CanvasText, Highlight, HighlightText, LinkText, GrayText, Mark, ButtonText, VisitedText). Applies to both light and dark themes — forced-colors is orthogonal to theme. Also adds belt-and-suspenders focus-ring outline (Highlight) and forced visible borders on interactive elements so ghost/link buttons remain perceivable. Decorative grain (`[data-grain]`) is hidden, skeleton shimmer freezes. Zero runtime impact when forced-colors is inactive.

**FormField auto-wires Label + Input ids.** `FormField` now publishes an `inputId` via context. `Label` reads `htmlFor` from it, `Input` reads `id` from it, unless either is explicitly set on the child. Eliminates manual id-juggling and a whole class of Label-input mismatch bugs.

**Toast error variants announce assertively.** `toast.error()` now renders `role="alert"` + `aria-live="assertive"` + `aria-atomic="true"` so screen readers interrupt speech on errors. Other toast types remain `role="status"` + `aria-live="polite"`. Upload toasts go assertive only when a file fails.

**Dev-mode warning for missing `<Toaster />`.** `toast()` called without a mounted `Toaster` now logs a one-time console warning pointing to the fix. Production-silent.

**Alert solid-variant body-text legibility.** Fixed two compounding bugs: body text was hardcoded to `text-surface-fg-muted` (grey), overriding the CVA's foreground on solid variants; and solid compound variants all used `text-accent-fg` instead of the matching per-color `-fg` token. Warning in particular was silently broken — white-on-amber fails contrast, dark-text-on-amber is the right pairing. Now uses per-color `text-{info|success|warning|error}-fg` on solid/filled variants, and skips the muted body override there.

**Per-color `-fg` tokens on non-accent status backgrounds.** Button async success/error states, BottomNavbar notification badge, and TopBar item badge now use `text-error-fg` / `text-success-fg` instead of `text-accent-fg`. No visible change today (all `-fg` tokens resolve to the same near-white), but brand-swap-safe — an override of `--color-accent-fg` won't silently mis-color error badges.

**vitest testTimeout 15s → 30s.** Sequential-file execution plus accumulated jsdom pressure on tiptap + axe tests at the tail of a full run was grazing the 15s wall. Isolated runs finish under 1s; real regressions still hit the new ceiling.

**Documentation cleanup.** Fixed six `data-table-*.md` stub files that shipped literal bash template headers to `llms-full.txt` (`# $(echo $f | sed ...)`). Reconstructed `packages/core/CHANGELOG.md` entries for 0.33.x–0.35.0 (was frozen at 0.33.0). Removed fake Button `variant="default"` / `"destructive"` aliases from the llms Props block (removed in 0.32.0). Updated README component counts (60+/14/7 → 78/29/8 + AI tier) and tech stack. Added Badge `truncate` prop to docs.

**Design preference codified.** `variant="soft"` is now the Devalok default over `variant="outline"` for non-primary Button actions. Captured in CLAUDE.md, llms.txt, and llms-full.txt.

**Forced-colors verification story.** New `Foundations → Forced Colors → Component Matrix` in Storybook with a solid-bg legibility sub-section showing every status color × every component (Button, Badge, BadgeIndicator, counter pills, checkables) side-by-side.

**CI: bundle budget excludes sourcemaps.** The 5MB bundle-size gate was measuring `dist` including `.map` files (~5.4MB of sourcemaps alone). Now measures runtime JS + CSS + types only, reporting sourcemaps separately for transparency.
