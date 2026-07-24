/**
 * shadcn-compatible registry endpoint.
 *
 *   /r/registry.json        → the registry index (list of items)
 *   /r/<slug>.json          → one registry-item (what `shadcn add @devalok/<slug>` fetches)
 *   /r/<slug>               → same, friendly bare form
 *
 * Consumers register the namespace once in components.json:
 *   { "registries": { "@devalok": "https://shilp-sutra.devalok.in/r/{name}.json" } }
 * then `npx shadcn@latest add @devalok/<slug>`.
 *
 * Force-static: the registry is derived from the preset source at build time, so
 * every response is prerendered. CORS is open (public data) for browser/MCP fetchers.
 */
import { buildRegistryIndex, buildRegistryItem, listPresetSlugs } from '@/lib/registry-build'

export const dynamic = 'force-static'
export const dynamicParams = false

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
}

export async function generateStaticParams() {
  const slugs = await listPresetSlugs()
  return [
    { name: 'registry.json' },
    { name: 'registry' },
    ...slugs.flatMap((s) => [{ name: `${s}.json` }, { name: s }]),
  ]
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const base = name.endsWith('.json') ? name.slice(0, -5) : name

  if (base === 'registry') {
    return Response.json(await buildRegistryIndex(), { headers: CORS })
  }

  const item = await buildRegistryItem(base)
  if (!item) {
    return Response.json(
      { error: `Unknown preset "${base}"`, availableNames: await listPresetSlugs() },
      { status: 404, headers: CORS },
    )
  }
  return Response.json(item, { headers: CORS })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS })
}
