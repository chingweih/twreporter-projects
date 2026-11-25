import { copyFile, rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import { build } from 'vite'
import { withComponentVersion } from '../src/utils/component-name.ts'
import { createComponentConfig, type ComponentConfig } from './vite.ts'

export async function buildProject(
  components: Record<string, ComponentConfig>,
  root = process.cwd(),
): Promise<void> {
  const timestamp = Date.now()
  await rm(resolve(root, 'dist'), { recursive: true, force: true })
  for (const [name, component] of Object.entries(components)) {
    await build({
      ...createComponentConfig(name, component, { root, timestamp }),
      configFile: false,
    })
    if (component.version !== undefined) {
      const directory = resolve(
        root,
        'dist',
        withComponentVersion(component.outputDirectory, component.version),
      )
      await copyFile(
        resolve(directory, `embed-${timestamp}.js`),
        resolve(directory, 'embed.js'),
      )
    }
  }
}
