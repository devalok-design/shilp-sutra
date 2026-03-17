import { MemberDiffBlock } from './member-diff'
import { MemberListBlock } from './member-list'
import { ProjectListBlock } from './project-list'
import { AnnouncementPreviewBlock } from './announcement-preview'

export const karmBlockRegistry = {
  member_diff: MemberDiffBlock,
  member_list: MemberListBlock,
  project_list: ProjectListBlock,
  announcement_preview: AnnouncementPreviewBlock,
} as const
