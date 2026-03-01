/**
 * Storybook mock for next/navigation.
 * Provides no-op implementations of common Next.js navigation hooks.
 */
export function useRouter() {
  return {
    push: (url: string) => console.log('[mock] router.push:', url),
    replace: (url: string) => console.log('[mock] router.replace:', url),
    back: () => console.log('[mock] router.back'),
    forward: () => console.log('[mock] router.forward'),
    refresh: () => console.log('[mock] router.refresh'),
    prefetch: () => Promise.resolve(),
  }
}

export function usePathname() {
  return '/'
}

export function useSearchParams() {
  return new URLSearchParams()
}

export function useParams() {
  return {}
}

export function redirect(url: string) {
  console.log('[mock] redirect:', url)
}

export function notFound() {
  console.log('[mock] notFound')
}
