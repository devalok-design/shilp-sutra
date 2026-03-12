import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Accordion } from './Accordion';
import { ColorScaleEditor } from './ColorScaleEditor';
import { COLOR_SCALES, PRIMITIVE_DEFAULTS, SEMANTIC_GROUPS } from '../../lib/tokens';
export function TokenEditor({ primitives, semantic, onChangePrimitive, onChangeSemantic, onResetToken, }) {
    return (_jsxs("div", { className: "space-y-1", children: [_jsx(Accordion, { label: "Color Scales", description: "Pick a base color to auto-generate each scale", defaultOpen: true, hasChanges: Object.keys(primitives).length > 0, children: _jsx("div", { className: "space-y-6 pt-2", children: COLOR_SCALES.map((scale) => {
                        const scaleDefaults = {};
                        for (const [key, val] of Object.entries(PRIMITIVE_DEFAULTS)) {
                            if (key.startsWith(`--${scale}-`))
                                scaleDefaults[key] = val;
                        }
                        return (_jsx(ColorScaleEditor, { scaleName: scale, currentValues: primitives, defaults: scaleDefaults, onChangeShade: onChangePrimitive, onResetShade: onResetToken }, scale));
                    }) }) }), SEMANTIC_GROUPS.map((group) => {
                const groupHasChanges = group.tokens.some((t) => t.name in semantic);
                return (_jsx(Accordion, { label: group.label, description: group.description, hasChanges: groupHasChanges, children: _jsx("div", { className: "space-y-3 pt-2", children: group.tokens.map((token) => {
                            const isOverridden = token.name in semantic;
                            const currentValue = semantic[token.name] || token.defaultValue;
                            if (token.type === 'color') {
                                return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "w-24 text-xs text-text-secondary", children: token.label }), _jsx("input", { type: "color", value: currentValue.startsWith('#') ? currentValue : '#888888', onChange: (e) => onChangeSemantic(token.name, e.target.value), className: "h-6 w-6 cursor-pointer rounded border border-border-subtle" }), _jsx("input", { type: "text", value: currentValue, onChange: (e) => onChangeSemantic(token.name, e.target.value), className: "flex-1 rounded border border-border-subtle bg-field px-2 py-1 text-xs font-mono" }), isOverridden && (_jsx("button", { onClick: () => onResetToken(token.name), className: "text-xs text-text-tertiary hover:text-error", children: "\u21BA" }))] }, token.name));
                            }
                            // Size / number controls (slider + input)
                            return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "w-24 text-xs text-text-secondary", children: token.label }), _jsx("input", { type: "range", min: token.min ?? 0, max: token.max ?? 100, step: token.step ?? 1, value: parseFloat(currentValue) || 0, onChange: (e) => {
                                            const val = token.unit ? `${e.target.value}${token.unit}` : e.target.value;
                                            onChangeSemantic(token.name, val);
                                        }, className: "flex-1" }), _jsx("span", { className: "w-16 text-right text-xs font-mono text-text-secondary", children: currentValue }), isOverridden && (_jsx("button", { onClick: () => onResetToken(token.name), className: "text-xs text-text-tertiary hover:text-error", children: "\u21BA" }))] }, token.name));
                        }) }) }, group.label));
            })] }));
}
