import React from 'react'
import {
  // Navigation & Actions
  IconPlus, IconX, IconCheck, IconMinus, IconSearch,
  IconChevronRight, IconChevronDown, IconChevronUp, IconChevronLeft,
  IconArrowRight, IconArrowUp, IconArrowDown, IconArrowBackUp, IconArrowForwardUp,
  IconDots, IconDotsVertical, IconCornerDownLeft,

  // Status & Feedback
  IconAlertCircle, IconAlertTriangle, IconInfoCircle, IconCircleCheck,
  IconBan, IconServerOff, IconLoader2, IconBolt, IconSparkles,
  IconActivity, IconFlag,

  // Communication
  IconMessage, IconMessagePlus, IconMessageCircle, IconSend, IconBell, IconInbox,

  // Content & Files
  IconFile, IconFileText, IconFileCode, IconPhoto, IconFileSpreadsheet,
  IconFileZip, IconFileUnknown, IconPaperclip, IconArchive,
  IconDownload, IconUpload, IconLink,

  // User & Identity
  IconUser, IconUsers, IconUserPlus, IconUserMinus, IconUserCircle,
  IconLogout, IconSettings, IconShieldCheck,

  // Editing & Text
  IconPencil, IconEdit, IconBold, IconItalic, IconUnderline,
  IconStrikethrough, IconH2, IconH3, IconList, IconListNumbers,
  IconCode, IconListCheck, IconSquareCheck, IconChecks,

  // Layout & Navigation
  IconLayoutDashboard, IconLayoutSidebarLeftCollapse, IconLayoutKanban,
  IconCalendar, IconCalendarEvent, IconCalendarCheck,
  IconGripVertical, IconNavigation,

  // Media & Objects
  IconHeart, IconMoon, IconSun, IconRobot, IconCoffee, IconClock,
  IconHistory, IconShare, IconEye, IconEyeOff,
  IconCircle, IconSquare, IconTag,
  IconTrendingUp, IconTrendingDown, IconTrash,
  IconGitPullRequest, IconGitBranch, IconVideo, IconPackage,
  IconUmbrella, IconBook, IconClipboardList, IconColumns3,
  IconAdjustmentsHorizontal,
} from '@tabler/icons-react'
import type { Icon as TablerIcon } from '@tabler/icons-react'

/* ─── Shared styles ─────────────────────────────────────────────── */

const sectionStyle: React.CSSProperties = {
  marginBottom: '3rem',
}

const headingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  marginBottom: '1rem',
  borderBottom: '1px solid var(--color-border-subtle)',
  paddingBottom: '0.5rem',
}

const subheadingStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  marginBottom: '0.75rem',
  marginTop: '1.25rem',
}

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.5625rem',
  fontFamily: 'var(--font-mono, monospace)',
  color: 'var(--color-text-secondary)',
  marginTop: '0.25rem',
  textAlign: 'center',
  wordBreak: 'break-all',
  lineHeight: 1.2,
}

/* ─── Icon cell ─────────────────────────────────────────────────── */

interface IconCellProps {
  icon: TablerIcon
  name: string
  size?: number
  strokeWidth?: number
}

function IconCell({ icon: Icon, name, size = 24, strokeWidth }: IconCellProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '5.5rem',
        padding: '0.625rem 0.25rem',
        borderRadius: 'var(--radius-lg, 8px)',
        background: 'var(--color-layer-02, #f9f9f9)',
        border: '1px solid var(--color-border-subtle, #eee)',
        transition: 'background 0.15s',
      }}
      title={name}
    >
      <Icon size={size} stroke={strokeWidth} style={{ color: 'var(--color-text-primary)' }} />
      <span style={labelStyle}>{name.replace('Icon', '')}</span>
    </div>
  )
}

/* ─── Size comparison demo ──────────────────────────────────────── */

