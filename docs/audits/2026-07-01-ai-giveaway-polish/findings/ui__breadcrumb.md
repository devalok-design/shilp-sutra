# ui/breadcrumb — audit
**Finish score:** 4/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:0 P1:2 P2:3 P3:1

## Findings

### [P1][F1/types] `separator` prop declared on root but never consumed — dead/leaky prop
- **Category:** composability / types
- **Evidence:** breadcrumb.tsx:10-13 — `React.ComponentPropsWithoutRef<'nav'> & { separator?: React.ReactNode }` then `({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />`
- **Why:** The root advertises a `separator` API that does nothing — it isn't read, isn't cascaded to `BreadcrumbSeparator` (no context), and because it's destructured into `...props` it gets spread onto the `<nav>` DOM node as an unknown `separator` attribute (React warning + invalid HTML attr). This is a phantom prop: a consumer passing `<Breadcrumb separator={<IconSlash/>}>` expecting all separators to change gets silently ignored. Classic shadcn copy artifact — the upstream component left this prop as a hint and it was never wired.
- **Fix:** Either (a) remove the `separator` prop entirely (the per-`BreadcrumbSeparator` `children` override already covers custom separators), or (b) wire it through a `BreadcrumbContext` that `BreadcrumbSeparator` reads for its default glyph. Given the doc explicitly teaches per-separator override, (a) is cleaner — drop it and don't spread it onto the nav.

### [P1][G2] Arbitrary `max-w-[20ch]` truncation width hardcoded, duplicated across two parts
- **Category:** drift / vocabulary
- **Evidence:** breadcrumb.tsx:47 (`min-w-0 truncate max-w-[20ch]`) and breadcrumb.tsx:61 (`min-w-0 truncate max-w-[20ch]`)
- **Why:** `20ch` is a magic arbitrary value, repeated in two places (Link + Page), with no token and no prop to tune it. Per-design-system convention this should be a sizing token or at least a single source. It also bakes a truncation policy with no escape hatch: a 21-char single-crumb path silently clips with no way to widen short of `className` override fighting the arbitrary value (specificity tie, `cn` ordering dependent). Not a hard tell, but it is a re-rolled, undocumented constant.
- **Fix:** Hoist to one shared class const (e.g. `crumbTruncate = 'min-w-0 truncate max-w-[20ch]'`) used by both, OR expose truncation as opt-in (apply `truncate max-w-*` only when a `truncate`-ish prop is set) since short breadcrumbs don't need it and truncation-by-default can clip legitimately short labels. Document the 20ch choice if kept.

### [P2][H] `BreadcrumbSeparator` / `BreadcrumbEllipsis` not `forwardRef`, inconsistent with the rest of the family
- **Category:** state-coverage / structural-tell
- **Evidence:** breadcrumb.tsx:68 `const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'li'>) =>` and breadcrumb.tsx:80 `const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) =>` — plain function components, no `forwardRef`.
- **Why:** Every other part (`Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`) is `forwardRef`. These two aren't, so a consumer can't `ref` them (measurement, focus mgmt for an interactive ellipsis-as-trigger). The doc itself suggests pairing the ellipsis with a DropdownMenu — that's exactly the case where you'd want a ref on the trigger element. Inconsistent ref support inside one compound family is a finish gap relative to the Card bar (every Card part forwards ref).
- **Fix:** Convert both to `React.forwardRef<HTMLLIElement, ...>` / `<HTMLSpanElement, ...>` to match the family.

### [P2][F2] `BreadcrumbEllipsis` has no `asChild` despite documented DropdownMenu-trigger use case
- **Category:** composability
- **Evidence:** breadcrumb.tsx:80-91 renders a fixed `<span role="presentation" aria-hidden="true">`; doc breadcrumb.md:33 — "Pair with a DropdownMenu (open the ellipsis to show hidden intermediate items)".
- **Why:** The documented advanced pattern is "make the ellipsis open a menu of hidden crumbs," but the ellipsis is hardwired to a non-interactive `aria-hidden` span. To make it a real trigger a consumer must abandon `BreadcrumbEllipsis` and hand-roll the markup (losing the `sr-only "More"` + icon sizing). `BreadcrumbLink` got `asChild`; the ellipsis — the one part with a real polymorphism need — didn't.
- **Fix:** Add `asChild?: boolean` (Slot) to `BreadcrumbEllipsis`, and when used interactively drop `aria-hidden`/`role="presentation"` so the trigger is reachable. Keep the `sr-only "More"` as the accessible name.

### [P2][docs/J] Doc claims `BreadcrumbSeparator` is "auto-rendered" — it is not
- **Category:** docs
- **Evidence:** breadcrumb.md:12 `BreadcrumbSeparator (auto-rendered or custom)` vs source: separators are explicit children in every story/test; there is no auto-insertion logic in breadcrumb.tsx.
- **Why:** Docs/source drift — the component never auto-renders separators; the consumer places each `<BreadcrumbSeparator />` manually (as all stories show). "auto-rendered" misleads an AI agent or human into expecting separators to appear without markup.
- **Fix:** Change to `BreadcrumbSeparator (chevron by default, override via children)`.

