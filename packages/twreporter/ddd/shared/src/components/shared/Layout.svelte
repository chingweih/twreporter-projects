<script lang="ts">
  import {
    QueryCache,
    QueryClient,
    QueryClientProvider,
  } from '@tanstack/svelte-query'
  import type { Snippet } from 'svelte'
  import { fontStylesheetUrl } from '../../utils/fonts'

  const { children }: { children: Snippet } = $props()
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => console.error(error),
    }),
  })
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link rel="stylesheet" href={fontStylesheetUrl} />
</svelte:head>

<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/tailwindcss-preflight@1.0.1/preflight.min.css"
  crossorigin="anonymous"
/>

<QueryClientProvider client={queryClient}>
  {@render children()}
</QueryClientProvider>
