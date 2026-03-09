import { Layout } from './components/Layout'
import { ShareBar } from './components/ShareBar'
import { TokenEditor } from './components/TokenEditor/TokenEditor'
import { ComponentSandbox } from './components/ComponentSandbox/ComponentSandbox'
import { SandboxPreview } from './components/ComponentSandbox/SandboxPreview'
import { Preview } from './components/Preview/Preview'
import { usePlaygroundState } from './lib/use-playground-state'

export function App() {
  const pg = usePlaygroundState()

  return (
    <Layout
      mode={pg.state.mode}
      onModeChange={pg.setMode}
      darkMode={pg.state.darkMode}
      onToggleDarkMode={pg.toggleDarkMode}
      topBarActions={<ShareBar state={pg.state} onResetAll={pg.resetAll} />}
      sidebar={
        pg.state.mode === 'tokens' ? (
          <TokenEditor
            primitives={pg.state.primitives}
            semantic={pg.state.semantic}
            onChangePrimitive={pg.setPrimitive}
            onChangeSemantic={pg.setSemantic}
            onResetToken={pg.resetToken}
          />
        ) : (
          <ComponentSandbox
            selectedComponent={pg.state.component}
            componentProps={pg.state.props || {}}
            onSelectComponent={pg.setComponent}
            onChangeProps={pg.setProps}
          />
        )
      }
      preview={
        <Preview
          mode={pg.state.mode}
          sandboxContent={
            <SandboxPreview
              selectedComponent={pg.state.component}
              componentProps={pg.state.props || {}}
            />
          }
        />
      }
    />
  )
}
