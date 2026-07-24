# shell/app-command-palette — finish-bar audit
Finish: 3/5   Market: PARITY (cmdk)   Rebuild: polish

AppCommandPalette is a **headless data-shaping wrapper** over `composed/CommandPalette`. It renders no
surface, color, or motion of its own — it maps `SearchResult` / `CommandRegistry` data into the base's
`groups` prop and forwards controlled/uncontrolled state, keybinding, maxHeight, emptyState, and footerHints
straight through. The architecture is the correct "compose, don't re-roll" bar. Nearly all findings are
API/vocabulary/docs/testing; the visual/motion/theming axes are delegated to the base (`command-palette.tsx`,
audited separately) and scored N/A here per the utility-component rule — with inherited defects noted, not
penalized against this file.

## Scores
| Axis | Verdict | Note |
|---|---|---|
| visual-integrity | N/A | Owns zero visual code. Inherits the base's `border-card-strong` **dead class** (kbd chips + footer, 5 uses) — a real rendered bug, but it lives in `composed/command-palette.tsx`, not here. Flagged systemically. |
| accessibility | gap | This wrapper *invents* the `isSearching` loading concept but exposes it only as a group-label string ("Searching…"). No `aria-busy` on the listbox, no `aria-live` announcing "N results" on async swap. Base's combobox/listbox/option + `aria-activedescendant` roles are otherwise sound (inherited). |
| api-composability | gap | Strong: `forwardRef`+`displayName`, controlled+uncontrolled forwarded, `ReactNode` where needed, composes base cleanly. Weak: `entityType` is free-form `string`; admin detection hinges on exact-case `'Admin'`/`'SuperAdmin'` literals (no `UserRole` union); dual `searchResults`/`searchResultGroups` with silent precedence; open `metadata`. |
| docs-dx | ✗ | Prop table omits ~9 shipped props (`searchResultGroups`, `searchResultsLabel`, `open`, `defaultOpen`, `onOpenChange`, `keybinding`, `maxHeight`, `emptyState`, `footerHints`); `SearchResult` shape missing `icon`/`rank`/`shortcut`/`href`. Worse: the example uses `role: 'admin'`, which the source's `'Admin'` check silently rejects — copy-pasting it yields zero admin pages. |
| testing | ✗ | Test **mocks the entire base** to a stub `<div>`, so `axe()` validates nothing real. The "passes X to CommandPalette" cases only assert `container.firstChild` exists — they never assert the prop reached the mock. Zero coverage of the wrapper's actual logic: admin gating, rank sort, flat-vs-grouped precedence, label resolution, `searchResultToCommandItem`. Render-smoke only. |
| motion | N/A | Declares no motion. Base guards `useMotion().reducedMotion`. Inherited note: base staggers item entrance `delay: itemIndex * 0.03`; this wrapper is what feeds rapidly-changing result lists via `onSearch`, so that stagger re-fires each keystroke (base's defect, this wrapper's trigger). |
| state-coverage | gap | Owns loading/empty semantics and under-delivers: `if (searchResults.length === 0) return []` means during a live search-with-no-results-yet the palette shows the base's generic "No results found" *failure* message, not a searching affordance. `isSearching` only relabels a group that exists once results arrive. |
| content-resilience | ✓ | Data shaping handles zero/one/many groups, rank sorting (stable, gated on any `rank != null`), flat and grouped inputs. Truncation (`truncate` / `line-clamp-1`) and RTL are handled by the base. |
| theming-resilience | N/A | Owns no tokens; delegates to base (semantic tokens, radius roles). Base's `top-[20%]`/`max-w-[560px]` are layout arbitraries, theme-neutral. |
| system-cohesion | ✓ | Composes the base primitive as the single rendering source of truth — the finish-bar behavior at the shell layer. Minor drift: the stringly `'Admin'`/`'SuperAdmin'` convention isn't a shared DS type. |
| craft | gap | Nice: `rank`-based relevance sort, `shortcut` keycaps, registry-driven pages. Anti-craft footgun: case-sensitive admin gate means `role: 'admin'` (the *documented* value) silently grants nothing — a trap a user hits and can't see. |
| perceived-performance | N/A | Re-maps groups via `useMemo`; no owned rendering. Inherited: base re-staggers on keystroke (see motion). |
| market-benchmark | gap | vs **cmdk** — LEADS on app conveniences (admin gating, ranking, registry, server-search callbacks, shortcut hints). LAGS on a real loading primitive (cmdk `<Command.Loading>` + aria), fuzzy scoring (we do substring `includes`, not scored match), and a composable slot API. Net PARITY. |
| cross-ds | ✓ | Concrete import targets identified below. |