### [P3][types] Exported `BreadcrumbLinkProps` omits the `asChild` prop the component actually accepts
- **Category:** types
- **Evidence:** breadcrumb.tsx:94 `export type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'a'>` — but the component's own prop type (breadcrumb.tsx:39) is `React.ComponentPropsWithoutRef<'a'> & { asChild?: boolean }`.
- **Why:** The public exported type is narrower than the real prop surface — a consumer typing a wrapper with `BreadcrumbLinkProps` loses `asChild`. Minor inferred-vs-exported mismatch.
- **Fix:** `export type BreadcrumbLinkProps = React.ComponentPropsWithoutRef<'a'> & { asChild?: boolean }` (or derive from the component's prop interface).

## Composability gaps
- Phantom `separator` prop on root (F1): an API that looks composable but is inert — remove or wire via context.
- `BreadcrumbEllipsis` lacks `asChild` (F2) despite being the documented DropdownMenu trigger seam.
- Two of seven parts skip `forwardRef`, so refs aren't uniformly available across the compound family.
- No `BreadcrumbContext`, so there's no place to set a family-wide separator/size — every separator is hand-placed. Acceptable (matches shadcn's deliberate "semantic shape only" stance, and the doc states this intentionally), so not flagged as a defect — but it's why the `separator` prop can't work as written.

## Motion gaps
- None of substance. The only motion is `transition-colors duration-fast-01 ease-productive-standard` on `BreadcrumbLink` hover (breadcrumb.tsx:47) — intentional, token-bound, color/opacity-class only (no layout-prop animation), and a color transition needs no reduced-motion guard. No bounce, no entrance spring, no robotic uniform timing. Clean against M1–M5.
- Minor (not a finding): hover changes color but there's no `focus-visible` color shift beyond the ring; the ring alone is sufficient, so this is fine.

## Polish plan (ordered steps to reach the finish bar)
1. Remove the inert `separator` prop from the `Breadcrumb` root (or wire it through a `BreadcrumbContext` consumed by `BreadcrumbSeparator`). Stop it leaking onto the `<nav>`. (P1)
2. Hoist the duplicated `min-w-0 truncate max-w-[20ch]` into one shared const; consider making truncation opt-in rather than a default that can clip short labels. (P1)
3. Convert `BreadcrumbSeparator` and `BreadcrumbEllipsis` to `forwardRef` for family consistency. (P2)
4. Add `asChild` to `BreadcrumbEllipsis` and shed `aria-hidden`/`role="presentation"` when interactive, so the documented DropdownMenu-trigger pattern works without re-rolling markup. (P2)
5. Fix the doc: separators are not auto-rendered. (P2)
6. Widen exported `BreadcrumbLinkProps` to include `asChild`. (P3)

## Clean (rubric dims that pass)
- **V1–V8 visual tells:** none. No accent rail, no double-edge (it's plain text nav, no surface), no gradient text, no indigo/violet/slate-as-brand (uses `text-surface-fg-muted` / `text-accent-9` semantic tokens), no emoji icons (uses `IconChevronRight`/`IconDots` via the Icon API), no blob/glass/glow, single radius (`rounded-control-inner` for the focus ring only), no pill spam.
- **V9–V15 reflexes:** none — no hardcoded font, no decorative numbering, not everything-a-card, no eyebrow kicker, no all-caps default.
- **E1–E8 verbal tells:** doc + stories are clean. No em-dash tic (the `—` in this findings file is mine, not the component's), no AI vocabulary, no meta-hedging, no over-structuring. Story labels are plausible product strings (Karm/Projects/Board/TASK-042), not "New/Beta/AI-powered" filler.
- **A11y (H):** strong — `<nav aria-label="breadcrumb">`, semantic `<ol>`/`<li>`, `aria-current="page"` on `BreadcrumbPage`, separators `aria-hidden role="presentation"`, ellipsis carries an `sr-only "More"`, real `focus-visible:ring-2` ring (not removed). Axe test present and passing.
- **G1 surface:** N/A — breadcrumb is inline chrome with no surface; correctly uses no `bg-surface-*`. No G1 violation.
- **G3 variant taxonomy:** N/A — no CVA variants (compound-only). No `filled`/`primary`/`small` drift.
- **F5:** correctly does NOT re-roll a surface — it's text nav, composing nothing is right here.
- **Tests + stories:** present (5 stories incl. ellipsis/single-item/deep-nesting; 8 tests incl. axe, landmark, aria-current, ref forwarding, className merge). Good coverage.
- **Tokens (G2):** spacing/typography all token-bound (`gap-ds-*`, `text-ds-md`, `duration-fast-01`, `ease-productive-standard`, `text-surface-fg*`) — the only re-rolled value is `max-w-[20ch]` (flagged above).
