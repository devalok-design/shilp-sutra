import React from 'react'

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
  marginBottom: '0.5rem',
  marginTop: '1.25rem',
}

const gridStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.625rem',
  fontFamily: 'var(--font-mono)',
  color: 'var(--color-text-secondary)',
  marginTop: '0.25rem',
  textAlign: 'center',
  wordBreak: 'break-all',
}

/* ─── Color Palettes ────────────────────────────────────────────── */

const palettes = [
  { name: 'Pink', prefix: '--pink', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Purple', prefix: '--purple', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Neutral', prefix: '--neutral', steps: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Green', prefix: '--green', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Red', prefix: '--red', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Yellow', prefix: '--yellow', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: 'Blue', prefix: '--blue', steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
] as const

function ColorPalettes() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Color Palettes</h2>
      {palettes.map((palette) => (
        <div key={palette.name} style={{ marginBottom: '1.25rem' }}>
          <h3 style={subheadingStyle}>{palette.name}</h3>
          <div style={gridStyle}>
            {palette.steps.map((step) => {
              const token = `${palette.prefix}-${step}`
              return (
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '4rem' }}>
                  <div
                    style={{
                      width: '3.5rem',
                      height: '2.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `var(${token})`,
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  />
                  <span style={labelStyle}>{step}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Semantic Colors ───────────────────────────────────────────── */

const semanticGroups = [
  {
    name: 'Interactive',
    tokens: [
      '--color-interactive',
      '--color-interactive-hover',
      '--color-interactive-active',
      '--color-interactive-selected',
      '--color-interactive-disabled',
      '--color-interactive-subtle',
    ],
  },
  {
    name: 'Accent',
    tokens: ['--color-accent', '--color-accent-hover', '--color-accent-subtle'],
  },
  {
    name: 'Text',
    tokens: [
      '--color-text-primary',
      '--color-text-secondary',
      '--color-text-tertiary',
      '--color-text-placeholder',
      '--color-text-error',
      '--color-text-success',
      '--color-text-link',
      '--color-text-brand',
    ],
  },
  {
    name: 'Backgrounds',
    tokens: [
      '--color-background',
      '--color-layer-01',
      '--color-layer-02',
      '--color-layer-03',
      '--color-field',
      '--color-field-hover',
    ],
  },
  {
    name: 'Borders',
    tokens: [
      '--color-border-subtle',
      '--color-border-default',
      '--color-border-strong',
      '--color-border-interactive',
      '--color-border-error',
      '--color-border-success',
    ],
  },
  {
    name: 'Status',
    tokens: [
      '--color-success',
      '--color-success-surface',
      '--color-error',
      '--color-error-surface',
      '--color-warning',
      '--color-warning-surface',
      '--color-info',
      '--color-info-surface',
    ],
  },
  {
    name: 'Tags',
    tokens: [
      '--color-tag-neutral-bg',
      '--color-tag-blue-bg',
      '--color-tag-green-bg',
      '--color-tag-red-bg',
      '--color-tag-yellow-bg',
      '--color-tag-magenta-bg',
      '--color-tag-purple-bg',
    ],
  },
]

function SemanticColors() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Semantic Colors</h2>
      {semanticGroups.map((group) => (
        <div key={group.name} style={{ marginBottom: '1.25rem' }}>
          <h3 style={subheadingStyle}>{group.name}</h3>
          <div style={gridStyle}>
            {group.tokens.map((token) => {
              const shortName = token.replace('--color-', '')
              return (
                <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '5.5rem' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '2.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `var(${token})`,
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  />
                  <span style={labelStyle}>{shortName}</span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Typography ────────────────────────────────────────────────── */

const titleScale = [
  { cls: 'T1-Reg', label: 'T1', size: '62px' },
  { cls: 'T2-Reg', label: 'T2', size: '48px' },
  { cls: 'T3-Reg', label: 'T3', size: '38px' },
  { cls: 'T4-Reg', label: 'T4', size: '32px' },
  { cls: 'T5-Reg', label: 'T5', size: '24px' },
  { cls: 'T6-Reg', label: 'T6', size: '20px' },
  { cls: 'T7-Reg', label: 'T7', size: '18px' },
]

const bodyScale = [
  { cls: 'B1-Reg', label: 'B1', size: '16px' },
  { cls: 'B2-Reg', label: 'B2', size: '14px' },
  { cls: 'B3-Reg', label: 'B3', size: '12px' },
  { cls: 'B4-Reg', label: 'B4', size: '10px' },
  { cls: 'B5-Reg', label: 'B5', size: '16px / 140%' },
  { cls: 'B6-Reg', label: 'B6', size: '14px / 600' },
  { cls: 'B7-Reg', label: 'B7', size: '12px' },
  { cls: 'B8-Reg', label: 'B8', size: '14px' },
]

const labelScale = [
  { cls: 'L1', label: 'L1', size: '16px' },
  { cls: 'L2', label: 'L2', size: '14px' },
  { cls: 'L3', label: 'L3', size: '12px' },
  { cls: 'L4', label: 'L4', size: '10px' },
  { cls: 'L6', label: 'L6', size: '14px' },
]

function TypographySamples() {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1rem',
    marginBottom: '0.5rem',
    color: 'var(--color-text-primary)',
  }
  const metaStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-text-tertiary)',
    minWidth: '7rem',
    flexShrink: 0,
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Typography</h2>

      <h3 style={subheadingStyle}>Title Scale</h3>
      {titleScale.map((t) => (
        <div key={t.cls} style={rowStyle}>
          <span style={metaStyle}>{t.label} ({t.size})</span>
          <span className={t.cls}>The quick brown fox</span>
        </div>
      ))}

      <h3 style={subheadingStyle}>Body Scale</h3>
      {bodyScale.map((t) => (
        <div key={t.cls} style={rowStyle}>
          <span style={metaStyle}>{t.label} ({t.size})</span>
          <span className={t.cls}>The quick brown fox jumps over the lazy dog</span>
        </div>
      ))}

      <h3 style={subheadingStyle}>Label Scale</h3>
      {labelScale.map((t) => (
        <div key={t.cls} style={rowStyle}>
          <span style={metaStyle}>{t.label} ({t.size})</span>
          <span className={t.cls}>Label text sample</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Spacing ───────────────────────────────────────────────────── */

const spacingTokens = [
  { token: '--spacing-01', value: '2px' },
  { token: '--spacing-02', value: '4px' },
  { token: '--spacing-03', value: '8px' },
  { token: '--spacing-04', value: '12px' },
  { token: '--spacing-05', value: '16px' },
  { token: '--spacing-06', value: '24px' },
  { token: '--spacing-07', value: '32px' },
  { token: '--spacing-08', value: '40px' },
  { token: '--spacing-09', value: '48px' },
  { token: '--spacing-10', value: '64px' },
  { token: '--spacing-11', value: '80px' },
  { token: '--spacing-12', value: '96px' },
  { token: '--spacing-13', value: '160px' },
]

function SpacingScale() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Spacing</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {spacingTokens.map((s) => (
          <div key={s.token} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)', minWidth: '7rem' }}>
              {s.token.replace('--', '')} ({s.value})
            </span>
            <div
              style={{
                height: '1rem',
                width: `var(${s.token})`,
                backgroundColor: 'var(--color-interactive)',
                borderRadius: 'var(--radius-sm)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Border Radius ─────────────────────────────────────────────── */

const radiusTokens = [
  { token: '--radius-none', value: '0' },
  { token: '--radius-sm', value: '2px' },
  { token: '--radius-md', value: '6px' },
  { token: '--radius-lg', value: '10px' },
  { token: '--radius-xl', value: '16px' },
  { token: '--radius-2xl', value: '24px' },
  { token: '--radius-full', value: '9999px' },
]

function BorderRadiusScale() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Border Radius</h2>
      <div style={gridStyle}>
        {radiusTokens.map((r) => (
          <div key={r.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '5.5rem' }}>
            <div
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: `var(${r.token})`,
                backgroundColor: 'var(--color-layer-02)',
                border: '2px solid var(--color-interactive)',
              }}
            />
            <span style={labelStyle}>{r.token.replace('--', '')} ({r.value})</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Shadows ───────────────────────────────────────────────────── */

const shadowTokens = [
  { token: '--shadow-01', label: 'shadow-01 (subtle)' },
  { token: '--shadow-02', label: 'shadow-02 (low)' },
  { token: '--shadow-03', label: 'shadow-03 (medium)' },
  { token: '--shadow-04', label: 'shadow-04 (high)' },
  { token: '--shadow-05', label: 'shadow-05 (highest)' },
  { token: '--shadow-brand', label: 'shadow-brand' },
]

function ShadowScale() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Shadows</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {shadowTokens.map((s) => (
          <div key={s.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '7rem',
                height: '5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--color-layer-01)',
                boxShadow: `var(${s.token})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            />
            <span style={{ ...labelStyle, marginTop: '0.5rem' }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Gradients ─────────────────────────────────────────────────── */

const gradientTokens = [
  { token: '--gradient-brand-light', label: 'gradient-brand-light' },
  { token: '--gradient-brand-dark', label: 'gradient-brand-dark' },
]

function GradientScale() {
  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Gradients</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {gradientTokens.map((g) => (
          <div key={g.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '10rem',
                height: '5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundImage: `var(${g.token})`,
              }}
            />
            <span style={{ ...labelStyle, marginTop: '0.5rem' }}>{g.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Z-Index ───────────────────────────────────────────────────── */

const zIndexTokens = [
  { token: '--z-base', value: '0' },
  { token: '--z-raised', value: '10' },
  { token: '--z-dropdown', value: '1000' },
  { token: '--z-sticky', value: '1100' },
  { token: '--z-overlay', value: '1200' },
  { token: '--z-modal', value: '1300' },
  { token: '--z-toast', value: '1500' },
  { token: '--z-tooltip', value: '1600' },
]

function ZIndexTable() {
  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--color-border-subtle)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Z-Index</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '24rem' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Token</th>
            <th style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {zIndexTokens.map((z) => (
            <tr key={z.token}>
              <td style={{ ...cellStyle, textAlign: 'left' }}>{z.token.replace('--', '')}</td>
              <td style={{ ...cellStyle, textAlign: 'right' }}>{z.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Motion ────────────────────────────────────────────────────── */

const motionTokens = [
  { token: '--duration-instant', value: '0ms', category: 'Duration' },
  { token: '--duration-fast', value: '100ms', category: 'Duration' },
  { token: '--duration-moderate', value: '200ms', category: 'Duration' },
  { token: '--duration-slow', value: '400ms', category: 'Duration' },
  { token: '--duration-deliberate', value: '700ms', category: 'Duration' },
  { token: '--ease-standard', value: 'cubic-bezier(0.2, 0, 0.38, 0.9)', category: 'Easing' },
  { token: '--ease-entrance', value: 'cubic-bezier(0, 0, 0.38, 0.9)', category: 'Easing' },
  { token: '--ease-exit', value: 'cubic-bezier(0.2, 0, 1, 0.9)', category: 'Easing' },
  { token: '--ease-bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', category: 'Easing' },
]

function MotionTable() {
  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--color-border-subtle)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Motion</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '40rem' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Token</th>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Category</th>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {motionTokens.map((m) => (
            <tr key={m.token}>
              <td style={{ ...cellStyle, textAlign: 'left' }}>{m.token.replace('--', '')}</td>
              <td style={{ ...cellStyle, textAlign: 'left', color: 'var(--color-text-secondary)' }}>{m.category}</td>
              <td style={{ ...cellStyle, textAlign: 'left' }}>{m.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ─── Main Showcase ─────────────────────────────────────────────── */

export function FoundationsShowcase() {
  return (
    <div style={{ maxWidth: '64rem', color: 'var(--color-text-primary)' }}>
      <ColorPalettes />
      <SemanticColors />
      <TypographySamples />
      <SpacingScale />
      <BorderRadiusScale />
      <ShadowScale />
      <GradientScale />
      <ZIndexTable />
      <MotionTable />
    </div>
  )
}
