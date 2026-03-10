import type { BoardMember } from './board-types'

export function collectAllMembers(
  columns: { tasks: { owner: BoardMember | null; assignees: BoardMember[] }[] }[],
): BoardMember[] {
  const seen = new Set<string>()
  const members: BoardMember[] = []
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.owner && !seen.has(task.owner.id)) {
        seen.add(task.owner.id)
        members.push(task.owner)
      }
      for (const a of task.assignees) {
        if (!seen.has(a.id)) {
          seen.add(a.id)
          members.push(a)
        }
      }
    }
  }
  return members
}

export function collectAllLabels(
  columns: { tasks: { labels: string[] }[] }[],
): string[] {
  const set = new Set<string>()
  for (const col of columns) {
    for (const task of col.tasks) {
      for (const l of task.labels) set.add(l)
    }
  }
  return Array.from(set).sort()
}
