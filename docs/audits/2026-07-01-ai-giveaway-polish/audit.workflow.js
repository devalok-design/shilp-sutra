export const meta = {
  name: 'ai-giveaway-polish-audit',
  description: 'Deep per-component audit of @devalok/shilp-sutra for AI giveaways + Card-bar finish gaps',
  phases: [
    { title: 'Inventory', detail: 'load the 124 audit units' },
    { title: 'Audit', detail: 'one agent per component scores it against the master rubric, writes a findings file' },
    { title: 'Layer critic', detail: 'one agent per layer re-scans for missed tells + cross-component drift' },
  ],
}

const DIR = 'docs/audits/2026-07-01-ai-giveaway-polish'
const RUBRIC = `${DIR}/00-rubric.md`

const UNITS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['units'],
  properties: {
    units: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'layer', 'glob'],
        properties: {
          name: { type: 'string' },
          layer: { type: 'string' },
          glob: { type: 'string' },
        },
      },
    },
  },
}

const FINDING = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'category', 'severity', 'evidence', 'fix'],
  properties: {
    id: { type: 'string', description: 'rubric id, e.g. V1, F5, M3, G3' },
    category: { type: 'string' },
    severity: { type: 'string', enum: ['P0', 'P1', 'P2', 'P3'] },
    evidence: { type: 'string', description: 'file:line + short snippet' },
    fix: { type: 'string' },
  },
}

const SUMMARY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['component', 'layer', 'finish_score', 'counts', 'top_findings', 'composability_gaps', 'motion_gaps', 'findings_file'],
  properties: {
    component: { type: 'string' },
    layer: { type: 'string' },
    finish_score: { type: 'integer', minimum: 0, maximum: 5 },
    counts: {
      type: 'object',
      additionalProperties: false,
      required: ['p0', 'p1', 'p2', 'p3'],
      properties: { p0: { type: 'integer' }, p1: { type: 'integer' }, p2: { type: 'integer' }, p3: { type: 'integer' } },
    },
    top_findings: { type: 'array', items: FINDING },
    composability_gaps: { type: 'array', items: { type: 'string' } },
    motion_gaps: { type: 'array', items: { type: 'string' } },
    findings_file: { type: 'string' },
  },
}

const CRIT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['layer', 'missed_findings', 'cross_component', 'worst_offenders', 'best_finished', 'completeness_note'],
  properties: {
    layer: { type: 'string' },
    missed_findings: { type: 'array', items: FINDING, description: 'tells the per-component agents missed, found on re-scan' },
    cross_component: { type: 'array', items: { type: 'string' }, description: 'inconsistencies ACROSS components in this layer (vocabulary drift, surface-vocab mismatch, divergent motion)' },
    worst_offenders: { type: 'array', items: { type: 'string' } },
    best_finished: { type: 'array', items: { type: 'string' } },
    completeness_note: { type: 'string' },
  },
}

function safe(name) { return name.replace(/[\/]/g, '__') }

