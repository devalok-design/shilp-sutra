/**
 * OKLCH Ramp Generator — Figma plugin
 *
 * Generates perceptually-even 12-step colour ramps from two numbers per ramp:
 * a hue and a peak chroma. Reads those from a "seeds" variable collection and
 * writes the resulting steps into a target collection.
 *
 * WHY THIS EXISTS
 * Figma stores numbers but cannot compute. A designer who edits a seed sees
 * nothing change until something regenerates the ramp. This is that something.
 *
 * ⚠ THE CONSTANTS BELOW MIRROR packages/core/src/tokens/generate-scale.ts.
 * They are the definition of the ramp shape. If that file changes, change this
 * one in the same commit or Figma and code will silently disagree.
 */

// ── Lightness per step ──────────────────────────────────────────────────────
// 1–2 app/subtle bg · 3–5 component bg · 6–8 borders · 9–10 solid · 11–12 text
var LIGHT_L = [0.99, 0.97, 0.93, 0.89, 0.84, 0.78, 0.7, 0.62, 0.55, 0.5, 0.43, 0.32]

// Dark mode ascends. Steps 1–6 are spaced wider so elevation stays visible;
// step 10 is DARKER than 9 so hover still reads on a dark ground.
var DARK_L = [0.11, 0.17, 0.23, 0.29, 0.34, 0.38, 0.44, 0.53, 0.63, 0.58, 0.76, 0.88]

// ── Chroma weight per step, as a fraction of peak ───────────────────────────
var LIGHT_CW = [
  0.005 / 0.19, 0.015 / 0.19, 0.035 / 0.19, 0.055 / 0.19,
  0.08 / 0.19, 0.1 / 0.19, 0.14 / 0.19, 0.17 / 0.19,
  1.0, 1.0, 0.14 / 0.19, 0.08 / 0.19,
]
var DARK_CW = [
  0.005 / 0.209, 0.015 / 0.209, 0.04 / 0.209, 0.06 / 0.209,
  0.08 / 0.209, 0.1 / 0.209, 0.13 / 0.209, 0.18 / 0.209,
  1.0, 1.0, 0.13 / 0.209, 0.05 / 0.209,
]
var DARK_CHROMA_BOOST = 1.1

// ── OKLCH → sRGB (Ottosson) ─────────────────────────────────────────────────
// Clips per channel. Out-of-gamut colours shift slightly; that is also what the
// codebase's own DTCG export does, so the two stay consistent.
function oklchToRgb(L, C, H) {
  var hr = (H * Math.PI) / 180
  // OKLab a/b components — named labA/labB so they cannot be confused with the
  // sRGB blue channel below. (An earlier version returned labB as blue.)
  var labA = C * Math.cos(hr)
  var labB = C * Math.sin(hr)
  var l_ = L + 0.3963377774 * labA + 0.2158037573 * labB
  var m_ = L - 0.1055613458 * labA - 0.0638541728 * labB
  var s_ = L - 0.0894841775 * labA - 1.291485548 * labB
  var lc = l_ * l_ * l_
  var mc = m_ * m_ * m_
  var sc = s_ * s_ * s_
  var red = 4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  var green = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  var blue = -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc
  function enc(c) {
    if (c <= 0) return 0
    if (c >= 1) return 1
    return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
  }
  return { r: enc(red), g: enc(green), b: enc(blue) }
}

/**
 * 12 steps for one ramp, in one mode.
 *
 * `corr` carries per-ramp lightness corrections for steps 9 and 10 — the solid
 * fills that sit under text. The generic curve does not clear WCAG for every
 * hue, so intent ramps darken those steps. Omitting this silently reverts the
 * contrast fix on any ramp that has one.
 */
function generateRamp(hue, peakChroma, isDark, isNeutral, corr) {
  var c = corr || {}
  var light9 = c.light9 || 0
  var dark9 = c.dark9 || 0
  var dark10 = c.dark10 || 0
  var L = isDark ? DARK_L : LIGHT_L
  var W = isDark ? DARK_CW : LIGHT_CW
  var peak = isDark && !isNeutral ? peakChroma * DARK_CHROMA_BOOST : peakChroma
  var out = []
  for (var i = 0; i < 12; i++) {
    var step = i + 1
    var adj = isDark
      ? (step === 9 ? dark9 : step === 10 ? dark10 : 0)
      : (step === 9 ? light9 : 0)
    // Round exactly as generate-scale.ts's formatOklch does before writing CSS
    // (L to 3 dp, C to 4 dp). Converting unrounded floats lands a channel one
    // unit off on a handful of steps — enough to fail a byte-comparison.
    var l = Math.round((L[i] + adj) * 1000) / 1000
    var ch = Math.round(peak * W[i] * 10000) / 10000
    out.push(oklchToRgb(l, ch, hue))
  }
  return out
}

// ── Discovery ───────────────────────────────────────────────────────────────

/**
 * A seed collection holds pairs like `accent/hue` and `accent/chroma`.
 * Any collection containing at least one such pair qualifies — the plugin is
 * not tied to one file's naming.
 */
