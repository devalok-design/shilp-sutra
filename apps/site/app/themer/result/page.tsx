import { redirect } from 'next/navigation'

interface ResultPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/**
 * The result view is now the always-visible preview panel at the bottom of
 * /theming, driven by the same query-param contract this page used to parse
 * (archetype/hue/chroma/density/shape/motion). Preserve the query string so
 * old shared/bookmarked result links still land on the right state.
 */
export default async function ResultPage({ searchParams }: ResultPageProps) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'string') qs.set(k, v)
  }
  const query = qs.toString()
  redirect(query ? `/theming?${query}` : '/theming')
}
