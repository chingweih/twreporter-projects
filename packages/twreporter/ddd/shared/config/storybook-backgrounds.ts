import type { Preview } from '@storybook/svelte-vite'
import { create, type ThemeVars } from 'storybook/theming'

const canvasBackground = '#f1f1f1'
const docsTheme: ThemeVars = create({
  base: 'light',
  appContentBg: canvasBackground,
})

const preview = {
  parameters: {
    backgrounds: {
      options: {
        gray: { name: 'Gray', value: canvasBackground },
      },
    },
    docs: { theme: docsTheme },
  },
  initialGlobals: {
    backgrounds: { value: 'gray' },
  },
} satisfies Preview

export default preview
