# Light/Dark Mode Comprehensive Audit & Standardization Design

**Date:** 2026-03-02
**Status:** Council-approved design
**Scope:** Token hygiene, theme infrastructure, RSC preparation, visual audit, a11y hardening

---

## 1. Executive Summary

A 7-member expert council (DS Architect, A11y Expert, RSC/Next.js Specialist, Material Design, Radix/shadcn, IBM Carbon, Chakra UI) audited shilp-sutra's light/dark mode implementation across 125 components.

**Current health: 8/10.** The 3-tier token pipeline (primitives.css -> semantic.css -> tailwind preset.ts) is sound. All 140+ semantic color tokens have `.dark` variants. The CSS custom property approach is RSC-compatible by design.

**Key gaps found:**
- 11 hardcoded `rgba()` values in 4 karm components
- 598 uses of `bg-[var(--color-*)]` arbitrary values instead of Tailwind preset utilities
- No `prefers-color-scheme` system preference detection
- No flash-of-wrong-theme (FOWT) prevention script
- Theme toggle logic isolated in TopBar (not reusable)
- No `color-scheme` CSS property on `:root`
- No `forced-colors` or `prefers-contrast` media query support

---

## 2. Council Consensus

### Unanimous (all 7 agree)

| Decision | Rationale |
|----------|-----------|
| Fix hardcoded `rgba()` -> semantic tokens | Token discipline violation; breaks dark mode |
| Blocking `<script>` in `<head>` for FOWT prevention | ~200 bytes, reads localStorage -> prefers-color-scheme -> sets `.dark` before paint |
| Cookie-based theme persistence for RSC | `layout.tsx` reads cookie via `cookies()` at SSR time |
| Thin `useColorMode` hook, NOT heavy ThemeProvider | `"use client"` hook exposing `{ colorMode, setColorMode, toggleColorMode }` |
| `prefers-color-scheme` auto-detection | System preference as default, user override persisted |
| Do NOT adopt HSL channels | Wait for oklch or Tailwind v4 |
| Set `color-scheme: light|dark` on `:root` | Controls native form elements, scrollbars, `<dialog>` backdrops |

### Strong majority (5-6 of 7)

| Decision | Rationale |
|----------|-----------|
| Skip surface tint overlays | Explicit `layer-01/02/03` tokens are more auditable than opacity overlays |
| Skip algorithmic tonal palette generation | Hand-tuned dark values preserve Blooming Lotus brand heritage; add contrast *validation* instead |
| Zone theming: architecture-ready, don't implement | Ensure `.dark` can scope to any container; defer `data-theme` zones |
| Forced-colors + prefers-contrast: Phase 5 | Real requirement, separate sprint |

### Key disagreements (resolved)

| Topic | For | Against | Resolution |
|-------|-----|---------|------------|
| Surface tint overlays | Material Design | 6 others | **Skip** |
| Algorithmic dark palette | Material Design | shadcn, Carbon, DS Arch | **Skip** -- validate, don't generate |
| Zone theming now | Carbon | shadcn, DS Arch | **Defer** -- make architecture compatible |
| Forced-colors in scope | A11y Expert | Chakra, DS Arch | **Phase 5** |

---

## 3. Architecture Design

### 3.1 Token Hygiene: New Semantic Tokens

Add these tokens to `semantic.css` to replace hardcoded `rgba()` values:

```css
:root {
  /* Inset glow for elevated interactive elements */
  --color-inset-glow:         rgba(255, 255, 255, 0.25);
  --color-inset-glow-strong:  rgba(255, 255, 255, 0.16);
  --color-inset-glow-subtle:  rgba(255, 255, 255, 0.10);

  /* Surface overlays for segmented controls */
  --color-surface-overlay-light: rgba(255, 255, 255, 0.20);
  --color-surface-overlay-dark:  rgba(0, 0, 0, 0.12);

  /* Text shadow for on-color text */
  --color-text-shadow:        rgba(0, 0, 0, 0.15);
}

.dark {
  --color-inset-glow:         rgba(255, 255, 255, 0.10);
  --color-inset-glow-strong:  rgba(255, 255, 255, 0.08);
  --color-inset-glow-subtle:  rgba(255, 255, 255, 0.05);

  --color-surface-overlay-light: rgba(255, 255, 255, 0.08);
  --color-surface-overlay-dark:  rgba(0, 0, 0, 0.25);

  --color-text-shadow:        rgba(0, 0, 0, 0.40);
}
```

