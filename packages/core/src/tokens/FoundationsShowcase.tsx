import React from 'react'

/* ─── Shared styles ─────────────────────────────────────────────── */

const sectionStyle: React.CSSProperties = {
  marginBottom: '3rem',
}

const headingStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 600,
  color: 'var(--color-surface-fg)',
  marginBottom: '1rem',
  borderBottom: '1px solid var(--color-surface-border)',
  paddingBottom: '0.5rem',
}

const subheadingStyle: React.CSSProperties = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'var(--color-surface-fg-muted)',
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
  color: 'var(--color-surface-fg-muted)',
  marginTop: '0.25rem',
  textAlign: 'center',
  wordBreak: 'break-all',
}

/* ─── Color Palettes ────────────────────────────────────────────── */

const STEPS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
const STEP_LABELS: Record<number, string> = {
  1: 'app bg', 2: 'subtle bg', 3: 'comp bg', 4: 'hover',
  5: 'active', 6: 'border subtle', 7: 'border', 8: 'border strong',
  9: 'solid', 10: 'solid hover', 11: 'lo text', 12: 'hi text',
}

const palettes = [
  { name: 'Pink', prefix: '--pink', steps: STEPS_12 },
  { name: 'Purple', prefix: '--purple', steps: STEPS_12 },
  { name: 'Neutral', prefix: '--neutral', steps: [0, ...STEPS_12] as readonly number[] },
  { name: 'Green', prefix: '--green', steps: STEPS_12 },
  { name: 'Red', prefix: '--red', steps: STEPS_12 },
  { name: 'Yellow', prefix: '--yellow', steps: STEPS_12 },
  { name: 'Blue', prefix: '--blue', steps: STEPS_12 },
  { name: 'Teal (Mayur)', prefix: '--teal', steps: STEPS_12 },
  { name: 'Amber (Kesar)', prefix: '--amber', steps: STEPS_12 },
  { name: 'Slate (Megha)', prefix: '--slate', steps: STEPS_12 },
  { name: 'Indigo (Neel)', prefix: '--indigo', steps: STEPS_12 },
  { name: 'Cyan (Samudra)', prefix: '--cyan', steps: STEPS_12 },
  { name: 'Orange (Agni)', prefix: '--orange', steps: STEPS_12 },
  { name: 'Emerald (Panna)', prefix: '--emerald', steps: STEPS_12 },
]

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
                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '4.5rem' }}>
                  <div
                    style={{
                      width: '4rem',
                      height: '2.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: `var(${token})`,
                      border: '1px solid var(--color-surface-border)',
                    }}
                    title={`${token}: ${STEP_LABELS[step as number] ?? ''}`}
                  />
                  <span style={labelStyle}>{step}</span>
                  {STEP_LABELS[step as number] && (
                    <span style={{ ...labelStyle, fontSize: '0.5rem', color: 'var(--color-surface-fg-subtle)', marginTop: 0 }}>
                      {STEP_LABELS[step as number]}
                    </span>
                  )}
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
    name: 'Accent (12-step, swappable)',
    tokens: [
      '--color-accent-1', '--color-accent-2', '--color-accent-3', '--color-accent-4',
      '--color-accent-5', '--color-accent-6', '--color-accent-7', '--color-accent-8',
      '--color-accent-9', '--color-accent-10', '--color-accent-11', '--color-accent-12',
      '--color-accent-fg',
    ],
  },
  {
    name: 'Secondary (12-step)',
    tokens: [
      '--color-secondary-1', '--color-secondary-2', '--color-secondary-3', '--color-secondary-4',
      '--color-secondary-5', '--color-secondary-6', '--color-secondary-7', '--color-secondary-8',
      '--color-secondary-9', '--color-secondary-10', '--color-secondary-11', '--color-secondary-12',
      '--color-secondary-fg',
    ],
  },
  {
    name: 'Surface',
    tokens: [
      '--color-surface-1',
      '--color-surface-2',
      '--color-surface-3',
      '--color-surface-4',
      '--color-surface-fg',
      '--color-surface-fg-muted',
      '--color-surface-fg-subtle',
      '--color-surface-border',
    ],
  },
  {
    name: 'Borders',
    tokens: [
      '--color-surface-border',
      '--color-surface-border-strong',
      '--color-accent-7',
      '--color-error-7',
      '--color-success-7',
    ],
  },
  {
    name: 'Status (step subsets)',
    tokens: [
      '--color-error-3', '--color-error-7', '--color-error-9', '--color-error-11',
      '--color-success-3', '--color-success-7', '--color-success-9', '--color-success-11',
      '--color-warning-3', '--color-warning-7', '--color-warning-9', '--color-warning-11',
      '--color-info-3', '--color-info-7', '--color-info-9', '--color-info-11',
    ],
  },
  {
    name: 'Category (Sapta Varna)',
    tokens: [
      '--color-category-teal',
      '--color-category-teal-surface',
      '--color-category-amber',
      '--color-category-amber-surface',
      '--color-category-slate',
      '--color-category-slate-surface',
      '--color-category-indigo',
      '--color-category-indigo-surface',
      '--color-category-cyan',
      '--color-category-cyan-surface',
      '--color-category-orange',
      '--color-category-orange-surface',
      '--color-category-emerald',
      '--color-category-emerald-surface',
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
                      border: '1px solid var(--color-surface-border)',
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

const semanticTypeScale = [
  { variant: 'heading-2xl', size: '3.75rem (60px)', weight: '400', sample: 'Heading 2XL' },
  { variant: 'heading-xl',  size: '3rem (48px)',    weight: '400', sample: 'Heading XL' },
  { variant: 'heading-lg',  size: '2.25rem (36px)', weight: '400', sample: 'Heading LG' },
  { variant: 'heading-md',  size: '2rem (32px)',    weight: '400', sample: 'Heading MD' },
  { variant: 'heading-sm',  size: '1.5rem (24px)',  weight: '400', sample: 'Heading SM' },
  { variant: 'heading-xs',  size: '1.25rem (20px)', weight: '400', sample: 'Heading XS' },
  { variant: 'body-lg',     size: '1rem (16px)',     weight: '400', sample: 'Body LG — Primary reading text' },
  { variant: 'body-md',     size: '0.875rem (14px)', weight: '400', sample: 'Body MD — Default UI text' },
  { variant: 'body-sm',     size: '0.75rem (12px)',  weight: '400', sample: 'Body SM — Secondary text' },
  { variant: 'body-xs',     size: '0.625rem (10px)', weight: '400', sample: 'Body XS — Fine print' },
  { variant: 'label-lg',    size: '1rem (16px)',     weight: '600', sample: 'LABEL LG' },
  { variant: 'label-md',    size: '0.875rem (14px)', weight: '600', sample: 'LABEL MD' },
  { variant: 'label-sm',    size: '0.75rem (12px)',  weight: '600', sample: 'LABEL SM' },
  { variant: 'label-xs',    size: '0.625rem (10px)', weight: '600', sample: 'LABEL XS' },
  { variant: 'caption',     size: '0.75rem (12px)',  weight: '400', sample: 'Caption text' },
  { variant: 'overline',    size: '0.75rem (12px)',  weight: '400', sample: 'OVERLINE TEXT' },
]

function TypographySamples() {
  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'baseline',
    gap: '1rem',
    marginBottom: '0.5rem',
    color: 'var(--color-surface-fg)',
  }
  const metaStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--color-surface-fg-subtle)',
    minWidth: '7rem',
    flexShrink: 0,
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Typography</h2>

      <h3 style={subheadingStyle}>Semantic Type Scale</h3>
      <p style={{ fontSize: '0.75rem', color: 'var(--color-surface-fg-subtle)', marginBottom: '0.75rem' }}>
        Use <code style={{ fontSize: '0.6875rem', background: 'var(--color-surface-3)', padding: '0.15em 0.4em', borderRadius: '4px' }}>&lt;Text variant="..."&gt;</code> for
        all typography. Sizes driven by <code style={{ fontSize: '0.6875rem', background: 'var(--color-surface-3)', padding: '0.15em 0.4em', borderRadius: '4px' }}>--typo-*</code> CSS tokens.
      </p>
      {semanticTypeScale.map((t) => (
        <div key={t.variant} style={rowStyle}>
          <span style={{ ...metaStyle, minWidth: '12rem' }}>{t.variant} ({t.size})</span>
          <span
            style={{
              fontSize: `var(--typo-${t.variant}-size)`,
              fontWeight: `var(--typo-${t.variant}-weight)` as React.CSSProperties['fontWeight'],
              lineHeight: `var(--typo-${t.variant}-leading)`,
              letterSpacing: `var(--typo-${t.variant}-tracking)`,
              textTransform: t.variant.startsWith('label') || t.variant === 'overline' ? 'uppercase' : undefined,
            }}
          >
            {t.sample}
          </span>
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
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-surface-fg-muted)', minWidth: '7rem' }}>
              {s.token.replace('--', '')} ({s.value})
            </span>
            <div
              style={{
                height: '1rem',
                width: `var(${s.token})`,
                backgroundColor: 'var(--color-accent-9)',
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
                backgroundColor: 'var(--color-surface-2)',
                border: '2px solid var(--color-accent-9)',
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
                backgroundColor: 'var(--color-surface-1)',
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
    borderBottom: '1px solid var(--color-surface-border)',
    color: 'var(--color-surface-fg)',
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Z-Index</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '24rem' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>Token</th>
            <th style={{ ...cellStyle, textAlign: 'right', fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>Value</th>
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
  { token: '--duration-fast-01', value: '70ms', category: 'Duration' },
  { token: '--duration-fast-02', value: '110ms', category: 'Duration' },
  { token: '--duration-moderate-01', value: '150ms', category: 'Duration' },
  { token: '--duration-moderate-02', value: '240ms', category: 'Duration' },
  { token: '--duration-slow-01', value: '400ms', category: 'Duration' },
  { token: '--duration-slow-02', value: '700ms', category: 'Duration' },
  { token: '--ease-productive-standard', value: 'cubic-bezier(0.2, 0, 0.38, 0.9)', category: 'Easing' },
  { token: '--ease-productive-entrance', value: 'cubic-bezier(0, 0, 0.38, 0.9)', category: 'Easing' },
  { token: '--ease-productive-exit', value: 'cubic-bezier(0.2, 0, 1, 0.9)', category: 'Easing' },
  { token: '--ease-expressive-standard', value: 'cubic-bezier(0.4, 0.14, 0.3, 1)', category: 'Easing' },
  { token: '--ease-expressive-entrance', value: 'cubic-bezier(0, 0, 0.3, 1)', category: 'Easing' },
  { token: '--ease-expressive-exit', value: 'cubic-bezier(0.4, 0.14, 1, 1)', category: 'Easing' },
  { token: '--ease-bounce', value: 'cubic-bezier(0.34, 1.56, 0.64, 1)', category: 'Easing' },
  { token: '--ease-linear', value: 'linear', category: 'Easing' },
]

function MotionTable() {
  const cellStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    borderBottom: '1px solid var(--color-surface-border)',
    color: 'var(--color-surface-fg)',
  }

  return (
    <div style={sectionStyle}>
      <h2 style={headingStyle}>Motion</h2>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: '40rem' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>Token</th>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>Category</th>
            <th style={{ ...cellStyle, textAlign: 'left', fontWeight: 600, color: 'var(--color-surface-fg-muted)' }}>Value</th>
          </tr>
        </thead>
        <tbody>
          {motionTokens.map((m) => (
            <tr key={m.token}>
              <td style={{ ...cellStyle, textAlign: 'left' }}>{m.token.replace('--', '')}</td>
              <td style={{ ...cellStyle, textAlign: 'left', color: 'var(--color-surface-fg-muted)' }}>{m.category}</td>
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
    <div style={{ maxWidth: '64rem', color: 'var(--color-surface-fg)' }}>
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
