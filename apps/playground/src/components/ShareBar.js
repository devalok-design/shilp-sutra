import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { generateCssExport, generateJsonExport } from '../lib/css-export';
export function ShareBar({ state, onResetAll }) {
    const hasOverrides = Object.keys(state.primitives).length > 0 ||
        Object.keys(state.semantic).length > 0;
    const copyUrl = async () => {
        await navigator.clipboard.writeText(window.location.href);
    };
    const copyCss = async () => {
        await navigator.clipboard.writeText(generateCssExport(state));
    };
    const copyJson = async () => {
        await navigator.clipboard.writeText(generateJsonExport(state));
    };
    return (_jsxs("div", { className: "flex items-center gap-2", children: [hasOverrides && (_jsx("button", { onClick: onResetAll, className: "rounded-md px-3 py-1.5 text-sm text-surface-fg-muted hover:bg-surface-2 hover:text-surface-fg", children: "Reset All" })), _jsx("button", { onClick: copyUrl, className: "rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg", children: "Copy Link" }), _jsx("button", { onClick: copyCss, className: "rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg", children: "Export CSS" }), _jsx("button", { onClick: copyJson, className: "rounded-md border border-surface-border px-3 py-1.5 text-sm font-medium text-surface-fg-muted hover:border-surface-border-strong hover:text-surface-fg", children: "Export JSON" })] }));
}
