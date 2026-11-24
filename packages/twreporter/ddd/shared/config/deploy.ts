import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { basename, join, posix, relative, sep } from 'node:path'
import { Storage } from '@google-cloud/storage'
import { withComponentVersion } from '../src/utils/component-name.ts'
import type { ComponentConfig } from './vite.ts'

const immutable = 'public, max-age=31536000, immutable'
const noCache = 'no-cache'
const createOnly = { ifGenerationMatch: 0 }

function ignoreMissingObject(cause: unknown) {
  if (cause instanceof Error && 'code' in cause && cause.code === 404) return
  throw cause
}

export async function deployProject(
  components: Record<string, ComponentConfig>,
) {
  const { BUCKET, RELEASE } = process.env
  if (
    !BUCKET?.startsWith('gs://') ||
    (RELEASE !== 'dev' && RELEASE !== 'prod')
  ) {
    throw new Error('Set BUCKET and RELEASE to a dev or prod destination.')
  }
  const production = RELEASE === 'prod'
  const bucketPath = BUCKET.replace(/^gs:\/\//, '')
  const [bucketName, ...prefix] = bucketPath.split('/')
  if (!bucketName) throw new Error('BUCKET must include the bucket name.')

  const bucket = new Storage().bucket(bucketName)
  const publicRoot = production
    ? `https://${bucketPath}`
    : `https://storage.googleapis.com/${bucketPath}`

  function uploadImmutable(path: string, destination: string) {
    return bucket.upload(path, {
      destination,
      metadata: { cacheControl: immutable },
      preconditionOpts: createOnly,
    })
  }

  const releases = await Promise.all(
    Object.entries(components).map(
      async ([name, { outputDirectory, version }]) => {
        const versioned = version !== undefined
        const directory = withComponentVersion(outputDirectory, version)
        const localDirectory = `dist/${directory}`
        const files = existsSync(localDirectory)
          ? readdirSync(localDirectory)
          : []
        const entryPrefix = `${versioned ? 'embed' : name}-`
        const archive = files.find(
          (file) =>
            file.startsWith(entryPrefix) &&
            /^\d+\.js$/.test(file.slice(entryPrefix.length)),
        )
        if (!archive) {
          throw new Error(`Build the project before deploying ${name}.`)
        }
        const destination = posix.join(...prefix, directory)
        const [entry, schema] = await Promise.all([
          versioned
            ? bucket
                .file(`${destination}/embed.js`)
                .getMetadata()
                .catch(ignoreMissingObject)
            : undefined,
          versioned && production
            ? bucket
                .file(`${destination}/schema.json`)
                .download()
                .catch(ignoreMissingObject)
            : undefined,
        ])
        const generation = entry ? entry[0].generation : 0
        if (generation === undefined)
          throw new Error(`Cannot read generation for ${directory}.`)
        const schemaFile = `${localDirectory}/schema.json`
        if (schema && !schema[0].equals(readFileSync(schemaFile))) {
          throw new Error(
            `Schema changed for ${name}. Bump its registry version.`,
          )
        }
        return {
          destination,
          archive,
          buildId: archive.slice(entryPrefix.length, -3),
          versioned,
          generation,
          schemaFile,
          publishSchema: versioned && !schema,
          artifacts: files
            .filter(
              (file) =>
                !versioned || (file !== 'embed.js' && file !== 'schema.json'),
            )
            .map((file) => `${localDirectory}/${file}`),
        }
      },
    ),
  )
  const builds = new Set(releases.map(({ buildId }) => buildId))
  const [build] = builds
  if (!build || builds.size !== 1) {
    throw new Error('Build all components together before deploying.')
  }

  for (const { artifacts, destination } of releases) {
    await Promise.all(
      artifacts.map((path) =>
        uploadImmutable(path, `${destination}/${basename(path)}`),
      ),
    )
  }
  const storybookDirectory = 'storybook-static'
  const storybookPrefix = posix.join(...prefix, 'storybook', build)
  const storybookFiles = readdirSync(storybookDirectory, {
    recursive: true,
    withFileTypes: true,
  }).filter((entry) => entry.isFile())
  await Promise.all(
    storybookFiles.map((entry) => {
      const path = join(entry.parentPath, entry.name)
      const objectName = relative(storybookDirectory, path).split(sep).join('/')
      return uploadImmutable(path, `${storybookPrefix}/${objectName}`)
    }),
  )
  for (const { destination, schemaFile, publishSchema } of releases) {
    if (publishSchema) {
      const schemaName = `${destination}/schema.json`
      if (production) {
        await uploadImmutable(schemaFile, schemaName)
      } else {
        await bucket.upload(schemaFile, {
          destination: schemaName,
          metadata: { cacheControl: noCache },
        })
      }
    }
  }

  for (const { destination, archive, versioned, generation } of releases) {
    if (versioned) {
      await bucket
        .file(`${destination}/${archive}`)
        .copy(`${destination}/embed.js`, {
          cacheControl: noCache,
          contentType: 'text/javascript; charset=utf-8',
          preconditionOpts: { ifGenerationMatch: generation },
        })
    }
  }
  console.log(`Storybook: ${publicRoot}/storybook/${build}/index.html`)
}
