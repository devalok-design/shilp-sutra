import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Accordion({ label, description, defaultOpen = false, hasChanges, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (_jsxs("div", { className: "border-b border-surface-border", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "flex w-full items-center justify-between py-3 text-left", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm font-medium text-surface-fg", children: label }), hasChanges && _jsx("span", { className: "ml-2 inline-block h-2 w-2 rounded-full bg-accent-9" }), description && _jsx("p", { className: "text-xs text-surface-fg-subtle", children: description })] }), _jsx("span", { className: "text-surface-fg-subtle text-xs", children: open ? '\u25B2' : '\u25BC' })] }), open && _jsx("div", { className: "pb-4", children: children })] }));
}
