# Typography System Audit -- Phase 1b

**Phase:** 1b
**Auditor:** Claude
**Date:** 2026-04-12

## Overall Rating: Adequate (with one Critical Gap)

The typography system is architecturally sound -- the three-layer structure (primitives -> semantic tokens -> Text component) is well-designed, the variable font setup is correct, and the heading line-height/tracking curves follow good typographic principles. The critical gap is the complete absence of responsive typography, which means every consumer is solving the same mobile heading problem independently.

---

## Findings

### 1. Type Scale Ratio

**Rating:** Adequate

**Current State:**
The scale in px: 10, 12, 14, 16, 18, 20, 24, 32, 36, 48, 60 (11 steps, xs through 6xl).

Computed ratios between consecutive sizes:
| Step | Sizes | Ratio |
|------|-------|-------|
| xs -> sm | 10 -> 12 | 1.200 |
| sm -> md | 12 -> 14 | 1.167 |
| md -> base | 14 -> 16 | 1.143 |
| base -> lg | 16 -> 18 | 1.125 |
| lg -> xl | 18 -> 20 | 1.111 |
| xl -> 2xl | 20 -> 24 | 1.200 |
| 2xl -> 3xl | 24 -> 32 | 1.333 |
| 3xl -> 4xl | 32 -> 36 | 1.125 |
| 4xl -> 5xl | 36 -> 48 | 1.333 |
| 5xl -> 6xl | 48 -> 60 | 1.250 |

This is not a mathematical ratio. Ratios swing from 1.111 to 1.333. The 32->36 step (1.125) followed by 36->48 (1.333) is suspicious.

**World-Class Standard:**
- Material Design 3: Intentionally non-mathematical but tuned per role with deliberate optical rationale.
- IBM Carbon: Major-third (1.25) backbone with optical adjustments.
- Utopia: Mathematically consistent from a chosen ratio (typically 1.2-1.333).

**Gap Analysis:**
The scale works but evolved organically rather than being designed as a cohesive system. Low-priority concern.

**Recommendation:** Document the rationale for current values. Consider whether 4xl (36px) earns its place in a future v1.0 revision.

**Effort:** S
**Priority:** P2

---

### 2. Scale Completeness

**Rating:** Strong

**Current State:**
11 sizes (xs-6xl) covering 10px to 60px. The `xs` at 10px (0.625rem) is small but used only for niche roles (badge counts, fine print).

**World-Class Standard:**
- Material Design 3: 15 roles, ranging 11px to 57px (they go as small as 11px)
- IBM Carbon: 14 sizes, 12px to 96px (they floor at 12px)
- WCAG: No minimum px rule; 10px at 200% zoom = 20px, which is fine

**Gap Analysis:**
10px is borderline for readability. 60px top is sufficient for app UI (96px is for marketing pages).

**Recommendation:** Add lint guidance that `body-xs`/`label-xs` (10px) should never be sole carrier of important information.

**Effort:** S
**Priority:** P2

---

### 3. Semantic Variants

**Rating:** Adequate

**Current State:**
18 variants: heading-2xl through heading-xs (6), body-lg through body-xs (4), label-lg through label-xs (4), caption, overline (2).

**World-Class Standard:**
- Material Design 3: 15 roles across 5 categories (Display, Headline, Title, Body, Label)
- IBM Carbon: Headings 1-7, Body variants, Code, Labels, Helper text, Legal, Caption, plus Productive/Expressive modes

**Gap Analysis — Missing roles:**
1. **`code`/`mono`** — No monospace text variant. Code snippets, API keys need a first-class variant.
2. **`lead`/`body-xl`** — Body tops at 16px. No lead paragraph variant (18-20px) for introductory text.
3. **`subtitle`/`title`** — MD3 splits from headings. heading-xs (20px/400) is barely distinguishable from body-lg (16px/400).
4. **`blockquote`** — Only exists in prose as hardcoded class.
5. **`helper`** — Dedicated hint/description text role.

**Recommendation:** Add `code` and `lead` variants at minimum. `code` is the most obvious gap.

**Effort:** M
**Priority:** P1 (code), P2 (lead, others)

