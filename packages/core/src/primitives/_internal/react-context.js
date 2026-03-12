import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Vendored from @radix-ui/react-context
 * @see ../LICENSE
 */
import * as React from 'react';
function createContext(rootComponentName, defaultContext) {
    const Context = React.createContext(defaultContext);
    Context.displayName = rootComponentName + 'Context';
    const Provider = (props) => {
        const { children, ...context } = props;
        // eslint-disable-next-line react-hooks/exhaustive-deps
        const value = React.useMemo(() => context, Object.values(context));
        return _jsx(Context.Provider, { value: value, children: children });
    };
    Provider.displayName = rootComponentName + 'Provider';
    function useContext(consumerName) {
        const context = React.useContext(Context);
        if (context)
            return context;
        if (defaultContext !== undefined)
            return defaultContext;
        throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
    }
    return [Provider, useContext];
}
function createContextScope(scopeName, createContextScopeDeps = []) {
    let defaultContexts = [];
    function createContext(rootComponentName, defaultContext) {
        const BaseContext = React.createContext(defaultContext);
        BaseContext.displayName = rootComponentName + 'Context';
        const index = defaultContexts.length;
        defaultContexts = [...defaultContexts, defaultContext];
        const Provider = (props) => {
            const { scope, children, ...context } = props;
            const Context = scope?.[scopeName]?.[index] || BaseContext;
            // eslint-disable-next-line react-hooks/exhaustive-deps
            const value = React.useMemo(() => context, Object.values(context));
            return _jsx(Context.Provider, { value: value, children: children });
        };
        Provider.displayName = rootComponentName + 'Provider';
        function useContext(consumerName, scope) {
            const Context = scope?.[scopeName]?.[index] || BaseContext;
            const context = React.useContext(Context);
            if (context)
                return context;
            if (defaultContext !== undefined)
                return defaultContext;
            throw new Error(`\`${consumerName}\` must be used within \`${rootComponentName}\``);
        }
        return [Provider, useContext];
    }
    const createScope = () => {
        const scopeContexts = defaultContexts.map((defaultContext) => {
            return React.createContext(defaultContext);
        });
        return function useScope(scope) {
            const contexts = scope?.[scopeName] || scopeContexts;
            return React.useMemo(() => ({ [`__scope${scopeName}`]: { ...scope, [scopeName]: contexts } }), [scope, contexts]);
        };
    };
    createScope.scopeName = scopeName;
    return [createContext, composeContextScopes(createScope, ...createContextScopeDeps)];
}
function composeContextScopes(...scopes) {
    const baseScope = scopes[0];
    if (scopes.length === 1)
        return baseScope;
    const createScope = () => {
        const scopeHooks = scopes.map((createScope) => ({
            useScope: createScope(),
            scopeName: createScope.scopeName,
        }));
        return function useComposedScopes(overrideScopes) {
            const nextScopes = scopeHooks.reduce((nextScopes, { useScope, scopeName }) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const scopeProps = useScope(overrideScopes);
                const currentScope = scopeProps[`__scope${scopeName}`];
                return { ...nextScopes, ...currentScope };
            }, {});
            return React.useMemo(() => ({ [`__scope${baseScope.scopeName}`]: nextScopes }), [nextScopes]);
        };
    };
    createScope.scopeName = baseScope.scopeName;
    return createScope;
}
export { createContext, createContextScope };
