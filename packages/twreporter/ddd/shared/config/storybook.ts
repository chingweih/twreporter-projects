import { existsSync, globSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import type { StorybookConfig } from '@storybook/svelte-vite'

const require = createRequire(import.meta.url)

export function createStorybookConfig(
  configDirectory: string,
): StorybookConfig {
  const root = resolve(configDirectory, '..')
  const staticDirs = []
  for (const directory of ['public', 'local']) {
    const from = resolve(root, directory)
    if (existsSync(from)) {
      staticDirs.push({ from, to: directory === 'public' ? '/' : '/local' })
    }
  }

  return {
    stories: [resolve(root, 'src/**/*.stories.svelte')],
    addons: [
      dirname(require.resolve('@storybook/addon-svelte-csf/package.json')),
    ],
    framework: dirname(require.resolve('@storybook/svelte-vite/package.json')),
    viteFinal(config) {
      const componentScript = globSync('components/**/*.js', {
        cwd: resolve(root, 'dist'),
      })[0]
      const timestamp = componentScript?.match(/-(\d+)\.js$/)?.[1]

      config.define = {
        ...config.define,
        'import.meta.env.VITE_BUILD_TIMESTAMP': JSON.stringify(timestamp),
      }
      config.server = {
        ...config.server,
        watch: { ignored: ['**/local/**'] },
      }
      return config
    },
    staticDirs,
  }
}