---

### 4. Font Stack

**Rating:** Strong

**Current State:**
- Primary: Inter variable (344KB woff2) with `system-ui, sans-serif` fallback
- Accent: Ranade variable (38KB woff2) with `sans-serif` fallback
- Mono: "SF Mono", "Fira Code", monospace (no bundled file)
- Total font payload: ~796KB (all), ~382KB (upright only)

**World-Class Standard:**
- Vercel Geist: Custom variable, subseted per page (~30-80KB per subset)
- Carbon: IBM Plex, variable woff2, with extensive subsetting
- Best practice: Variable fonts (yes), woff2 (yes), subset to used ranges (not done)

**Gap Analysis:**
Inter at 344KB is heavy — full Unicode range. Subsetting to Latin + Latin Extended would cut to ~80-100KB (3-4x reduction). No `size-adjust`/`ascent-override` on @font-face declarations means CLS during swap. Mono stack only works on macOS or with Fira Code installed.

**Recommendation:**
1. Subset Inter to Latin + Latin-Extended (~80KB)
2. Add `size-adjust` for Inter fallback alignment (reduces CLS)
3. No action on Ranade (appropriately lightweight)

**Effort:** M
**Priority:** P1

---

### 5. Line Height Pairings

**Rating:** Strong

**Current State:**
- Headings: tight (1.15) for 2xl-md, snug (1.25) for sm-xs
- Body: relaxed (1.5) for all sizes
- Labels: snug (1.25)
- Caption: normal (1.4), Overline: loose (1.6)

**World-Class Standard:**
- Material Design 3: Per-size tuned pairings
- Typographic principle: Large=tight (1.1-1.2), body=more air (1.4-1.6), small=slightly more (1.5-1.7)

**Gap Analysis:**
The system follows correct general pattern. One minor concern: all four body sizes use same 1.5 — body-lg (16px) at 1.5 may be slightly loose for compact UI.

**Recommendation:** Low-priority consideration to use `normal` (1.4) for body-lg in UI contexts.

**Effort:** S
**Priority:** P3

---

### 6. Letter Spacing Per Size

**Rating:** Adequate

**Current State:**
- Headings: -0.025em (large) tapering to 0 (heading-xs) — correct
- Body: All four sizes use -0.02em — problematic at small sizes
- Labels: +0.06em (widened for uppercase)

**World-Class Standard:**
- Material Design 3: body-small (12px) gets +0.4px tracking
- Typographic principle: Small text should have neutral or positive tracking

**Gap Analysis:**
body-sm (12px) at -0.24px and body-xs (10px) at -0.2px have negative tracking on small text — opposite of typographic best practice. MD3 gives body-small positive +0.4px.

**Recommendation:**
Differentiate body tracking:
- body-lg (16px): -0.01em or 0
- body-md (14px): 0
- body-sm (12px): +0.01em
- body-xs (10px): +0.02em

**Effort:** S (4 CSS value changes)
**Priority:** P1 — directly affects readability of small text

---

### 7. Responsive Typography

**Rating:** Critical Gap

**Current State:**
Zero responsive behavior in semantic typography. The entire system is static. A 60px heading on a 375px phone is 16% of viewport width — it will overflow or wrap awkwardly.

Only responsive rule is a deprecated legacy class:
```css
@media (max-width: 767px) { .T5-Reg { font-size: 16px; } }
```

**World-Class Standard:**
- Utopia: `clamp(min, preferred, max)` with viewport-relative values
- Material Design 3: Recommends scaling display/headline on compact viewports
- IBM Carbon: Explicit breakpoint-based type scale overrides
- Every major design system has responsive typography. This is table stakes.

**Gap Analysis:**
This is the most significant gap in the typography system. heading-2xl (60px) is comically large on mobile. Consumers must write their own `text-ds-3xl md:text-ds-5xl`, defeating the purpose of semantic variants.