## Top gaps (prioritized)
- **[P0] docs-dx** — Doc example `role: 'admin'` is silently rejected by the `'Admin'`/`'SuperAdmin'` check; ~9 props + 4 `SearchResult` fields undocumented → regenerate the prop table from source and either fix the example to `'Admin'` or make admin detection case-insensitive.
- **[P1] testing** — Tests mock the base and assert only "renders", voiding the axe check and covering none of the wrapper's logic → drop the blanket mock (or add unmocked logic tests) and assert admin gating, rank sort, group precedence, and label resolution directly.
- **[P1] accessibility / state-coverage** — `isSearching` is silent to AT and shows a "no results" failure during loading → thread `isSearching` as `aria-busy`, add an `aria-live="polite"` results-count status, and emit a "Searching…" placeholder group when `isSearching && results.length === 0` (ideally push into the base so all consumers benefit).
- **[P2] api-composability** — Export a `UserRole` union (or case-insensitive detect) and a documented `EntityType`; document the `searchResults` vs `searchResultGroups` silent precedence, ideally with a dev warning when both are passed.
- **[P2] docs-dx (stories)** — Story titles leak internal tags ("Consumer-Owned Routing (P0 #1)", "(P1 #5)", "(P2 #10)") into shipped autodocs → rename to plain descriptive titles. Also: no story wraps the component in `CommandRegistryProvider`, so the headline "Pages"/"Admin" navigation renders as empty headers in every story — add a registry-backed story.
- **[systemic] border-card-strong** — Dead class in the base this component renders; see systemic flag. Not fixable here, but degrades this component's actual UI (kbd chips + footer show no border).

## What it does well
- **Clean composition** — pure data-shaping over `composed/CommandPalette`; no re-rolled surface/overlay/motion. Correct `forwardRef` + `displayName`, `ref` typed to `HTMLDivElement`, `Omit<'onSearch'>` to retype the callback, no `any`/`React.FC`.
- **Full controlled + uncontrolled** forwarding (`open`/`defaultOpen`/`onOpenChange`) plus `keybinding`/`maxHeight`/`emptyState`/`footerHints` pass-through.
- **App conveniences a raw command lib lacks** — role/`isAdmin`-gated command groups, relevance `rank` sorting, per-result `shortcut` keycaps, custom result icons, and a registry-provider indirection so pages live outside the palette.
- **Consumer-owned routing done right** — `onSearchResultSelect` fully cedes navigation to the consumer, with `href` as a sane fallback.

## Cross-DS adoption ideas
- **cmdk `<Command.Loading>`** — a first-class loading primitive with `aria-busy`; adopt the pattern so `isSearching` renders a real, announced searching state instead of a relabeled group.
- **cmdk `command-score` fuzzy matching** — replace the base's substring `includes` filter with a scored fuzzy match so "flgn" finds "Fix login…"; expose ranking that blends fuzzy score with the existing `rank`.
- **Linear / Raycast recents & frequency** — surface a "Recent" / "Frequently used" group from usage, above search results, keyed off the registry.
- **Raycast nested actions** — a per-item action submenu (⌘K within the palette) for secondary actions on a result, instead of one flat `onSelect`.

## Rebuild note
**Polish, not rebuild.** The architecture is exactly right — a thin data-shaping wrapper that composes the base
primitive. Every gap is an in-place fix: (1) regenerate the doc prop table + fix the `role` example (or make
detection case-insensitive); (2) rewrite the test to exercise real logic without mocking the base to death;
(3) thread `aria-busy` + `aria-live` and a "Searching…" placeholder for the loading window; (4) type
`entityType`/`role` and document the results-prop precedence; (5) de-tag story titles + add a
`CommandRegistryProvider`-backed story. The one bug that materially degrades its rendered UI —
`border-card-strong` — is not this file's to fix; it belongs to `composed/command-palette.tsx`.