**Files to update:**
- `src/karm/custom-buttons/segmented-control.tsx` -- 7 rgba() values
- `src/karm/admin/dashboard/render-date.tsx` -- 4 rgba() values
- `src/karm/admin/break/edit-break.tsx` -- 1 rgba() value
- `src/karm/admin/dashboard/calendar.tsx` -- 1 rgba() value

### 3.2 Arbitrary Value Cleanup

**Problem:** 598 uses of `bg-[var(--color-*)]`, `text-[var(--color-*)]`, `border-[var(--color-*)]` across 118 files bypass the Tailwind preset and defeat:
- IDE autocomplete
- Tailwind's purging/treeshaking
- Static analysis / lint rules
- Theme documentation

**Solution:** Replace with existing preset utility names:

```diff
- bg-[var(--color-layer-01)]     ->  bg-layer-01
- text-[var(--color-text-primary)] ->  text-text-primary
- border-[var(--color-border-default)] ->  border-border
```

All tokens already have Tailwind mappings in `preset.ts`. This is a mechanical find-and-replace across the codebase.

**Missing preset mappings to add:** Check if any `var(--color-*)` usage references tokens not yet in `preset.ts` colors map, and add them.

### 3.3 `color-scheme` CSS Property

Add to `semantic.css`:

```css
:root {
  color-scheme: light;
}

.dark {
  color-scheme: dark;
}
```

This tells the browser to render native elements (scrollbars, form controls, `<dialog>` backdrop) in the matching scheme.

### 3.4 Theme Infrastructure: FOWT Prevention Script

A blocking inline `<script>` in `<head>` that runs before first paint:

```js
// src/scripts/theme-init.ts (exported as a string constant for Next.js)
(function() {
  try {
    var d = document.documentElement;
    var t = localStorage.getItem('theme');
    if (t === 'dark') {
      d.classList.add('dark');
    } else if (t === 'light') {
      // explicit light, do nothing
    } else {
      // no preference saved -- check system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        d.classList.add('dark');
      }
    }
  } catch(e) {}
})();
```

**For Next.js RSC integration:**

The consuming app's `layout.tsx` (server component) reads the `theme` cookie
via `cookies()` from `next/headers` and sets the class on `<html>` at SSR time.
If no cookie exists, the blocking script handles first-visit detection.
The script content is exported as a string constant from `src/scripts/theme-init.ts`
so the consuming app can inject it into `<head>` using their preferred method
(Next.js `<Script strategy="beforeInteractive">`, Remix `<Scripts>`, etc.).

Note: The consuming app is responsible for sanitizing/injecting the script safely
using their framework's recommended approach.

### 3.5 Thin `useColorMode` Hook

A `"use client"` hook -- NOT a context provider wrapping the tree:

```tsx
// src/hooks/use-color-mode.ts
"use client";

type ColorMode = 'light' | 'dark' | 'system';

export function useColorMode() {
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem('theme') as ColorMode) ?? 'system';
  });

  const setColorMode = useCallback((newMode: ColorMode) => {
    const root = document.documentElement;
    const resolved = newMode === 'system'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : newMode;

    root.classList.toggle('dark', resolved === 'dark');
    localStorage.setItem('theme', newMode);

    // Set cookie for SSR (httpOnly: false so client JS can read)
    document.cookie = `theme=${newMode};path=/;max-age=31536000;SameSite=Lax`;

    setModeState(newMode);
  }, []);

  const toggleColorMode = useCallback(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setColorMode(isDark ? 'light' : 'dark');
  }, [setColorMode]);

  // Listen for system preference changes when mode is 'system'
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return { colorMode: mode, setColorMode, toggleColorMode };
}
```

### 3.6 Extract Theme Toggle from TopBar

**Current:** `src/layout/top-bar.tsx` lines 76-93 contain all theme state management.

**After:** TopBar imports `useColorMode` and calls `toggleColorMode()`. Theme state is no longer TopBar's concern.

```diff
- const [theme, setTheme] = useState<'light' | 'dark'>('light')
- useEffect(() => { ... localStorage logic ... }, [])
- const toggleTheme = () => { ... toggle logic ... }
+ const { colorMode, toggleColorMode } = useColorMode()
```

### 3.7 AccentProvider Dark Mode Awareness