function readSeeds(vars, collectionId) {
  var seeds = {}
  for (var i = 0; i < vars.length; i++) {
    var v = vars[i]
    if (v.variableCollectionId !== collectionId) continue
    var m = v.name.match(/^(.*)\/(hue|chroma|neutral|light9|dark9|dark10)$/)
    if (!m) continue
    var ramp = m[1]
    if (!seeds[ramp]) seeds[ramp] = { name: ramp }
    seeds[ramp][m[2]] = v
  }
  var complete = []
  for (var k in seeds) {
    if (seeds[k].hue && seeds[k].chroma) complete.push(seeds[k])
  }
  return complete
}

function firstModeValue(v, collection) {
  return v.valuesByMode[collection.defaultModeId]
}

/**
 * Is this variable currently an alias in the given mode?
 *
 * The target picker accepts ANY collection. Semantic/Color and Brand hold
 * aliases pointing at primitive steps; writing a raw colour over one destroys
 * the indirection with no error and no record of which step it pointed at.
 * Measured on the live file: 208 aliased values in Semantic/Color and 102 in
 * Brand were reachable this way.
 */
function isAliased(variable, modeId) {
  var v = variable.valuesByMode[modeId]
  return !!(v && v.type === 'VARIABLE_ALIAS')
}

// ── Test seam ───────────────────────────────────────────────────────────────
// Lets verify-parity.mjs require this file in Node to check the ramp maths
// against the codebase. `module` is undefined inside Figma, so this is inert
// there; everything below is guarded on `figma` for the same reason.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateRamp: generateRamp, oklchToRgb: oklchToRgb, LIGHT_L: LIGHT_L, DARK_L: DARK_L }
}

// ── Messaging ───────────────────────────────────────────────────────────────

if (typeof figma !== 'undefined') {

// themeColors injects the --figma-color-* variables and puts
// figma-light / figma-dark on <html>. Without it the panel has no way to know
// the editor theme, and guessing from prefers-color-scheme reads the OS instead.
figma.showUI(__html__, { width: 340, height: 460, themeColors: true })

async function sendState() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync()
  var vars = await figma.variables.getLocalVariablesAsync()
  var payload = collections.map(function (c) {
    return {
      id: c.id,
      name: c.name,
      modes: c.modes.map(function (m) { return { id: m.modeId, name: m.name } }),
      seedCount: readSeeds(vars, c.id).length,
      variableCount: c.variableIds.length,
    }
  })
  figma.ui.postMessage({ type: 'state', collections: payload })
}

