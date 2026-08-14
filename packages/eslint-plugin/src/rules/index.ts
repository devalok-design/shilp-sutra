/**
 * Rule registry — single import surface for both `src/index.ts` (the plugin
 * entry) and `scripts/generate-configs.mjs` (the preset generator).
 */
import noBareShadow from './no-bare-shadow'
import noBgGradientTo from './no-bg-gradient-to'
import noCssVarBracket from './no-css-var-bracket'
import noDeprecatedButtonVariant from './no-deprecated-button-variant'
import noDeprecatedChip from './no-deprecated-chip'
import noDeprecatedShadowToken from './no-deprecated-shadow-token'
import noDeprecatedSurfaceToken from './no-deprecated-surface-token'
import noIconButtonChildren from './no-iconbutton-children'
import noTailwindConfigPreset from './no-tailwind-config-preset'
import preferPerComponentImport from './prefer-per-component-import'
import requireMutationAnnotation from './require-mutation-annotation'
import requireProgressLabel from './require-progress-label'
import toastObjectSyntax from './toast-object-syntax'
import useToastDeprecated from './use-toast-deprecated'

export const rules = {
  'no-bare-shadow': noBareShadow,
  'no-bg-gradient-to': noBgGradientTo,
  'no-css-var-bracket': noCssVarBracket,
  'no-deprecated-button-variant': noDeprecatedButtonVariant,
  'no-deprecated-chip': noDeprecatedChip,
  'no-deprecated-shadow-token': noDeprecatedShadowToken,
  'no-deprecated-surface-token': noDeprecatedSurfaceToken,
  'no-iconbutton-children': noIconButtonChildren,
  'no-tailwind-config-preset': noTailwindConfigPreset,
  'prefer-per-component-import': preferPerComponentImport,
  'require-mutation-annotation': requireMutationAnnotation,
  'require-progress-label': requireProgressLabel,
  'toast-object-syntax': toastObjectSyntax,
  'use-toast-deprecated': useToastDeprecated,
} as const