`src/karm/client/accent-provider.tsx` injects CSS custom properties for runtime brand colors but doesn't adjust values for dark mode. After the hook exists, AccentProvider can consume `useColorMode` to apply mode-appropriate accent values.

---

## 4. Execution Phases

### Phase 1: Token Hygiene (immediate)
1. Add 6 new semantic tokens (inset-glow, surface-overlay, text-shadow) with `.dark` variants
2. Replace 11 hardcoded `rgba()` values in 4 components
3. Add `color-scheme: light` / `color-scheme: dark` to `semantic.css`
4. Add missing Tailwind preset color mappings (if any)
5. Run automated contrast audit on all token pairs in both modes

### Phase 2: Arbitrary Value Cleanup (systematic)
1. Identify all `bg-[var(--color-*)]` / `text-[var(--color-*)]` / `border-[var(--color-*)]` usages
2. Map each to its corresponding Tailwind preset utility name
3. Replace across 118 files (mechanical, can be partially automated)
4. Verify no regressions via Storybook visual check
5. Add lint rule to prevent future arbitrary value usage for token colors

### Phase 3: Theme Infrastructure
1. Create `src/hooks/use-color-mode.ts` with `useColorMode` hook
2. Create `src/scripts/theme-init.ts` with FOWT prevention script
3. Refactor TopBar to use `useColorMode` instead of internal state
4. Add `prefers-color-scheme` system preference detection
5. Add cookie-based persistence alongside localStorage
6. Update AccentProvider for dark mode awareness

### Phase 4: Visual Audit
1. Render every component in both light and dark mode via Storybook
2. Verify contrast ratios meet WCAG AA (4.5:1 text, 3:1 non-text)
3. Check shadow/elevation perception in dark mode
4. Verify focus ring visibility (`--color-focus`) in both modes
5. Check status colors (success/error/warning/info) surfaces in dark mode
6. Verify chart palette legibility in dark mode

### Phase 5: Accessibility Hardening (future sprint)
1. `@media (forced-colors: active)` fallbacks on all interactive components
2. `@media (prefers-contrast: more)` token layer with boosted borders and contrast
3. APCA contrast checks in CI pipeline
4. Automated a11y tests for both modes (axe-core integration)

---

## 5. Files Affected

### New files
- `src/hooks/use-color-mode.ts` -- thin color mode hook
- `src/scripts/theme-init.ts` -- FOWT prevention script (exportable for Next.js)

### Modified files
- `src/tokens/semantic.css` -- new tokens, `color-scheme` property
- `src/tailwind/preset.ts` -- new color mappings (if needed)
- `src/layout/top-bar.tsx` -- extract theme logic
- `src/karm/custom-buttons/segmented-control.tsx` -- replace rgba()
- `src/karm/admin/dashboard/render-date.tsx` -- replace rgba()
- `src/karm/admin/break/edit-break.tsx` -- replace rgba()
- `src/karm/admin/dashboard/calendar.tsx` -- replace rgba()
- `src/karm/client/accent-provider.tsx` -- dark mode awareness
- ~118 files with arbitrary value replacements (Phase 2)

---

## 6. Decisions Deferred

| Decision | When | Trigger |
|----------|------|---------|
| oklch color space migration | Tailwind v4 adoption | When Tailwind v4 is stable and adopted |
| Zone theming (`data-theme` on subtrees) | When Karm needs mixed-theme layouts | Dashboard request for light sidebar + dark content |
| Surface tint / elevation overlays | oklch + `color-mix()` support | When `color-mix()` has >98% browser support |
| Component-level tokens | When consumer override requests arrive | External consumers need per-component customization |
| 4-theme system (like Carbon) | Never planned | Two themes (light/dark) + zone theming is sufficient |

---

## 7. Success Criteria

- [ ] Zero hardcoded `rgba()` color values in component code
- [ ] Zero `bg-[var(--color-*)]` arbitrary values (all use preset utilities)
- [ ] `prefers-color-scheme` detection works on first visit
- [ ] No FOWT on page load (blocking script prevents flash)
- [ ] TopBar theme toggle uses shared `useColorMode` hook
- [ ] `color-scheme` property set on `:root` for both modes
- [ ] All component text meets WCAG AA contrast (4.5:1) in both modes
- [ ] All non-text elements meet 3:1 contrast in both modes
- [ ] Focus rings visible in both light and dark mode
- [ ] Cookie-based persistence works for SSR/RSC scenarios
