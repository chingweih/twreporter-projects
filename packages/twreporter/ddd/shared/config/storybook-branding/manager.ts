import { addons } from 'storybook/manager-api'
import { themes } from 'storybook/theming'

addons.setConfig({
  theme: {
    ...themes.normal,
    brandTitle: 'Data Reporter',
    brandImage: './storybook-assets/data-reporter.svg',
  },
})
