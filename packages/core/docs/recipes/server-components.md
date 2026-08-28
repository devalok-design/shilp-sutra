# Server vs Client Components

Reference for using `@devalok/shilp-sutra` correctly inside React Server Components (Next.js App Router, TanStack Start, Remix v3+, Astro, future RSC frameworks).

## TL;DR

- **Always use per-component imports** (`@devalok/shilp-sutra/ui/button`, NOT `@devalok/shilp-sutra/ui`) — barrels drag in client-only siblings and trip the RSC barrel-import error.
- **Importing a client component into a Server Component is fine.** The client component renders as a client island at that point. The Server Component shell stays server-rendered.
- **What actually breaks RSC**, in order of frequency: (a) calling a client hook in a server file; (b) passing functions or class instances as props from server → client; (c) reading `window`/`document` in a server module's top-level body.
- The matrix below tells you which components have NO `"use client"` (so they SSR without hydration cost) vs. which become client islands (still importable, just hydrate).

## RSC-safety matrix

The list is generated from the `// @server-safe` source annotation. Components without the annotation get `"use client"` injected at build time and ship as client islands.

### `@devalok/shilp-sutra/ui`

| Server-safe (renders without hydration) | Everything else |
|---|---|
| `Text` | All other UI primitives become client islands when rendered |
| `Stack` | |
| `Container` | |
| `Skeleton` | |
| `Table` (and child components: `TableHeader`, `TableRow`, `TableCell`) | |
| `Code` | |
| `VisuallyHidden` | |

```tsx
// ✅ Server Component — Text/Stack/Container/etc. SSR with zero hydration cost
import { Text } from "@devalok/shilp-sutra/ui/text";
import { Stack } from "@devalok/shilp-sutra/ui/stack";

export default function ServerPage() {
  return (
    <Stack className="p-ds-08">
      <Text variant="heading-2xl">Server-rendered</Text>
    </Stack>
  );
}
```

```tsx
// ✅ Also fine — Button is a client component, but importing one into a Server
// Component just creates a client island at that boundary. No wrapper needed.
import { Button } from "@devalok/shilp-sutra/ui/button";

export default function ServerPage() {
  return <Button>Click</Button>;
}
```

```tsx
// ❌ NOT fine — passing a function as a prop from server → client.
// Functions are not serializable across the RSC boundary.
import { Button } from "@devalok/shilp-sutra/ui/button";

export default function ServerPage() {
  return <Button onClick={() => console.log("hi")}>Click</Button>;
  //              ^^^^^^^ — define handler inside a "use client" wrapper instead
}
```

When you need an event handler, define it inside a client component:

```tsx
// app/components/MyButton.tsx
"use client";
import { Button } from "@devalok/shilp-sutra/ui/button";

export function MyButton() {
  return <Button onClick={() => console.log("hi")}>Click</Button>;
}
```

### `@devalok/shilp-sutra/composed`

| Server-safe (renders without hydration) | Everything else |
|---|---|
| `ContentCard` | All other composed components become client islands when rendered |
| `PageHeader` | |
| `CardSkeleton` / `TableSkeleton` / `BoardSkeleton` / `ListSkeleton` | |
| `PageSkeletons` | |

### `@devalok/shilp-sutra/shell`

All shell components are client islands. They manage state (open/close, active route, viewport detection) and require hydration.

### `@devalok/shilp-sutra/ai`

All AI components are client islands. They manage conversation state, streaming responses, and command bar focus.

### `@devalok/shilp-sutra/hooks`

All hooks (`useColorMode`, `useIsMobile`, etc.) are client-only by definition (React hooks).

### `@devalok/shilp-sutra/utils`, `/ui/lib/utils`, `/ui/lib/motion`, `/ui/lib/date-utils`

Pure functions. Server-safe.

## Why barrel imports break RSC

The barrel re-exports every component in a layer. When a Server Component imports anything from `@devalok/shilp-sutra/ui`, the bundler walks the barrel and pulls in code from sibling components. If any sibling has `"use client"`, the bundler complains:

```
You're importing a component that needs useState. 
It only works in a Client Component.
```

Per-component imports avoid this — the bundler only walks the imported file's module graph.

This is also why **per-component imports tree-shake better** even in non-RSC frameworks. They're the recommended pattern everywhere.

## "use client" propagation

A component is server-safe only if:

1. It has no `"use client"` directive at the top of its source file
2. None of its imports have `"use client"` either (transitively)

We mark sources `// @server-safe` and a build-time check verifies the import graph stays clean. The `"use client"` directive is injected automatically during the build for components without that annotation.

If you fork the source and remove `"use client"` from a component that uses `useState`, the build will still inject it back unless you also remove the React-hook usage. Don't fight the system — wrap in a client component instead.

## Streaming and Suspense

All shilp-sutra components SSR cleanly. They have no client-only side effects at module top-level — no `window.*`, `document.*`, or `localStorage.*` access during render. Side effects happen in `useEffect`, which runs after hydration.

Use `<Suspense>` boundaries normally:

<!-- typecheck-skip: ClientHeavyComponent is the reader's own component -->
```tsx
import { Suspense } from "react";
import { CardSkeleton } from "@devalok/shilp-sutra/composed/loading-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <ClientHeavyComponent />
    </Suspense>
  );
}
```

Both `<Suspense>` and the skeletons are server-safe. The module exports
`CardSkeleton`, `TableSkeleton`, `BoardSkeleton` and `ListSkeleton` — pick the
one whose shape matches what is loading.

## Common RSC mistakes

### Mistake 1: Calling a client hook in a Server Component

```tsx
// ❌ — useColorMode is a React hook; hooks only run in client components
import { useColorMode } from "@devalok/shilp-sutra/hooks/use-color-mode";

export default function ServerPage() {
  const { colorMode } = useColorMode(); // breaks
  return <div>{colorMode}</div>;
}
```

Fix: use the hook inside a `"use client"` component.

### Mistake 2: Reading `window.*` in a server module's top level

```tsx
// ❌ — window is undefined on the server
const w = window.innerWidth;

export default function ServerPage() {
  return <p>{w}px</p>;
}
```

Fix: read inside a `useEffect` of a client component, or use `useIsMobile` in a client wrapper.

### Mistake 3: Passing functions as props from a Server Component to a client island

```tsx
// ❌ — function props are not serializable across the RSC boundary
import { Button } from "@devalok/shilp-sutra/ui/button";

export default function ServerPage() {
  return <Button onClick={() => console.log("hi")}>Click</Button>;
}
```

Fix: define the handler inside the client island, or use a Server Action and pass the action reference (Server Actions ARE serializable).

### Mistake 4: Barrel-importing into a Server Component

```tsx
// ❌ — pulls every UI primitive's module graph into the server file,
//      and any sibling with "use client" trips the bundler error.
import { Text } from "@devalok/shilp-sutra/ui";
```

Fix: per-component import.

```tsx
// ✅
import { Text } from "@devalok/shilp-sutra/ui/text";
```

## When in doubt

If you're unsure whether a component is server-safe, look at the source:

- `packages/core/src/ui/<name>.tsx` — top of file. The `// @server-safe` annotation marks components that ship without `"use client"`.
- `packages/core/src/composed/<name>/index.tsx` — same.

The matrix in this file is the authoritative public list. If you find a discrepancy, file an issue.
