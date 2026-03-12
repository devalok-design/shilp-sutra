import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
import { PropControl } from './PropControl';
export function ComponentSandbox({ selectedComponent, componentProps, onSelectComponent, onChangeProps, }) {
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
    const handlePropChange = (name, value) => {
        onChangeProps({ ...currentProps, [name]: value });
    };
    const codeString = useMemo(() => {
        if (!entry)
            return '';
        const propsStr = entry.props
            .filter((p) => currentProps[p.name] !== p.defaultValue && p.name !== 'children')
            .map((p) => {
            const v = currentProps[p.name];
            if (typeof v === 'boolean')
                return v ? p.name : null;
            if (typeof v === 'number')
                return `${p.name}={${v}}`;
            return `${p.name}="${v}"`;
        })
            .filter(Boolean)
            .join(' ');
        const children = currentProps.children || '';
        const hasChildren = entry.props.some((p) => p.name === 'children');
        const tag = entry.name;
        const space = propsStr ? ' ' : '';
        if (hasChildren && children) {
            return `<${tag}${space}${propsStr}>${children}</${tag}>`;
        }
        return `<${tag}${space}${propsStr} />`;
    }, [entry, currentProps]);
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium text-text-secondary mb-1", children: "Component" }), _jsxs("select", { value: selectedComponent || '', onChange: (e) => onSelectComponent(e.target.value), className: "w-full rounded border border-border-subtle bg-field px-3 py-2 text-sm", children: [_jsx("option", { value: "", disabled: true, children: "Select a component..." }), COMPONENT_REGISTRY.map((c) => (_jsx("option", { value: c.name, children: c.name }, c.name)))] })] }), entry && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "text-xs font-medium text-text-tertiary uppercase tracking-wider", children: "Props" }), entry.props.map((schema) => (_jsx(PropControl, { schema: schema, value: currentProps[schema.name], onChange: (v) => handlePropChange(schema.name, v) }, schema.name)))] })), entry && (_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h4", { className: "text-xs font-medium text-text-tertiary uppercase tracking-wider", children: "Code" }), _jsx("button", { onClick: () => navigator.clipboard.writeText(codeString), className: "text-xs text-text-link hover:text-text-link-hover", children: "Copy" })] }), _jsx("pre", { className: "rounded-md bg-layer-02 p-3 text-xs font-mono text-text-primary overflow-x-auto", children: codeString })] }))] }));
}
