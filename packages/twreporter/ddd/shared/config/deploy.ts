import { existsSync, readdirSync } from 'node:fs'
import { basename, join, posix, relative, sep } from 'node:path'
import { Storage } from '@google-cloud/storage'
import { withComponentVersion } from '../src/utils/component-name.ts'
import type { ComponentConfig } from './vite.ts'

const immutable = 'public, max-age=31536000, immutable'
const noCache = 'no-cache'

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

  function uploadArtifact(path: string, destination: string) {
    return bucket.upload(path, {
      destination,
      metadata: { cacheControl: immutable },
    })
  }

  const releases = Object.entries(components).map(
    ([name, { outputDirectory, version }]) => {
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
      return {
        destination,
        archive,
        buildId: archive.slice(entryPrefix.length, -3),
        versioned,
        schemaFile: `${localDirectory}/schema.json`,
        artifacts: files
          .filter(
            (file) =>
              !versioned || (file !== 'embed.js' && file !== 'schema.json'),
          )
          .map((file) => `${localDirectory}/${file}`),
      }
    },
  )
  const builds = new Set(releases.map(({ buildId }) => buildId))
  const [build] = builds
  if (!build || builds.size !== 1) {
    throw new Error('Build all components together before deploying.')
  }

  for (const { artifacts, destination } of releases) {
    await Promise.all(
      artifacts.map((path) =>
        uploadArtifact(path, `${destination}/${basename(path)}`),
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
      return uploadArtifact(path, `${storybookPrefix}/${objectName}`)
    }),
  )
  for (const { destination, schemaFile, versioned } of releases) {
    if (versioned) {
      await bucket.upload(schemaFile, {
        destination: `${destination}/schema.json`,
        metadata: { cacheControl: noCache },
      })
    }
  }

  for (const { destination, archive, versioned } of releases) {
    if (versioned) {
      await bucket
        .file(`${destination}/${archive}`)
        .copy(`${destination}/embed.js`, {
          cacheControl: noCache,
          contentType: 'text/javascript; charset=utf-8',
        })
    }
  }
  console.log(`Storybook: ${publicRoot}/storybook/${build}/index.html`)
}