function auditPrompt(u) {
  return `You are auditing ONE component unit of the @devalok/shilp-sutra design system for AI giveaways and Card-bar finish gaps. Be exhaustive — a missed tell (false negative) is worse than a false positive; we filter those later.

UNIT: ${u.name}  (layer: ${u.layer})
SOURCE FILES: match \`${u.glob}\`. ALSO read its co-located \`*.test.tsx\`, \`*.stories.tsx\`, and any doc at \`packages/core/docs/components/**/${u.name.split('/').pop()}.md\`.

STEPS (do all):
1. Read the master rubric in full: ${RUBRIC}. It defines every tell id (V1–V15, M1–M5, S1–S4, E1–E8, F1–F6, G1–G5, H, I, J), the severity scale (P0–P3), and the finish bar.
2. Read the finish exemplar: packages/core/src/ui/card.tsx and packages/core/src/ui/stat-card.tsx — this is the bar ("well finished"). Note how Card killed the accent rail, uses the gap model, composes via slots (CardAction), and how StatCard composes Card instead of re-rolling surface.
3. Read this unit's source file(s) + its test + its story + its doc.
4. Score every rubric dimension against this unit. For EACH finding cite \`file:line\` and a short snippet as evidence. Only flag a DEFAULT the component ships — not consumer opt-ins, not legitimate gradients (skeleton shimmer, avatar fallback, chart fills, color-swatch demos). When unsure if something is deliberate, check whether it's bound to a brand token / gated behind an explicit prop / documented as intentional; if so it is a choice, not a tell.
5. Also assess: composability gaps (F1–F6 — bespoke props that should be slots, missing asChild, not composing the base primitive, controlled/uncontrolled gaps), and motion gaps (M1–M5 — bounce-by-default, no reduced-motion, missing feedback motion, animating layout props).

WRITE your full findings to: ${DIR}/findings/${safe(u.name)}.md
Use this markdown structure:
\`\`\`
# ${u.name} — audit
**Finish score:** N/5  (0 = unshipped AI slop, 5 = Card bar)
**Counts:** P0:n P1:n P2:n P3:n

## Findings
### [P_][id] short title
- **Category:** ...
- **Evidence:** path:line — \`snippet\`
- **Why:** one line
- **Fix:** concrete change

## Composability gaps
- ...

## Motion gaps
- ...

## Polish plan (ordered steps to reach the finish bar)
1. ...

## Clean (rubric dims that pass)
- ...
\`\`\`

Then return the compact summary object. finish_score: holistic 0–5. top_findings: the 3–6 highest-severity findings only. If the component is genuinely clean, return few/no findings and say so — do NOT invent findings to fill space.`
}

function critPrompt(layer) {
  return `You are the COMPLETENESS CRITIC for the "${layer}" layer of the @devalok/shilp-sutra AI-giveaway audit. The per-component agents already wrote findings files to ${DIR}/findings/${layer}__*.md.

STEPS:
1. Read the rubric: ${RUBRIC}.
2. Read EVERY findings file matching ${DIR}/findings/${layer}__*.md.
3. Re-scan the layer's source with Grep for tells the per-component pass may have missed across the whole layer at once — especially: V1 accent rails (border-l/-t + color on cards), V2 double-edge (border + shadow together), V3 gradient text/metrics (bg-clip-text), V4 default palette (indigo|violet|slate|#6366f1), V5 emoji icons, V6 backdrop-blur/glow, G2 dead-TW4 utilities (bare \`shadow\`/\`rounded\`/\`bg-gradient-to\`/\`w-[--\`/\`theme(spacing\`), G3 variant-axis drift (filled|primary|secondary|small|medium|big|color="default").
4. Judge CROSS-COMPONENT consistency: do siblings in this layer share one variant/size/color vocabulary? one surface vocabulary? consistent motion? consistent slot/compound patterns? Name every divergence.
5. Note any component in the layer that has NO findings file (was missed entirely).

Return the critic object: missed_findings (with file:line evidence), cross_component inconsistencies, worst_offenders, best_finished, and a completeness_note stating how confident you are the layer is fully covered.`
}

phase('Inventory')
const inv = await agent(
  `Read the file ${DIR}/units.json (a JSON array of {name, layer, glob}) and return its parsed contents as {units: [...]}. Return ALL entries, do not truncate.`,
  { schema: UNITS_SCHEMA, label: 'inventory' },
)
const units = inv.units
log(`Loaded ${units.length} audit units across layers: ${[...new Set(units.map(u => u.layer))].join(', ')}`)

phase('Audit')
const summaries = (await parallel(
  units.map(u => () => agent(auditPrompt(u), {
    label: u.name, phase: 'Audit', schema: SUMMARY_SCHEMA, agentType: 'general-purpose',
  })),
)).filter(Boolean)
log(`Audited ${summaries.length}/${units.length} units. Wrote findings files.`)

phase('Layer critic')
const layers = [...new Set(units.map(u => u.layer))]
const crits = (await parallel(
  layers.map(L => () => agent(critPrompt(L), {
    label: `crit:${L}`, phase: 'Layer critic', schema: CRIT_SCHEMA, agentType: 'general-purpose',
  })),
)).filter(Boolean)

return { summaries, crits, units_total: units.length, audited: summaries.length }
