import { mkdir, writeFile } from 'node:fs/promises'
import { electionBatches } from '../src/lib/batches/index.ts'

const outputDirectory = new URL('../generated/', import.meta.url)
await mkdir(outputDirectory, { recursive: true })
await Promise.all(
  electionBatches.map(({ configUrl, defaults }) =>
    writeFile(
      new URL(configUrl, outputDirectory),
      JSON.stringify(defaults, null, 2) + '\n',
    ),
  ),
)
