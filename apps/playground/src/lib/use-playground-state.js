import { useState, useCallback, useEffect, useRef } from 'react';
import { getStateFromUrl, setStateToUrl } from './url-state';
export function usePlaygroundState() {
    const [state, setState] = useState(getStateFromUrl);
    const styleRef = useRef(null);
    // Sync state to URL hash
    useEffect(() => {
        setStateToUrl(state);
    }, [state]);
    // Apply token overrides as a <style> block on <html>
    useEffect(() => {
        if (!styleRef.current) {
            styleRef.current = document.createElement('style');
            styleRef.current.id = 'playground-overrides';
            document.head.appendChild(styleRef.current);
        }
        const lines = [':root {'];
        for (const [prop, value] of Object.entries(state.primitives)) {
            lines.push(`  ${prop}: ${value};`);
        }
        for (const [prop, value] of Object.entries(state.semantic)) {
            lines.push(`  ${prop}: ${value};`);
        }
        lines.push('}');
        styleRef.current.textContent = lines.join('\n');
        return () => {
            if (styleRef.current) {
                styleRef.current.textContent = '';
            }
        };
    }, [state.primitives, state.semantic]);
    // Dark mode toggle
    useEffect(() => {
        document.documentElement.classList.toggle('dark', state.darkMode);
    }, [state.darkMode]);
    const setPrimitive = useCallback((name, value) => {
        setState(prev => ({
            ...prev,
            primitives: { ...prev.primitives, [name]: value },
        }));
    }, []);
    const setSemantic = useCallback((name, value) => {
        setState(prev => ({
            ...prev,
            semantic: { ...prev.semantic, [name]: value },
        }));
    }, []);
    const setMode = useCallback((mode) => {
        setState(prev => ({ ...prev, mode }));
    }, []);
    const toggleDarkMode = useCallback(() => {
        setState(prev => ({ ...prev, darkMode: !prev.darkMode }));
    }, []);
    const setComponent = useCallback((component) => {
        setState(prev => ({ ...prev, component }));
    }, []);
    const setProps = useCallback((props) => {
        setState(prev => ({ ...prev, props }));
    }, []);
    const resetAll = useCallback(() => {
        setState(prev => ({ ...prev, primitives: {}, semantic: {} }));
    }, []);
    const resetToken = useCallback((name) => {
        setState(prev => {
            const { primitives, semantic } = prev;
            const newPrimitives = { ...primitives };
            const newSemantic = { ...semantic };
            delete newPrimitives[name];
            delete newSemantic[name];
            return { ...prev, primitives: newPrimitives, semantic: newSemantic };
        });
    }, []);
    return {
        state,
        setPrimitive,
        setSemantic,
        setMode,
        toggleDarkMode,
        setComponent,
        setProps,
        resetAll,
        resetToken,
    };
}
