# Phase 3: Security and Hygiene

## Unsafe HTML

| File | Pattern | Risk | Assessment |
|---|---|---|---|
| `composed/activity-feed.test.tsx:49` | `container.innerHTML` | None | Test assertion only, not production code |

**Verdict: CLEAN.** Zero instances of unsafe HTML injection in production component code. No `__html` props, no innerHTML assignments.

## Hardcoded Secrets/URLs

| File | Finding | Risk |
|---|---|---|
| `composed/file-preview.tsx:76-84` | YouTube, Vimeo, Figma, Loom embed URL construction | **None** — public embed endpoints, user-provided URL passed through `encodeURIComponent` |
| Various `.stories.tsx` files | `https://i.pravatar.cc`, `https://placehold.co`, `https://example.com` | **None** — Storybook demo data only |

**Verdict: CLEAN.** No API keys, tokens, passwords, or internal URLs in any source file.

## Dependency Vulnerabilities

### pnpm audit

2 HIGH severity issues found:

| Package | Vulnerability | Path | Risk |
|---|---|---|---|
| minimatch@10.2.1 | ReDoS via GLOBSTAR segments (GHSA-7r86-cg39-jmmj) | vite-plugin-dts > @microsoft/api-extractor | **Dev-only** — not in production bundle |
| minimatch@10.2.1 | ReDoS via nested extglobs (GHSA-23c5-xmqv-rm74) | vite-plugin-dts > @microsoft/api-extractor | **Dev-only** — not in production bundle |

**Verdict: LOW RISK.** Both vulnerabilities are in `vite-plugin-dts`, a dev-only dependency used during build. Not shipped to consumers. Fix: update `vite-plugin-dts` when a patched version is available.

### Vendored Radix Version

Vendored from commit `22473d16404b` (2026-03-01). Package versions range from 1.1.x to 2.2.x. No known CVEs for these Radix versions — Radix primitives are UI-only with no network/auth surface area.

## Code Hygiene

### console.log in production code

**1 instance found:**
- `shell/notification-preferences.tsx:133` — `console.error('[Preferences] Failed to save:', error)` — **Acceptable** (error logging in catch block)

All other `console.log` calls are in `.stories.tsx` files (Storybook demo callbacks). **CLEAN.**

### TODO/FIXME/HACK

**0 instances** in production `.tsx` files. The only match (`code.stories.tsx:56`) is a Prisma schema example string containing "TODO" as data, not a code comment.

### @ts-ignore / @ts-expect-error

**0 instances** in non-primitive `.tsx` files. The 83 `@ts-nocheck` in vendored primitives are expected.

### `any` type usage

| Location | Count | Assessment |
|---|---|---|
| Vendored primitives (`_internal/`) | ~15 | Expected — vendored code, not ours |
| `composed/bulk-action-bar.tsx:95` | 1 | `action.icon as any` — should be typed properly |
| `composed/markdown-viewer.tsx:80` | 1 | `{ Highlighter: any; style: any }` — lazy-loaded modules, acceptable |
| Test files | ~8 | Acceptable — test mocks and fixtures |
| Stories files | 2 | Acceptable — demo data |

**Verdict:** Only 2 `any` casts in production non-primitive code. Very clean.

## Summary

| Category | Status | Action Needed |
|---|---|---|
| Unsafe HTML | CLEAN | None |
| Hardcoded Secrets | CLEAN | None |
| Dep Vulnerabilities | LOW RISK | Update vite-plugin-dts when patched |
| console.log | CLEAN | None (1 acceptable error log) |
| TODO/FIXME | CLEAN | None |
| @ts-ignore | CLEAN | None (primitives expected) |
| `any` usage | CLEAN | 1 fix in bulk-action-bar |
