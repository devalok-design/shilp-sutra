export function generateCssExport(state) {
    const lines = [
        '/* shilp-sutra token overrides — generated from playground */',
        ':root {',
    ];
    // Primitive overrides (color scales)
    for (const [prop, value] of Object.entries(state.primitives)) {
        lines.push(`  ${prop}: ${value};`);
    }
    // Semantic overrides
    for (const [prop, value] of Object.entries(state.semantic)) {
        lines.push(`  ${prop}: ${value};`);
    }
    lines.push('}');
    return lines.join('\n');
}
export function generateJsonExport(state) {
    return JSON.stringify({ primitives: state.primitives, semantic: state.semantic }, null, 2);
}
