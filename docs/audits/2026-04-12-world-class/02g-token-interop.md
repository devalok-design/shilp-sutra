# Phase 2g-h: Token Interoperability & Consumer DX Audit

**Phase:** 2g + 2h
**Auditor:** Claude
**Date:** 2026-04-12

---

## Phase 2g: Design Token Interoperability

### Overall Rating: Critical Gap

No machine-readable token format exists. No Figma sync. No Style Dictionary. Tokens are CSS-only. The `design-philosophy.md` claims "W3C Design Tokens" as a standard but this is not implemented.

---

### 2g-1: W3C Design Token Format

**Rating:** Critical Gap

**Current State:** Tokens exist exclusively as CSS custom properties. No `tokens.json`, no DTCG-format file. The `generate-scale.ts` utility outputs CSS strings only.

**World-Class Standard:** IBM Carbon, Shopify Polaris, Salesforce Lightning all publish DTCG-format tokens.

**Gap:** `design-philosophy.md` makes a false claim about W3C Design Tokens compliance.

**Recommendation:** Build DTCG export script using existing `generate-scale.ts` logic. Fix or remove the false claim in design-philosophy.md.

**Effort:** M | **Priority:** P1

---

### 2g-2: Figma Sync

**Rating:** Critical Gap

**Current State:** Zero Figma integration. No Tokens Studio, no plugin, no sync mechanism.

**Recommendation:** Once DTCG JSON exists, set up Tokens Studio sync.

**Effort:** M | **Priority:** P1

---

### 2g-3: Style Dictionary Pipeline

**Rating:** Critical Gap

**Current State:** No multi-platform token pipeline. Web + Tailwind only.

**Honest Assessment:** Shilp Sutra serves React/Next.js exclusively. No native mobile consumers. Style Dictionary would only be valuable for DTCG → Figma sync, not multi-platform output.

**Effort:** M | **Priority:** P2

---

### 2g-4: Designer Handoff

**Rating:** Gap

**Current State:** Designers access tokens via Storybook Foundations page (requires dev server) or reading CSS files. No standalone token reference.

**Recommendation:** Publish standalone colors/tokens page (like colors.radix-ui.com).

**Effort:** M | **Priority:** P2

---

## Phase 2h: Consumer Developer Experience

### Overall Rating: Strong (with one Gap)

---

### 2h-1: First-Use Experience

**Rating:** Strong

**Current State:** 4-5 steps (install, configure Tailwind, import tokens CSS, render component, + transpilePackages for Next.js). Clean README with exact code snippets.

**Standout:** `llms.txt` and `llms-full.txt` are world-class for AI agent consumption — ahead of the industry. 77 subpath exports enable granular imports. Optional peer deps properly marked.

**Gap:** No CLI scaffolding (vs shadcn `init`). transpilePackages requirement for Next.js is friction.

**Effort:** S (docs) / L (CLI) | **Priority:** P2

---

### 2h-2: Error Messages

**Rating:** Gap

**Current State:** Zero runtime detection of missing tokens CSS. If consumer forgets `import '@devalok/shilp-sutra/tokens'`, components render with transparent/broken backgrounds. No console warning.

**World-Class Standard:** Mantine's MantineProvider detects missing CSS. Chakra's ThemeProvider makes missing setup an obvious error.

**Recommendation:** Add dev-mode token-missing detection that warns: "Shilp Sutra tokens CSS not loaded."

**Effort:** S | **Priority:** P0

---

### 2h-3: Upgrade Experience

**Rating:** Adequate

**Current State:** MIGRATION.md covers v0.23-0.30 but not v0.32/v0.33 breaking changes. llms.txt has breaking changes documented. No codemods. No `@deprecated` JSDoc on outgoing APIs.

**Recommendation:** Backfill MIGRATION.md. Consider `@deprecated` JSDoc tags for one version before removal.

**Effort:** S | **Priority:** P1

---

### 2h-4: TypeScript DX

**Rating:** Strong

**Current State:** Strict mode, 54 exported prop interfaces, 30+ have rich JSDoc with 118 `@example` annotations. CVA variant types flow through to autocomplete. ~16 prop interfaces lack JSDoc.

**Recommendation:** Backfill JSDoc on remaining 16 interfaces.

**Effort:** M | **Priority:** P2

---

### 2h-5: Bundle Debugging

**Rating:** Adequate

**Current State:** 130+ subpath exports (excellent tree-shaking). Correct `sideEffects` field. Well-designed manualChunks. No consumer-facing bundle analysis docs.

**Recommendation:** Document "how to diagnose bundle size" guide. Consider publishing per-component size.

**Effort:** S | **Priority:** P3

---

## Summary Tables

### Phase 2g

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | W3C Design Token format | **Critical Gap** | P1 | M |
| 2 | Figma sync | **Critical Gap** | P1 | M |
| 3 | Style Dictionary | **Critical Gap** | P2 | M |
| 4 | Designer handoff | **Gap** | P2 | M |

### Phase 2h

| # | Item | Rating | Priority | Effort |
|---|------|--------|----------|--------|
| 1 | First-use experience | **Strong** | P2 | S-L |
| 2 | Error messages | **Gap** | **P0** | S |
| 3 | Upgrade experience | **Adequate** | P1 | S |
| 4 | TypeScript DX | **Strong** | P2 | M |
| 5 | Bundle debugging | **Adequate** | P3 | S |

## Top Actions

1. **P0 — Dev-mode token-missing warning** (S effort): Detect missing CSS vars, warn consumer.
2. **P1 — W3C DTCG export + Figma sync** (M effort): Transform existing tokens into machine-readable format.
3. **P1 — Backfill MIGRATION.md** (S effort): v0.32 and v0.33 breaking changes.
4. **P1 — Fix design-philosophy.md false claim** (trivial): Remove W3C Design Tokens bullet until implemented.
