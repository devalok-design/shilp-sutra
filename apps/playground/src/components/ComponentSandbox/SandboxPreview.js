import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
export function SandboxPreview({ selectedComponent, componentProps }) {
    const entry = COMPONENT_REGISTRY.find((c) => c.name === selectedComponent);
    const currentProps = useMemo(() => {
        if (!entry)
            return {};
        const defaults = {};
        for (const p of entry.props) {
            defaults[p.name] = p.defaultValue;
        }
        return { ...defaults, ...componentProps };
    }, [entry, componentProps]);
    if (!entry) {
        return (_jsx("div", { className: "flex h-64 items-center justify-center text-text-tertiary text-sm", children: "Select a component from the sidebar" }));
    }
    return (_jsx("div", { className: "flex min-h-[200px] items-center justify-center rounded-lg border border-border-subtle bg-layer-01 p-8", children: entry.render(currentProps) }));
}
