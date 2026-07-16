import { resolve } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

function closingIndex(source, start, open, close) {
  let depth = 0
  let quote = null
  for (let index = start; index < source.length; index += 1) {
    const character = source[index]
    if (quote) {
      if (character === quote && source[index - 1] !== '\\') quote = null
    } else if (character === '"' || character === "'") {
      quote = character
    } else if (character === open) {
      depth += 1
    } else if (character === close && --depth === 0) {
      return index
    }
  }
  throw new Error('Unclosed layout source')
}

function updateContentLayout(source, layout) {
  for (const [key, values] of Object.entries(layout).sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))) {
    const match = /^(\d+):(\d+)$/.exec(key)
    if (!match || !['x', 'top', 'width'].every((field) => Number.isFinite(values[field]))) throw new Error('Invalid layout')

    const imageLists = [...source.matchAll(/\bimages:\s*\[/g)]
    const list = imageLists[Number(match[1])]
    if (!list) throw new Error('Image section not found')
    const listStart = list.index + list[0].length - 1
    const listEnd = closingIndex(source, listStart, '[', ']')
    const imageObjects = []
    for (let index = listStart + 1; index < listEnd; index += 1) {
      if (source[index] === '{') {
        const end = closingIndex(source, index, '{', '}')
        imageObjects.push([index, end + 1])
        index = end
      }
    }
    const image = imageObjects[Number(match[2])]
    if (!image) throw new Error('Image not found')

    const object = source.slice(...image)
    const updated = ['x', 'top', 'width'].reduce((result, field) => {
      const pattern = new RegExp(`\\b${field}:\\s*-?\\d+(?:\\.\\d+)?`)
      if (!pattern.test(result)) throw new Error(`Missing ${field}`)
      return result.replace(pattern, `${field}: ${values[field]}`)
    }, object)
    source = source.slice(0, image[0]) + updated + source.slice(image[1])
  }
  return source
}

function designEditor() {
  const contentFile = resolve(import.meta.dirname, 'src/lib/content.ts')
  return {
    name: 'design-image-editor',
    configureServer(server) {
      server.middlewares.use('/__design-layout', (request, response, next) => {
        if (request.method !== 'POST') return next()
        let body = ''
        request.on('data', (chunk) => (body += chunk))
        request.on('end', async () => {
          try {
            const layout = JSON.parse(body)
            if (!layout || Array.isArray(layout)) throw new Error('Expected an object')
            const content = await readFile(contentFile, 'utf8')
            const updated = updateContentLayout(content, layout)
            if (updated !== content) await writeFile(contentFile, updated)
            response.writeHead(204).end()
          } catch {
            response.writeHead(400).end('Invalid layout')
          }
        })
      })
    },
  }
}

export default defineConfig({
  publicDir: 'src/lib/img',
  define: {
    ASSET_BASE: JSON.stringify(
      process.env.RELEASE === 'prod'
        ? 'https://projects.twreporter.org/twreporter/ddd/2026-07-kodokushi/'
        : '/',
    ),
  },
  plugins: [
    designEditor(),
    svelte({
      dynamicCompileOptions: ({ filename }) =>
        filename.endsWith('.wc.svelte') ? { customElement: true } : {},
    }),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/web-components.js'),
      formats: ['umd'],
      name: 'TwreporterDynamicLayout',
      fileName: () => 'dynamicLayout.js',
    },
  },
})