**Recommendation:**
Implement `clamp()`-based fluid scaling for heading sizes — non-breaking change:
```css
--font-size-6xl: clamp(2.25rem, 1.5rem + 3vw, 3.75rem);  /* 36px -> 60px */
--font-size-5xl: clamp(2rem, 1.25rem + 2.5vw, 3rem);      /* 32px -> 48px */
--font-size-4xl: clamp(1.75rem, 1.25rem + 1.5vw, 2.25rem); /* 28px -> 36px */
--font-size-3xl: clamp(1.5rem, 1.125rem + 1.25vw, 2rem);   /* 24px -> 32px */
```
Body sizes (xs-base) remain static.

**Effort:** S-M (calculate clamp values, test)
**Priority:** P0 — single biggest improvement possible

**Affected Components:** Every component using heading variants

---

### 8. Font Loading

**Rating:** Strong

**Current State:**
All @font-face use `font-display: swap` and woff2 variable fonts.

**World-Class Standard:**
- `swap` is correct for body fonts
- `optional` preferred for non-critical accent fonts
- `preload` hints for critical fonts
- Font metric overrides reduce CLS

**Gap Analysis:**
`swap` is too aggressive for Ranade (accent font) — `optional` would be better. No preload hints. No `size-adjust` metric overrides for fallback alignment.

**Recommendation:**
1. Change Ranade to `font-display: optional`
2. Document recommended `<link rel="preload">` tags
3. Add `size-adjust` for Inter fallback

**Effort:** S
**Priority:** P2

---

### 9. Weight Distribution

**Rating:** Adequate

**Current State:**
5 weights: light (300), regular (400), medium (500), semibold (600), bold (700).

Usage: light (300) is unused everywhere — zero hits in component files. All headings use 400 (regular). Only labels use 600 (semibold).

**World-Class Standard:**
- MD3: 400 and 500 as primary; 700 for emphasis
- Carbon: 300, 400, 600 as primary
- Geist: Primarily 400 and 700

**Gap Analysis:**
1. Light (300) is phantom — unused, a readability trap at small sizes
2. All headings at 400 — heading-xs (20px/400) barely distinguishable from body-lg (16px/400)

**Recommendation:**
1. Remove or deprecate light (300)
2. Consider bumping heading-xs/heading-sm to medium (500) weight

**Effort:** S
**Priority:** P2

---

### 10. Label Convention (Uppercase + Wide Tracking)

**Rating:** Adequate

**Current State:**
All label variants: `text-transform: uppercase`, `letter-spacing: 0.06em`, `font-weight: 600`.

**World-Class Standard:**
- MD3: Only label-small is uppercase; label-medium/large use title case
- Carbon: Sentence case by default; uppercase only for micro labels
- NNG research: ALL CAPS ~10% slower to read; acceptable for short labels but compounds legibility penalties at small sizes

**Gap Analysis:**
No mixed-case label variant exists. Consumers wanting "Email address" (sentence case, 14px, semibold) as a form label must use body-md + manual font-semibold, losing semantic intent. label-xs (10px uppercase) has triple legibility penalty.

**Recommendation:**
1. Add `label-plain` variant: same size/weight/tracking but no text-transform
2. Consider making label-xs mixed case

**Effort:** S-M
**Priority:** P1 — missing mixed-case label forces ad-hoc patterns

---

## Summary Table

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | Type scale ratio | Adequate | P2 | S |
| 2 | Scale completeness | Strong | P2 | S |
| 3 | Semantic variants | Adequate | P1 | M |
| 4 | Font stack | Strong | P1 | M |
| 5 | Line height pairings | Strong | P3 | S |
| 6 | Letter spacing per size | Adequate | P1 | S |
| 7 | Responsive typography | **Critical Gap** | **P0** | S-M |
| 8 | Font loading | Strong | P2 | S |
| 9 | Weight distribution | Adequate | P2 | S |
| 10 | Label convention | Adequate | P1 | S-M |

## Top 3 Actions

1. **Responsive typography (P0):** Add `clamp()` to heading font-size tokens. Zero component changes, zero breaking changes, massive mobile improvement.
2. **Body text letter-spacing (P1):** Small text has negative tracking — flip to neutral/positive for sm and xs. Four CSS value changes.
3. **Missing `code` variant + mixed-case label (P1):** Two most common ad-hoc typography workarounds consumers need.
