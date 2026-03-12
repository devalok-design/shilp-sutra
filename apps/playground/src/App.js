import { jsx as _jsx } from "react/jsx-runtime";
import { Layout } from './components/Layout';
import { ShareBar } from './components/ShareBar';
import { TokenEditor } from './components/TokenEditor/TokenEditor';
import { ComponentSandbox } from './components/ComponentSandbox/ComponentSandbox';
import { SandboxPreview } from './components/ComponentSandbox/SandboxPreview';
import { Preview } from './components/Preview/Preview';
import { usePlaygroundState } from './lib/use-playground-state';
export function App() {
    const pg = usePlaygroundState();
    return (_jsx(Layout, { mode: pg.state.mode, onModeChange: pg.setMode, darkMode: pg.state.darkMode, onToggleDarkMode: pg.toggleDarkMode, topBarActions: _jsx(ShareBar, { state: pg.state, onResetAll: pg.resetAll }), sidebar: pg.state.mode === 'tokens' ? (_jsx(TokenEditor, { primitives: pg.state.primitives, semantic: pg.state.semantic, onChangePrimitive: pg.setPrimitive, onChangeSemantic: pg.setSemantic, onResetToken: pg.resetToken })) : (_jsx(ComponentSandbox, { selectedComponent: pg.state.component, componentProps: pg.state.props || {}, onSelectComponent: pg.setComponent, onChangeProps: pg.setProps })), preview: _jsx(Preview, { mode: pg.state.mode, sandboxContent: _jsx(SandboxPreview, { selectedComponent: pg.state.component, componentProps: pg.state.props || {} }) }) }));
}
