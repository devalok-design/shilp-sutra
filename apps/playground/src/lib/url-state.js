const EMPTY_STATE = {
    primitives: {},
    semantic: {},
    mode: 'tokens',
    darkMode: false,
};
export function encodeState(state) {
    const overrides = {};
    if (Object.keys(state.primitives).length > 0)
        overrides.primitives = state.primitives;
    if (Object.keys(state.semantic).length > 0)
        overrides.semantic = state.semantic;
    if (state.mode !== 'tokens')
        overrides.mode = state.mode;
    if (state.darkMode)
        overrides.darkMode = true;
    if (state.component)
        overrides.component = state.component;
    if (state.props && Object.keys(state.props).length > 0)
        overrides.props = state.props;
    if (Object.keys(overrides).length === 0)
        return '';
    return btoa(JSON.stringify(overrides));
}
export function decodeState(hash) {
    if (!hash)
        return { ...EMPTY_STATE };
    try {
        const decoded = JSON.parse(atob(hash));
        return { ...EMPTY_STATE, ...decoded };
    }
    catch {
        return { ...EMPTY_STATE };
    }
}
export function getStateFromUrl() {
    const hash = window.location.hash.slice(1); // remove '#'
    return decodeState(hash);
}
export function setStateToUrl(state) {
    const encoded = encodeState(state);
    window.history.replaceState(null, '', encoded ? `#${encoded}` : window.location.pathname);
}
