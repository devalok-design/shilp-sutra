import { jsx as _jsx } from "react/jsx-runtime";
import { ComponentGrid } from './ComponentGrid';
export function Preview({ mode, sandboxContent }) {
    if (mode === 'sandbox' && sandboxContent) {
        return _jsx("div", { className: "max-w-4xl mx-auto", children: sandboxContent });
    }
    return (_jsx("div", { className: "max-w-4xl mx-auto", children: _jsx(ComponentGrid, {}) }));
}
