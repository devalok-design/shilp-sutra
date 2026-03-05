/**
 * Extract initials from a person's name.
 * "John Doe" -> "JD", "Alice" -> "AL"
 */
export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return trimmed.slice(0, 2).toUpperCase()
}
