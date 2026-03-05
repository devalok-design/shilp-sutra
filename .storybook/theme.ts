import { create } from '@storybook/theming/create'

export default create({
  base: 'light',
  brandTitle: 'Shilp Sutra — शिल्प सूत्र',
  brandUrl: 'https://github.com/ADevalok',
  brandTarget: '_self',

  colorPrimary: '#D33163',
  colorSecondary: '#B12651',

  appBg: '#FCF7F7',
  appContentBg: '#FFFFFF',
  appBorderColor: '#EFD5D9',
  appBorderRadius: 8,

  textColor: '#282425',
  textInverseColor: '#FCF7F7',

  barTextColor: '#6B6164',
  barSelectedColor: '#D33163',
  barBg: '#FFFFFF',

  fontBase: '"Inter", system-ui, sans-serif',
  fontCode: '"SF Mono", "Fira Code", monospace',
})
