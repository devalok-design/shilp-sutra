import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { generateColorScale, SHADE_STOPS } from '../../lib/color-scale';
export function ColorScaleEditor({ scaleName, currentValues, defaults, onChangeShade, onResetShade, }) {
    const base500Key = `--${scaleName}-500`;
    const currentBase = currentValues[base500Key] || defaults[base500Key] || '#888888';
    const handleBaseChange = (newBase) => {
        const scale = generateColorScale(newBase);
        for (const shade of SHADE_STOPS) {
            const prop = `--${scaleName}-${shade}`;
            onChangeShade(prop, scale[shade]);
        }
    };
    return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("label", { className: "text-xs font-medium text-text-secondary capitalize w-16", children: scaleName }), _jsx("input", { type: "color", value: currentBase, onChange: (e) => handleBaseChange(e.target.value), className: "h-8 w-8 cursor-pointer rounded border border-border-subtle" }), _jsx("input", { type: "text", value: currentBase, onChange: (e) => {
                            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                                handleBaseChange(e.target.value);
                            }
                        }, className: "w-20 rounded border border-border-subtle bg-field px-2 py-1 text-xs font-mono", placeholder: "#D33163" })] }), _jsx("div", { className: "flex gap-0.5 rounded overflow-hidden", children: SHADE_STOPS.map((shade) => {
                    const prop = `--${scaleName}-${shade}`;
                    const value = currentValues[prop] || defaults[prop] || '#888888';
                    const isOverridden = prop in currentValues;
                    return (_jsxs("div", { className: "group relative flex-1", children: [_jsx("button", { className: "w-full h-8 border-0 cursor-pointer", style: { backgroundColor: value }, title: `${prop}: ${value}`, onClick: () => {
                                    navigator.clipboard.writeText(value);
                                } }), _jsx("span", { className: "absolute bottom-[-18px] left-1/2 -translate-x-1/2 text-[9px] text-text-tertiary whitespace-nowrap", children: shade }), isOverridden && (_jsx("button", { onClick: () => onResetShade(prop), className: "absolute -top-1 -right-1 hidden group-hover:flex h-3 w-3 items-center justify-center rounded-full bg-error text-[8px] text-text-on-color", title: "Reset to default", children: "\u00D7" }))] }, shade));
                }) })] }));
}
