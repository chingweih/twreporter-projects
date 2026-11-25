import type { Preview } from '@storybook/svelte-vite'
import type { Parameters } from 'storybook/internal/types'
import { z } from 'zod'

const query = new URLSearchParams(window.location.search)
const sourceUrlsSchema = z.record(z.string(), z.url({ protocol: /^https?$/ }))
let sourceUrls: z.infer<typeof sourceUrlsSchema> | undefined
try {
  sourceUrls = sourceUrlsSchema.parse(
    JSON.parse(query.get('sources') ?? 'null'),
  )
} catch {
  sourceUrls = undefined
}

export const parameters = {
  layout: 'fullscreen',
  options: {
    storySort: {
      order: ['Components', 'Core', 'Layout', 'UI', 'Editor'],
    },
  },
} satisfies Parameters

const preview = {
  parameters,
  // Storybook rejects URLs in args. Resolve the `url` token through its
  // built-in mapping, using ordinary query parameters for the actual URLs.
  argTypes: Object.fromEntries([
    ...['src', 'config'].flatMap((field) => {
      const result = z.url({ protocol: /^https?$/ }).safeParse(query.get(field))
      return result.success ? [[field, { mapping: { url: result.data } }]] : []
    }),
    ...(sourceUrls ? [['sources', { mapping: { urls: sourceUrls } }]] : []),
  ]),
} satisfies Preview

export default preview