function SizeDemo() {
  const sizes = [
    { label: '16px (h-4 w-4)', size: 16 },
    { label: '18px', size: 18 },
    { label: '20px (h-5 w-5)', size: 20 },
    { label: '24px (default)', size: 24 },
    { label: '32px (h-8 w-8)', size: 32 },
    { label: '48px (h-12 w-12)', size: 48 },
  ]

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {sizes.map(({ label, size }) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-lg, 8px)',
              background: 'var(--color-layer-02, #f9f9f9)',
              border: '1px solid var(--color-border-subtle, #eee)',
            }}
          >
            <IconSearch size={size} style={{ color: 'var(--color-text-primary)' }} />
          </div>
          <span style={{ ...labelStyle, fontSize: '0.625rem' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Stroke comparison demo ────────────────────────────────────── */

function StrokeDemo() {
  const strokes = [1, 1.25, 1.5, 2, 2.5, 3]

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {strokes.map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-lg, 8px)',
              background: 'var(--color-layer-02, #f9f9f9)',
              border: '1px solid var(--color-border-subtle, #eee)',
            }}
          >
            <IconSettings size={28} stroke={s} style={{ color: 'var(--color-text-primary)' }} />
          </div>
          <span style={{ ...labelStyle, fontSize: '0.625rem' }}>stroke={s}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Color demo ────────────────────────────────────────────────── */

function ColorDemo() {
  const colors = [
    { label: 'text-primary', css: 'var(--color-text-primary)' },
    { label: 'text-secondary', css: 'var(--color-text-secondary)' },
    { label: 'text-placeholder', css: 'var(--color-text-placeholder)' },
    { label: 'interactive', css: 'var(--color-interactive)' },
    { label: 'text-error', css: 'var(--color-text-error)' },
    { label: 'green-500', css: 'var(--green-500)' },
    { label: 'yellow-500', css: 'var(--yellow-500)' },
  ]

  return (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      {colors.map(({ label, css }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-lg, 8px)',
              background: 'var(--color-layer-02, #f9f9f9)',
              border: '1px solid var(--color-border-subtle, #eee)',
            }}
          >
            <IconHeart size={28} style={{ color: css }} />
          </div>
          <span style={{ ...labelStyle, fontSize: '0.625rem' }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Category grid ─────────────────────────────────────────────── */

interface CategoryProps {
  title: string
  icons: Array<{ icon: TablerIcon; name: string }>
}

function Category({ title, icons }: CategoryProps) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <h4 style={subheadingStyle}>{title}</h4>
      <div style={gridStyle}>
        {icons.map(({ icon, name }) => (
          <IconCell key={name} icon={icon} name={name} />
        ))}
      </div>
    </div>
  )
}

/* ─── Main showcase ─────────────────────────────────────────────── */

export function IconographyShowcase() {
  return (
    <div style={{ maxWidth: '60rem' }}>
      {/* Size variations */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Size Variations</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Use Tailwind classes (<code>h-4 w-4</code>) or the <code>size</code> prop. Default is 24px.
        </p>
        <SizeDemo />
      </div>

      {/* Stroke variations */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Stroke Weight</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Control line thickness with the <code>stroke</code> prop. Default is 2.
        </p>
        <StrokeDemo />
      </div>

      {/* Color variations */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Color with Semantic Tokens</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          Icons inherit text color. Use Tailwind classes like <code>text-[var(--color-interactive)]</code> or inline styles.
        </p>
        <ColorDemo />
      </div>

      {/* Icon catalog */}
      <div style={sectionStyle}>
        <h3 style={headingStyle}>Icon Catalog</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>
          All icons used across the design system, organized by category. Tabler offers 5,000+ more at{' '}
          <a href="https://tabler.io/icons" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-interactive)' }}>tabler.io/icons</a>.
        </p>

        <Category
          title="Navigation & Actions"
          icons={[
            { icon: IconPlus, name: 'IconPlus' },
            { icon: IconX, name: 'IconX' },
            { icon: IconCheck, name: 'IconCheck' },
            { icon: IconMinus, name: 'IconMinus' },
            { icon: IconSearch, name: 'IconSearch' },
            { icon: IconChevronRight, name: 'IconChevronRight' },
            { icon: IconChevronDown, name: 'IconChevronDown' },
            { icon: IconChevronUp, name: 'IconChevronUp' },
            { icon: IconChevronLeft, name: 'IconChevronLeft' },
            { icon: IconArrowRight, name: 'IconArrowRight' },
            { icon: IconArrowUp, name: 'IconArrowUp' },
            { icon: IconArrowDown, name: 'IconArrowDown' },
            { icon: IconArrowBackUp, name: 'IconArrowBackUp' },
            { icon: IconArrowForwardUp, name: 'IconArrowForwardUp' },
            { icon: IconDots, name: 'IconDots' },
            { icon: IconDotsVertical, name: 'IconDotsVertical' },
            { icon: IconCornerDownLeft, name: 'IconCornerDownLeft' },
          ]}
        />

        <Category
          title="Status & Feedback"
          icons={[
            { icon: IconAlertCircle, name: 'IconAlertCircle' },
            { icon: IconAlertTriangle, name: 'IconAlertTriangle' },
            { icon: IconInfoCircle, name: 'IconInfoCircle' },
            { icon: IconCircleCheck, name: 'IconCircleCheck' },
            { icon: IconBan, name: 'IconBan' },
            { icon: IconServerOff, name: 'IconServerOff' },
            { icon: IconLoader2, name: 'IconLoader2' },
            { icon: IconBolt, name: 'IconBolt' },
            { icon: IconSparkles, name: 'IconSparkles' },
            { icon: IconActivity, name: 'IconActivity' },
            { icon: IconFlag, name: 'IconFlag' },
            { icon: IconTrendingUp, name: 'IconTrendingUp' },
            { icon: IconTrendingDown, name: 'IconTrendingDown' },
          ]}
        />

        <Category
          title="Communication"
          icons={[
            { icon: IconMessage, name: 'IconMessage' },
            { icon: IconMessagePlus, name: 'IconMessagePlus' },
            { icon: IconMessageCircle, name: 'IconMessageCircle' },
            { icon: IconSend, name: 'IconSend' },
            { icon: IconBell, name: 'IconBell' },
            { icon: IconInbox, name: 'IconInbox' },
            { icon: IconVideo, name: 'IconVideo' },
          ]}
        />

        <Category
          title="Content & Files"
          icons={[
            { icon: IconFile, name: 'IconFile' },
            { icon: IconFileText, name: 'IconFileText' },
            { icon: IconFileCode, name: 'IconFileCode' },
            { icon: IconPhoto, name: 'IconPhoto' },
            { icon: IconFileSpreadsheet, name: 'IconFileSpreadsheet' },
            { icon: IconFileZip, name: 'IconFileZip' },
            { icon: IconFileUnknown, name: 'IconFileUnknown' },
            { icon: IconPaperclip, name: 'IconPaperclip' },
            { icon: IconArchive, name: 'IconArchive' },
            { icon: IconDownload, name: 'IconDownload' },
            { icon: IconUpload, name: 'IconUpload' },
            { icon: IconLink, name: 'IconLink' },
            { icon: IconPackage, name: 'IconPackage' },
          ]}
        />

        <Category
          title="User & Identity"
          icons={[
            { icon: IconUser, name: 'IconUser' },
            { icon: IconUsers, name: 'IconUsers' },
            { icon: IconUserPlus, name: 'IconUserPlus' },
            { icon: IconUserMinus, name: 'IconUserMinus' },
            { icon: IconUserCircle, name: 'IconUserCircle' },
            { icon: IconLogout, name: 'IconLogout' },
            { icon: IconSettings, name: 'IconSettings' },
            { icon: IconShieldCheck, name: 'IconShieldCheck' },
          ]}
        />

        <Category
          title="Editing & Text Formatting"
          icons={[
            { icon: IconPencil, name: 'IconPencil' },
            { icon: IconEdit, name: 'IconEdit' },
            { icon: IconBold, name: 'IconBold' },
            { icon: IconItalic, name: 'IconItalic' },
            { icon: IconUnderline, name: 'IconUnderline' },
            { icon: IconStrikethrough, name: 'IconStrikethrough' },
            { icon: IconH2, name: 'IconH2' },
            { icon: IconH3, name: 'IconH3' },
            { icon: IconList, name: 'IconList' },
            { icon: IconListNumbers, name: 'IconListNumbers' },
            { icon: IconCode, name: 'IconCode' },
            { icon: IconListCheck, name: 'IconListCheck' },
            { icon: IconSquareCheck, name: 'IconSquareCheck' },
            { icon: IconChecks, name: 'IconChecks' },
          ]}
        />

        <Category
          title="Layout & Scheduling"
          icons={[
            { icon: IconLayoutDashboard, name: 'IconLayoutDashboard' },
            { icon: IconLayoutSidebarLeftCollapse, name: 'IconLayoutSidebar…' },
            { icon: IconLayoutKanban, name: 'IconLayoutKanban' },
            { icon: IconCalendar, name: 'IconCalendar' },
            { icon: IconCalendarEvent, name: 'IconCalendarEvent' },
            { icon: IconCalendarCheck, name: 'IconCalendarCheck' },
            { icon: IconGripVertical, name: 'IconGripVertical' },
            { icon: IconNavigation, name: 'IconNavigation' },
            { icon: IconColumns3, name: 'IconColumns3' },
            { icon: IconClipboardList, name: 'IconClipboardList' },
            { icon: IconBook, name: 'IconBook' },
            { icon: IconAdjustmentsHorizontal, name: 'IconAdjustments…' },
          ]}
        />

        <Category
          title="Media & Objects"
          icons={[
            { icon: IconHeart, name: 'IconHeart' },
            { icon: IconMoon, name: 'IconMoon' },
            { icon: IconSun, name: 'IconSun' },
            { icon: IconRobot, name: 'IconRobot' },
            { icon: IconCoffee, name: 'IconCoffee' },
            { icon: IconClock, name: 'IconClock' },
            { icon: IconHistory, name: 'IconHistory' },
            { icon: IconShare, name: 'IconShare' },
            { icon: IconEye, name: 'IconEye' },
            { icon: IconEyeOff, name: 'IconEyeOff' },
            { icon: IconCircle, name: 'IconCircle' },
            { icon: IconSquare, name: 'IconSquare' },
            { icon: IconTag, name: 'IconTag' },
            { icon: IconTrash, name: 'IconTrash' },
            { icon: IconGitPullRequest, name: 'IconGitPullRequest' },
            { icon: IconGitBranch, name: 'IconGitBranch' },
            { icon: IconUmbrella, name: 'IconUmbrella' },
          ]}
        />
      </div>
    </div>
  )
}
