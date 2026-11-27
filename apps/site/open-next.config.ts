import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// THE PRERENDERED PAGES MUST BE SERVED FROM THE BUILD, NOT RE-RENDERED.
//
// /components/[slug], /docs/[slug] and their siblings read markdown from the
// repo with `fs` (lib/component-registry.ts and friends, REPO_ROOT =
// process.cwd()/../..). That works at BUILD time, when generateStaticParams
// prerenders every page. On workerd there is no filesystem, so a request-time
// render finds nothing and calls notFound().
//
// With no incremental cache (the previous bare `defineCloudflareConfig()`),
// OpenNext had nowhere to read the prerendered HTML from and re-rendered every
// request, so every component and doc page returned 404 after the move to
// Workers. Search Console reported 2,511 404s across devalok.in hosts on
// 26 Nov 2026, led by this site's component pages -- pages its own index links.
//
// The static-assets cache serves the build's prerendered output from Workers
// static assets. It fits because the site has no ISR and no revalidation:
// content changes only with a deploy. It is filled by
// `opennextjs-cloudflare populateCache`, which deploy-site.yml runs before
// `wrangler deploy` (that path skips `opennextjs-cloudflare deploy`, the
// command that would otherwise fill it).
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
})
