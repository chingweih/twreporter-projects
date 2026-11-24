import { createStorybookConfig } from '@lab-reporter/ddd-shared/storybook/config'

const config = createStorybookConfig(import.meta.dirname)

export default {
  ...config,
  staticDirs: [
    ...(Array.isArray(config.staticDirs) ? config.staticDirs : []),
    '../generated',
  ],
}
