---
"@devalok/shilp-sutra": patch
---

Rewrite the TanStack Start install recipe for the current Vite-plugin setup. The old recipe targeted the retired Vinxi era (`@tanstack/start`, `app.config.ts`, `@tanstack/start/config`) — that package is frozen at 1.120.x while the framework moved to `@tanstack/react-start` (1.168+) with a `vite.config.ts` `tanstackStart()` plugin, `src/routes/__root.tsx` using `createRootRoute` + `HeadContent`/`Scripts`, and CSS wired via a `?url` stylesheet in the root `head`. A consumer following the old recipe on current TanStack Start would hit a wall.
