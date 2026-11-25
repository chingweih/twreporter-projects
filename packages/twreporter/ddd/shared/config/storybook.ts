import { existsSync, globSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fontStylesheetUrl } from '../src/utils/fonts.ts'
import type { StorybookConfig } from '@storybook/svelte-vite'

const require = createRequire(import.meta.url)

export function createStorybookConfig(
  configDirectory: string,
): StorybookConfig {
  const root = resolve(configDirectory, '..')
  const staticDirs = [
    {
      from: resolve(import.meta.dirname, 'storybook-assets'),
      to: '/storybook-assets',
    },
  ]
  for (const directory of ['public', 'local']) {
    const from = resolve(root, directory)
    if (existsSync(from)) {
      staticDirs.push({ from, to: directory === 'public' ? '/' : '/local' })
    }
  }

  return {
    stories: ['../src/**/*.mdx', '../src/**/*.stories.svelte'],
    addons: [
      dirname(require.resolve('@storybook/addon-docs/package.json')),
      dirname(require.resolve('@storybook/addon-svelte-csf/package.json')),
      resolve(import.meta.dirname, 'storybook-branding/preset.ts'),
    ],
    framework: dirname(require.resolve('@storybook/svelte-vite/package.json')),
    features: {
      menuOnboardingChecklist: false,
      sidebarOnboardingChecklist: false,
    },
    previewAnnotations: [
      resolve(import.meta.dirname, 'storybook-backgrounds.ts'),
    ],
    previewHead: (head) => `${head}
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
      <link rel="stylesheet" href="${fontStylesheetUrl}">
      <style>body { font-family: 'Roboto Slab', 'Noto Sans TC', sans-serif; }</style>`,
    viteFinal(config) {
      config.publicDir = false
      const timestamp = globSync('components/**/*.js', {
        cwd: resolve(root, 'dist'),
      })
        .map((file) => file.match(/-(\d+)\.js$/)?.[1])
        .find((value) => value !== undefined)

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