figma.ui.onmessage = async function (msg) {
  if (msg.type === 'init') return sendState()

  if (msg.type === 'generate') {
    try {
      var collections = await figma.variables.getLocalVariableCollectionsAsync()
      var vars = await figma.variables.getLocalVariablesAsync()

      var seedColl = collections.filter(function (c) { return c.id === msg.seedCollectionId })[0]
      var targetColl = collections.filter(function (c) { return c.id === msg.targetCollectionId })[0]
      if (!seedColl || !targetColl) throw new Error('Pick both a seed collection and a target collection.')

      var lightMode = msg.lightModeId || targetColl.modes[0].modeId
      var darkMode = msg.darkModeId || null

      var seeds = readSeeds(vars, seedColl.id)
      if (!seeds.length) throw new Error('No seeds found. Expected variables named "<ramp>/hue" and "<ramp>/chroma".')

      var byName = {}
      for (var i = 0; i < vars.length; i++) byName[vars[i].variableCollectionId + '|' + vars[i].name] = vars[i]

      // Pre-flight. Picking the wrong target collection is the easy mistake,
      // and it does not announce itself: new variables are created with
      // scopes:[] so they never appear in a picker afterwards. Measured on the
      // live file, targeting Semantic/Color would have quietly added 192 junk
      // variables and Brand 204. Creating is therefore opt-in, which still
      // leaves a genuine first run on an empty collection possible.
      var willCreate = 0
      var willUpdate = 0
      for (var ps = 0; ps < seeds.length; ps++) {
        for (var pstep = 1; pstep <= 12; pstep++) {
          if (byName[targetColl.id + '|' + seeds[ps].name + '/' + pstep]) willUpdate++
          else willCreate++
        }
      }
      if (willCreate > 0 && !msg.allowCreate) {
        throw new Error(
          'That would create ' + willCreate + ' new variables in "' + targetColl.name +
          '" and update only ' + willUpdate + '. If this is the collection you meant, ' +
          'tick "Allow creating new variables" and run again.')
      }

      // A restore point before touching hundreds of values. Cheap, and the
      // difference between a mis-targeted run being an undo and being an
      // unrecoverable flattening.
      //
      // Not fatal if the host refuses it — but never silent either. Losing the
      // checkpoint changes the risk of everything below, so it is reported
      // rather than swallowed.
      var checkpoint
      try {
        await figma.saveVersionHistoryAsync('Before OKLCH ramp generation')
        checkpoint = 'saved'
      } catch (e) {
        checkpoint = 'UNAVAILABLE (' + String((e && e.message) || e) + ') — no restore point'
      }

      var written = 0
      var created = 0
      var report = []
      var skippedAliases = []

      for (var s = 0; s < seeds.length; s++) {
        var seed = seeds[s]
        var hue = firstModeValue(seed.hue, seedColl)
        var chroma = firstModeValue(seed.chroma, seedColl)
        var isNeutral = seed.neutral ? !!firstModeValue(seed.neutral, seedColl) : false
        if (typeof hue !== 'number' || typeof chroma !== 'number') {
          report.push(seed.name + ' — skipped, hue/chroma are not numbers')
          continue
        }

        var corr = {
          light9: seed.light9 ? firstModeValue(seed.light9, seedColl) : 0,
          dark9: seed.dark9 ? firstModeValue(seed.dark9, seedColl) : 0,
          dark10: seed.dark10 ? firstModeValue(seed.dark10, seedColl) : 0,
        }
        var light = generateRamp(hue, chroma, false, isNeutral, corr)
        var dark = darkMode ? generateRamp(hue, chroma, true, isNeutral, corr) : null

        for (var step = 1; step <= 12; step++) {
          var name = seed.name + '/' + step
          var key = targetColl.id + '|' + name
          var variable = byName[key]
          if (!variable) {
            variable = figma.variables.createVariable(name, targetColl, 'COLOR')
            variable.scopes = []            // primitives stay out of every picker
            byName[key] = variable
            created++
          }
          // Never flatten an alias — skip it and say so.
          if (isAliased(variable, lightMode) || (dark && isAliased(variable, darkMode))) {
            skippedAliases.push(name)
            continue
          }
          variable.setValueForMode(lightMode, light[step - 1])
          if (dark) variable.setValueForMode(darkMode, dark[step - 1])
          written++
        }
        report.push(seed.name + ' — hue ' + hue + ', chroma ' + chroma + (isNeutral ? ', neutral' : ''))
      }

      figma.ui.postMessage({
        type: 'done',
        ramps: seeds.length,
        written: written,
        created: created,
        skipped: skippedAliases,
        checkpoint: checkpoint,
        report: report,
      })
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String((e && e.message) || e) })
    }
  }

  if (msg.type === 'close') figma.closePlugin()

  // ── Export ────────────────────────────────────────────────────────────────
  // The Variables REST API is Enterprise-only, so a standalone script cannot
  // read this file. The plugin is the only way off the Pro plan: it emits JSON
  // that `figma-pull-tokens.mjs` turns into a pull request.
  if (msg.type === 'export') {
    try {
      var collections = await figma.variables.getLocalVariableCollectionsAsync()
      var all = await figma.variables.getLocalVariablesAsync()
      var byId = {}
      for (var i = 0; i < all.length; i++) byId[all[i].id] = all[i]
      var collById = {}
      for (var c = 0; c < collections.length; c++) collById[collections[c].id] = collections[c]

      var seeds = {}
      var aliases = {}

      for (var v = 0; v < all.length; v++) {
        var variable = all[v]
        var coll = collById[variable.variableCollectionId]
        if (!coll) continue

        // Seeds: hue / chroma / corrections, one value per ramp
        if (coll.name === 'Seeds') {
          var sm = variable.name.match(/^(.*)\/(hue|chroma|neutral|light9|dark9|dark10)$/)
          if (sm) {
            if (!seeds[sm[1]]) seeds[sm[1]] = {}
            seeds[sm[1]][sm[2]] = variable.valuesByMode[coll.defaultModeId]
          }
          continue
        }

        // Semantic alias targets, per mode. A re-point shows up here as a
        // changed target name; no colour conversion is involved.
        if (coll.name === 'Semantic/Color') {
          var perMode = {}
          for (var m = 0; m < coll.modes.length; m++) {
            var mode = coll.modes[m]
            var val = variable.valuesByMode[mode.modeId]
            if (val && val.type === 'VARIABLE_ALIAS' && byId[val.id]) {
              var t = byId[val.id]
              var tc = collById[t.variableCollectionId]
              perMode[mode.name] = { alias: t.name, collection: tc ? tc.name : null }
            } else if (val && typeof val.r === 'number') {
              perMode[mode.name] = {
                raw: [Math.round(val.r * 255), Math.round(val.g * 255), Math.round(val.b * 255)],
                alpha: typeof val.a === 'number' ? val.a : 1,
              }
            }
          }
          aliases[variable.name] = perMode
        }
      }

      figma.ui.postMessage({
        type: 'exported',
        payload: JSON.stringify({
          exportedFrom: figma.root.name,
          seeds: seeds,
          semantic: aliases,
          counts: { ramps: Object.keys(seeds).length, semantic: Object.keys(aliases).length },
        }, null, 2),
      })
    } catch (e) {
      figma.ui.postMessage({ type: 'error', message: String((e && e.message) || e) })
    }
  }
}

} // end: typeof figma !== 'undefined'
